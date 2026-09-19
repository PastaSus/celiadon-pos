import { Router, Response } from 'express';
import pool from '../db';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth';
import type { StockMovementType } from '../../shared/types';

const router = Router();

// Types a person may record by hand. 'sale' is written by the sale transaction
// (FR28, Story 3.2), so this endpoint refuses it rather than letting a sale be
// fabricated through the stock API.
const MANUAL_TYPES: StockMovementType[] = ['restock', 'adjustment', 'return'];

// What the list may be filtered by - every type in the vocabulary, because
// 'sale' rows will exist once the sale transaction starts writing them.
const FILTER_TYPES: StockMovementType[] = [...MANUAL_TYPES, 'sale'];

// Movement history is a report, so cashiers are excluded (CAP-1, FR4) and the
// surface is kept out of their nav for the same reason.
const REPORT_ROLES = requireRole('admin', 'manager');

// List movements newest first, joined to the product name and the responsible
// user's email so the surface can answer who, why, and when in one request
// (FR26). Filtering happens here rather than in the client: movement history
// grows without bound, so it is never all loaded to be filtered afterwards.
router.get('/movements', requireAuth, REPORT_ROLES, async (req: AuthedRequest, res: Response) => {
  try {
    // Only fixed fragments and placeholder indexes are interpolated into the
    // SQL below; every value travels in the params array (AD-2).
    const conditions: string[] = [];
    const params: unknown[] = [];

    const rawProduct = typeof req.query.product_id === 'string' ? req.query.product_id : '';
    if (rawProduct !== '') {
      // A non-numeric id would reach pg as garbage and surface as a 500.
      if (!/^\d+$/.test(rawProduct)) {
        res.status(400).json({ error: 'product_id must be a positive integer' });
        return;
      }
      params.push(Number(rawProduct));
      conditions.push(`sm.product_id = $${params.length}`);
    }

    const rawType = typeof req.query.type === 'string' ? req.query.type : '';
    if (rawType !== '') {
      if (!FILTER_TYPES.includes(rawType as StockMovementType)) {
        res.status(400).json({ error: 'type must be one of sale, restock, adjustment, return' });
        return;
      }
      params.push(rawType);
      conditions.push(`sm.type = $${params.length}`);
    }

    const rawSearch = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    if (rawSearch !== '') {
      // LIKE wildcards in the term are escaped so a literal % or _ never acts
      // as one, matching the products route's search contract.
      const term = rawSearch.replace(/([\\%_])/g, '\\$1');
      params.push(`%${term}%`);
      conditions.push(`p.name ILIKE $${params.length} ESCAPE '\\'`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT sm.id, sm.product_id, sm.type, sm.quantity, sm.reason, sm.user_id, sm.created_at,
              p.name AS product_name, u.email AS user_email
         FROM stock_movements sm
         JOIN products p ON p.id = sm.product_id
    LEFT JOIN users u ON u.id = sm.user_id
              ${where}
        ORDER BY sm.created_at DESC, sm.id DESC`,
      params
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ error: 'Failed to fetch stock movements' });
  }
});

// Record a restock, adjustment, or return.
//
// The caller sends the quantity the product should have *afterwards*
// (EXPERIENCE.md Flow 2: "entering the new quantity with a reason"); the row
// stores the delta, which is what FR24 asks a movement to carry. Entering the
// counted total rather than a difference is also how a stocktake actually
// works, and it removes the sign question from the person at the shelf.
router.post('/movements', requireAuth, REPORT_ROLES, async (req: AuthedRequest, res: Response) => {
  // One dedicated client, so the quantity and its movement are one unit of work
  // (AD-3): a recorded movement must never describe a change that did not
  // happen, and a change must never go unrecorded.
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { product_id, type, quantity, reason } = req.body;

    if (!Number.isInteger(product_id)) {
      await client.query('ROLLBACK');
      res.status(400).json({ error: 'product_id must be an integer' });
      return;
    }
    if (!MANUAL_TYPES.includes(type)) {
      await client.query('ROLLBACK');
      res.status(400).json({ error: 'type must be one of restock, adjustment, return' });
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 0) {
      await client.query('ROLLBACK');
      res.status(400).json({ error: 'quantity must be an integer >= 0' });
      return;
    }
    const note = typeof reason === 'string' ? reason.trim() : '';
    if (note === '') {
      await client.query('ROLLBACK');
      res.status(400).json({ error: 'A reason is required' });
      return;
    }

    // FOR UPDATE holds the row for the rest of the transaction, so a concurrent
    // sale cannot land between this read and the write below.
    const { rows: current } = await client.query(
      'SELECT name, stock_quantity FROM products WHERE id = $1 FOR UPDATE',
      [product_id]
    );
    const product = current[0] as { name: string; stock_quantity: number } | undefined;
    if (!product) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const delta = quantity - product.stock_quantity;
    if (delta === 0) {
      await client.query('ROLLBACK');
      res.status(400).json({
        error: `${product.name} is already at ${product.stock_quantity}; nothing to record`
      });
      return;
    }
    // A restock or return that removes stock is a mislabeled row, which is the
    // exact kind of lie this table exists to prevent.
    if (delta < 0 && type !== 'adjustment') {
      await client.query('ROLLBACK');
      res.status(400).json({
        error: `A ${type} must increase the quantity; record an adjustment to reduce it`
      });
      return;
    }

    await client.query('UPDATE products SET stock_quantity = $1, updated_at = NOW() WHERE id = $2', [
      quantity,
      product_id
    ]);
    const { rows } = await client.query(
      `INSERT INTO stock_movements (product_id, type, quantity, reason, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [product_id, type, delta, note, req.user!.id]
    );

    await client.query('COMMIT');
    // The bare row has no joined product name or user email; the surface
    // refetches the list, so a partial row is never rendered.
    res.status(201).json(rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error recording stock movement:', error);
    res.status(500).json({ error: 'Failed to record stock movement' });
  } finally {
    client.release();
  }
});

export default router;
