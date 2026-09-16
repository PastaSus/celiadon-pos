import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

// Generate unique receipt number
function generateReceiptNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RCP-${dateStr}-${random}`;
}

// Create sale (complete transaction)
router.post('/', async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required and cannot be empty' });
    }

    // Calculate total and verify stock
    let totalAmount = 0;
    const productIds = items.map((item: any) => item.product_id);
    const [products] = await pool.query('SELECT * FROM products WHERE id IN (?)', [productIds]);
    const productMap = new Map((products as any[]).map(p => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        await connection.rollback();
        return res.status(400).json({ error: `Product ${item.product_id} not found` });
      }
      if (product.stock_quantity < item.quantity) {
        await connection.rollback();
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
      totalAmount += product.price * item.quantity;
    }

    // Create sale record
    const receiptNumber = generateReceiptNumber();
    const [saleResult] = await connection.query(
      'INSERT INTO sales (receipt_number, total_amount) VALUES (?, ?)',
      [receiptNumber, totalAmount]
    );
    const saleId = (saleResult as any).insertId;

    // Create sale details and update stock
    for (const item of items) {
      const product = productMap.get(item.product_id)!;
      await connection.query(
        'INSERT INTO sales_details (sale_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [saleId, item.product_id, item.quantity, product.price, product.price * item.quantity]
      );
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    await connection.commit();

    // Return created sale
    const [sale] = await pool.query('SELECT * FROM sales WHERE id = ?', [saleId]);
    const [details] = await pool.query('SELECT * FROM sales_details WHERE sale_id = ?', [saleId]);

    res.status(201).json({
      ...(sale as any[])[0],
      items: details
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating sale:', error);
    res.status(500).json({ error: 'Failed to create sale' });
  } finally {
    connection.release();
  }
});

// Get all sales
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [sales] = await pool.query('SELECT * FROM sales ORDER BY transaction_date DESC');
    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Get sale details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [sale] = await pool.query('SELECT * FROM sales WHERE id = ?', [req.params.id]);
    const sales = sale as any[];
    if (sales.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    const [details] = await pool.query(
      `SELECT sd.*, p.name as product_name 
       FROM sales_details sd 
       JOIN products p ON sd.product_id = p.id 
       WHERE sd.sale_id = ?`,
      [req.params.id]
    );
    res.json({ ...sales[0], items: details });
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({ error: 'Failed to fetch sale' });
  }
});

export default router;
