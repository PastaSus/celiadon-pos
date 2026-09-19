import { Router, Response } from 'express';
import pool from '../db';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth';
import type { PaymentMethod, RevenueGranularity } from '../../shared/types';

const router = Router();

const VALID_GRANULARITIES: RevenueGranularity[] = ['daily', 'weekly', 'monthly'];

// Trunc/interval pairs are static SQL fragments selected by allowlisted key —
// user input never interpolates into the query text (AD-1). Dates travel as
// $1/$2 placeholders with inclusive endpoints; buckets use date_trunc in the
// DB session timezone (UTC).
const GRANULARITY_SQL: Record<RevenueGranularity, { trunc: string; interval: string }> = {
  daily: { trunc: 'day', interval: '1 day' },
  weekly: { trunc: 'week', interval: '1 week' },
  monthly: { trunc: 'month', interval: '1 month' },
};

function windowForGranularity(granularity: RevenueGranularity): { start: string; end: string } {  const end = new Date();
  const start = new Date(end);
  if (granularity === 'monthly') {
    // Anchor to the first of the month 11 months back so the default view is
    // exactly 12 monthly buckets oldest-first.
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(1);
    start.setUTCMonth(start.getUTCMonth() - 11);
  } else {
    // Daily/weekly share the same fixed 12-month window, anchored on UTC
    // midnight like the monthly branch so edges never shift with the server
    // offset and the first bucket is never partial.
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCMonth(start.getUTCMonth() - 12);
  }
  return { start: start.toISOString(), end: end.toISOString() };
}

// Optional ?from&?to (ISO calendar days, inclusive) narrow the fixed window.
// Story 4.3 owns ranges; omitted, malformed, or inverted values keep the
// fallback so the endpoint never errors on its window.
function parseRange(
  query: { from?: unknown; to?: unknown },
  fallback: { start: string; end: string }
): { start: string; end: string } {
  if (typeof query.from === 'string' && query.from.length > 0 && typeof query.to === 'string' && query.to.length > 0) {
    const start = new Date(
      query.from.length === 10 ? `${query.from}T00:00:00.000Z` : query.from
    );
    const end = new Date(
      query.to.length === 10 ? `${query.to}T23:59:59.999Z` : query.to
    );
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
      return { start: start.toISOString(), end: end.toISOString() };
    }
  }
  return fallback;
}

// Revenue-over-time for the dashboard chart (Story 4.1). Optional ?from&?to
// narrow the fixed 12-month window (Story 4.3); granularity only changes
// bucketing. Zero-filled buckets oldest-first; sales-less windows return
// all-zero buckets.
router.get(
  '/revenue-trend',
  requireAuth,
  requireRole('admin', 'manager'),
  async (req: AuthedRequest, res: Response) => {
    const raw: unknown = req.query.granularity;
    if (typeof raw !== 'undefined' && typeof raw !== 'string') {
      res.status(400).json({ error: `Invalid granularity "${String(raw)}" (daily, weekly, or monthly)` });
      return;
    }
    const granularity: RevenueGranularity =
      typeof raw === 'string' && raw.length > 0 ? (raw as RevenueGranularity) : 'monthly';

    if (!VALID_GRANULARITIES.includes(granularity)) {
      res.status(400).json({ error: `Invalid granularity "${raw}" (daily, weekly, or monthly)` });
      return;
    }

    const { trunc, interval } = GRANULARITY_SQL[granularity];
    const { start, end } = parseRange(req.query, windowForGranularity(granularity));

    // A daily bucket per day is only readable over short spans; longer ranges
    // belong to coarser granularities. The 12-month fallback always passes.
    if (
      granularity === 'daily' &&
      new Date(end).getTime() - new Date(start).getTime() > 366 * 86400000
    ) {
      res.status(400).json({ error: 'Daily granularity supports ranges up to 366 days' });
      return;
    }

    try {
      const { rows } = await pool.query(
        `SELECT series.bucket AS bucket, COALESCE(SUM(s.total_amount), 0)::float AS revenue
         FROM generate_series(
           date_trunc('${trunc}', $1::timestamptz),
           date_trunc('${trunc}', $2::timestamptz),
           INTERVAL '${interval}'
         ) AS series(bucket)
         LEFT JOIN sales s
           ON date_trunc('${trunc}', s.transaction_date) = series.bucket
           AND s.transaction_date >= $1::timestamptz
           AND s.transaction_date <= $2::timestamptz
         GROUP BY series.bucket
         ORDER BY series.bucket ASC`,
        [start, end]
      );

      const data = rows.map((row: { bucket: Date | string; revenue: number }) => ({
        bucket: row.bucket instanceof Date ? row.bucket.toISOString() : String(row.bucket),
        revenue: Number(row.revenue)
      }));

      res.json({ data });
    } catch (error) {
      console.error('Error fetching revenue trend:', error);
      res.status(500).json({ error: 'Failed to fetch revenue trend' });
    }
  }
);

// Top 5 products by revenue over the trend chart's window, narrowed by the
// same optional ?from&?to (Story 4.2, ranges Story 4.3).
router.get(
  '/top-products',
  requireAuth,
  requireRole('admin', 'manager'),
  async (req: AuthedRequest, res: Response) => {
    const { start, end } = parseRange(req.query, windowForGranularity('monthly'));

    try {
      const { rows } = await pool.query(
        `SELECT p.id AS product_id, p.name AS product_name,
                SUM(sd.quantity)::int AS quantity,
                COALESCE(SUM(sd.subtotal), 0)::float AS revenue
         FROM sales_details sd
         JOIN products p ON p.id = sd.product_id
         JOIN sales s ON s.id = sd.sale_id
         WHERE s.transaction_date >= $1::timestamptz
           AND s.transaction_date <= $2::timestamptz
         GROUP BY p.id, p.name
         ORDER BY revenue DESC, p.name ASC
         LIMIT 5`,
        [start, end]
      );

      const data = rows.map(
        (row: { product_id: number; product_name: string; quantity: number; revenue: number }) => ({
          product_id: Number(row.product_id),
          product_name: row.product_name,
          quantity: Number(row.quantity),
          revenue: Number(row.revenue)
        })
      );

      res.json({ data });
    } catch (error) {
      console.error('Error fetching top products:', error);
      res.status(500).json({ error: 'Failed to fetch top products' });
    }
  }
);

// Revenue split by payment method over the trend chart's window, narrowed by
// the same optional ?from&?to (Story 4.2, ranges Story 4.3).
// Legacy NULL methods are excluded so the three shares sum to 100%.
router.get(
  '/payment-mix',
  requireAuth,
  requireRole('admin', 'manager'),
  async (req: AuthedRequest, res: Response) => {
    const { start, end } = parseRange(req.query, windowForGranularity('monthly'));

    try {
      const { rows } = await pool.query(
        `SELECT s.payment_method AS method,
                COUNT(*)::int AS transactions,
                COALESCE(SUM(s.total_amount), 0)::float AS revenue
         FROM sales s
         WHERE s.transaction_date >= $1::timestamptz
           AND s.transaction_date <= $2::timestamptz
           AND s.payment_method IS NOT NULL
         GROUP BY s.payment_method
         ORDER BY s.payment_method`,
        [start, end]
      );

      const data = rows.map(
        (row: { method: PaymentMethod; transactions: number; revenue: number }) => ({
          method: row.method,
          transactions: Number(row.transactions),
          revenue: Number(row.revenue)
        })
      );

      res.json({ data });
    } catch (error) {
      console.error('Error fetching payment mix:', error);
      res.status(500).json({ error: 'Failed to fetch payment mix' });
    }
  }
);

// Key numbers for the chosen period (Story 4.3). Same optional ?from&?to,
// same guards; average is derived in JS so a zero-transaction window reads 0,
// not NULL.
router.get(
  '/summary',
  requireAuth,
  requireRole('admin', 'manager'),
  async (req: AuthedRequest, res: Response) => {
    const { start, end } = parseRange(req.query, windowForGranularity('monthly'));

    try {
      const { rows } = await pool.query(
        `SELECT (SELECT COUNT(*)::int FROM sales s
                 WHERE s.transaction_date >= $1::timestamptz
                   AND s.transaction_date <= $2::timestamptz) AS transaction_count,
                (SELECT COALESCE(SUM(s.total_amount), 0)::float FROM sales s
                 WHERE s.transaction_date >= $1::timestamptz
                   AND s.transaction_date <= $2::timestamptz) AS total_revenue,
                (SELECT COALESCE(SUM(sd.quantity), 0)::int FROM sales_details sd
                 JOIN sales s ON s.id = sd.sale_id
                 WHERE s.transaction_date >= $1::timestamptz
                   AND s.transaction_date <= $2::timestamptz) AS items_sold`,
        [start, end]
      );

      const row = rows[0] as { transaction_count: number; total_revenue: number; items_sold: number };
      const transaction_count = Number(row.transaction_count);
      const total_revenue = Number(row.total_revenue);

      res.json({
        data: {
          total_revenue,
          transaction_count,
          average_sale: transaction_count > 0 ? total_revenue / transaction_count : 0,
          items_sold: Number(row.items_sold)
        }
      });
    } catch (error) {
      console.error('Error fetching summary:', error);
      res.status(500).json({ error: 'Failed to fetch summary' });
    }
  }
);

export default router;
