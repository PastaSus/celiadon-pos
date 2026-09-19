import { Router, Response } from 'express';
import pool from '../db';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth';
import type { Product } from '../../shared/types';

const router = Router();

// Shared by POST and PUT: the body carries the full record in both cases,
// so one validator keeps the two routes from drifting apart.
function validateProductBody(
  body: any
): { name: string; price: number; stock_quantity: number } | string {
  const { name, price, stock_quantity } = body;
  if (name === undefined || price === undefined || stock_quantity === undefined) {
    return 'Name, price, and stock_quantity are required';
  }
  // Only finite numbers >= 0 reach the DECIMAL column (a NaN would throw a
  // pg error that surfaces as a 500 instead of a 400).
  if (
    typeof name !== 'string' ||
    name.trim() === '' ||
    typeof price !== 'number' ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(stock_quantity) ||
    stock_quantity < 0
  ) {
    return 'Name must be non-empty; price must be a number >= 0; stock_quantity must be an integer >= 0';
  }
  return { name, price, stock_quantity };
}

// Cashiers may read products because the POS grid needs them, but only admins
// and managers may mutate inventory (CAP-1).

// Get all products, optionally narrowed by a case-insensitive name search.
// LIKE wildcards in the term are escaped so a literal % or _ never acts as
// one; a missing or blank search returns the full list.
router.get('/', requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const rawSearch = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    if (rawSearch === '') {
      const { rows } = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
      res.json(rows);
      return;
    }
    const term = rawSearch.replace(/([\\%_])/g, '\\$1');
    const { rows } = await pool.query(
      "SELECT * FROM products WHERE name ILIKE $1 ESCAPE '\\' ORDER BY created_at DESC",
      [`%${term}%`]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    const product = rows[0] as Product | undefined;
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product
router.post(
  '/',
  requireAuth,
  requireRole('admin', 'manager'),
  async (req: AuthedRequest, res: Response) => {
    try {
      const valid = validateProductBody(req.body);
      if (typeof valid === 'string') {
        res.status(400).json({ error: valid });
        return;
      }
      const { category_id, reorder_level } = req.body;
      // reorder_level is optional; when present it must be a non-negative
      // integer so the DEFAULT 10 survives an explicit `reorder_level: 0`.
      const reorderInt =
        reorder_level === undefined || reorder_level === null ? 10 : reorder_level;
      if (!Number.isInteger(reorderInt) || reorderInt < 0) {
        res.status(400).json({ error: 'reorder_level must be an integer >= 0' });
        return;
      }
      // category_id is optional; when present it must be an integer so pg
      // never sees a string in the INT column (which surfaces as a 500).
      const categoryInt = category_id === undefined || category_id === null ? null : category_id;
      if (categoryInt !== null && !Number.isInteger(categoryInt)) {
        res.status(400).json({ error: 'category_id must be an integer or null' });
        return;
      }
      const { rows } = await pool.query(
        `INSERT INTO products (name, price, stock_quantity, category_id, reorder_level)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [valid.name.trim(), valid.price, valid.stock_quantity, categoryInt, reorderInt]
      );
      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
);

// Update product
router.put(
  '/:id',
  requireAuth,
  requireRole('admin', 'manager'),
  async (req: AuthedRequest, res: Response) => {
    try {
      const valid = validateProductBody(req.body);
      if (typeof valid === 'string') {
        res.status(400).json({ error: valid });
        return;
      }
      const { category_id, reorder_level } = req.body;
      const reorderInt =
        reorder_level === undefined || reorder_level === null ? 10 : reorder_level;
      if (!Number.isInteger(reorderInt) || reorderInt < 0) {
        res.status(400).json({ error: 'reorder_level must be an integer >= 0' });
        return;
      }
      const categoryInt = category_id === undefined || category_id === null ? null : category_id;
      if (categoryInt !== null && !Number.isInteger(categoryInt)) {
        res.status(400).json({ error: 'category_id must be an integer or null' });
        return;
      }
      // A changed quantity is a stock change, so it has to be recorded (FR24).
      // Both writes share one transaction (AD-3) so the history can never
      // disagree with the product row it describes, and an unchanged quantity
      // records nothing.
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // FOR UPDATE locks the row and supplies the previous quantity the delta
        // is measured against; it is also how a missing product is detected
        // before anything is written.
        const { rows: existing } = await client.query(
          'SELECT stock_quantity FROM products WHERE id = $1 FOR UPDATE',
          [req.params.id]
        );
        const previous = existing[0] as { stock_quantity: number } | undefined;
        if (!previous) {
          await client.query('ROLLBACK');
          res.status(404).json({ error: 'Product not found' });
          return;
        }
        // PostgreSQL has no ON UPDATE CURRENT_TIMESTAMP, so updated_at is set here.
        const { rows } = await client.query(
          `UPDATE products
              SET name = $1, price = $2, stock_quantity = $3, category_id = $4,
                  reorder_level = $5, updated_at = NOW()
            WHERE id = $6
        RETURNING *`,
          [
            valid.name.trim(),
            valid.price,
            valid.stock_quantity,
            categoryInt,
            reorderInt,
            req.params.id
          ]
        );
        const product = rows[0] as Product;
        const delta = product.stock_quantity - previous.stock_quantity;
        if (delta !== 0) {
          await client.query(
            `INSERT INTO stock_movements (product_id, type, quantity, reason, user_id)
             VALUES ($1, 'adjustment', $2, $3, $4)`,
            [product.id, delta, 'Stock edited in Inventory', req.user!.id]
          );
        }
        await client.query('COMMIT');
        res.json(product);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  }
);

// Delete product
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin', 'manager'),
  async (req: AuthedRequest, res: Response) => {
    try {
      const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
      if (rowCount === 0) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  }
);

export default router;
