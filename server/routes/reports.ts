import { Router, Response } from 'express';
import pool from '../db';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth';
import type { RevenueGranularity } from '../../shared/types';

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

function windowForGranularity(granularity: RevenueGranularity): { start: string; end: string } {
  const end = new Date();
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

// Revenue-over-time for the dashboard chart (Story 4.1). Fixed server-side
// window (last 12 months); granularity only changes bucketing. Zero-filled
// buckets oldest-first; sales-less windows return all-zero buckets.
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
    const { start, end } = windowForGranularity(granularity);

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

export default router;
