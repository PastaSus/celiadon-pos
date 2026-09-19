import { Router, Response } from 'express';
import pool from '../db';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth';
import type { PaymentMethod } from '../../shared/types';

const router = Router();

// Generate unique receipt number
function generateReceiptNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RCP-${dateStr}-${random}`;
}

const VALID_PAYMENT_METHODS: PaymentMethod[] = ['cash', 'card', 'e-wallet'];

// Any authenticated role may sell (CAP-1); only the receipt of the record
// changes with the caller, never the permission.

// Create sale (complete transaction)
router.post('/', requireAuth, async (req: AuthedRequest, res: Response) => {
  // pool.connect() hands out one dedicated client, so every statement between
  // BEGIN and COMMIT in this function sees the same rows (AD-3).
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { items, payment_method } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      await client.query('ROLLBACK');
      res.status(400).json({ error: 'Items array is required and cannot be empty' });
      return;
    }

    for (const [index, item] of items.entries()) {
      if (
        !item ||
        !Number.isInteger(item.product_id) ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        await client.query('ROLLBACK');
        res
          .status(400)
          .json({ error: `Item ${index}: product_id and a positive integer quantity are required` });
        return;
      }
    }

    const method: PaymentMethod | null = VALID_PAYMENT_METHODS.includes(payment_method)
      ? (payment_method as PaymentMethod)
      : null;

    if (method === null) {
      await client.query('ROLLBACK');
      if (payment_method === undefined || payment_method === null || payment_method === '') {
        res.status(400).json({ error: 'payment_method is required (cash, card, or e-wallet)' });
      } else {
        res.status(400).json({ error: `Invalid payment_method "${payment_method}" (cash, card, or e-wallet)` });
      }
      return;
    }

    // Calculate total and verify stock. FOR UPDATE holds every sold row for
    // the rest of this transaction, so two concurrent checkouts cannot both
    // pass the stock check before either decrements (FR28, NFR4).
    let totalAmount = 0;
    const productIds = items.map((item: any) => item.product_id);
    // The old driver expanded an array placeholder automatically; pg needs
    // an explicit array, so the ids arrive as one $1 typed as int[] instead.
    const { rows: products } = await client.query(
      'SELECT * FROM products WHERE id = ANY($1::int[]) FOR UPDATE',
      [productIds]
    );
    const productMap = new Map(products.map((p: any) => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: `Product ${item.product_id} not found` });
        return;
      }
      if (product.stock_quantity < item.quantity) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: `Insufficient stock for ${product.name}` });
        return;
      }
      totalAmount += Number(product.price) * item.quantity;
    }

    // Create sale record
    const receiptNumber = generateReceiptNumber();
    const { rows: saleRows } = await client.query(
      'INSERT INTO sales (receipt_number, total_amount, payment_method, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [receiptNumber, totalAmount, method, req.user!.id]
    );
    const saleId = saleRows[0].id;

    // Create sale details, decrement stock, and record the movement. All
    // three writes share this transaction, so a failed sale leaves no partial
    // rows behind (FR28). The movement carries the 2.5 row shape — product,
    // type, signed delta, reason, user, timestamp — with type 'sale' and a
    // negative quantity, which 2.5's list already filters and renders.
    for (const item of items) {
      const product = productMap.get(item.product_id)!;
      const unitPrice = Number(product.price);
      await client.query(
        'INSERT INTO sales_details (sale_id, product_id, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5)',
        [saleId, item.product_id, item.quantity, unitPrice, unitPrice * item.quantity]
      );
      await client.query('UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2', [
        item.quantity,
        item.product_id
      ]);
      await client.query(
        'INSERT INTO stock_movements (product_id, type, quantity, reason, user_id) VALUES ($1, $2, $3, $4, $5)',
        [item.product_id, 'sale', -item.quantity, `Sale ${receiptNumber}`, req.user!.id]
      );
    }

    await client.query('COMMIT');

    // Return created sale
    const { rows: sale } = await pool.query('SELECT * FROM sales WHERE id = $1', [saleId]);
    const { rows: details } = await pool.query('SELECT * FROM sales_details WHERE sale_id = $1', [
      saleId
    ]);

    res.status(201).json({
      ...sale[0],
      items: details
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating sale:', error);
    res.status(500).json({ error: 'Failed to create sale' });
  } finally {
    client.release();
  }
});

// Get all sales
router.get('/', requireAuth, async (_req: AuthedRequest, res: Response) => {
  try {
    const { rows: sales } = await pool.query('SELECT * FROM sales ORDER BY transaction_date DESC');
    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Get sale details
router.get('/:id', requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const { rows: sales } = await pool.query('SELECT * FROM sales WHERE id = $1', [req.params.id]);
    if (sales.length === 0) {
      res.status(404).json({ error: 'Sale not found' });
      return;
    }
    const { rows: details } = await pool.query(
      `SELECT sd.*, p.name as product_name 
       FROM sales_details sd 
       JOIN products p ON sd.product_id = p.id 
       WHERE sd.sale_id = $1`,
      [req.params.id]
    );
    res.json({ ...sales[0], items: details });
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({ error: 'Failed to fetch sale' });
  }
});

export default router;

