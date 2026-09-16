import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

// Get all products
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    const products = rows as any[];
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(products[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, price, stock_quantity } = req.body;
    if (!name || price === undefined || stock_quantity === undefined) {
      return res.status(400).json({ error: 'Name, price, and stock_quantity are required' });
    }
    const [result] = await pool.query(
      'INSERT INTO products (name, price, stock_quantity) VALUES (?, ?, ?)',
      [name, price, stock_quantity]
    );
    const insertId = (result as any).insertId;
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [insertId]);
    res.status(201).json((rows as any[])[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, price, stock_quantity } = req.body;
    if (!name || price === undefined || stock_quantity === undefined) {
      return res.status(400).json({ error: 'Name, price, and stock_quantity are required' });
    }
    await pool.query(
      'UPDATE products SET name = ?, price = ?, stock_quantity = ? WHERE id = ?',
      [name, price, stock_quantity, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    const products = rows as any[];
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(products[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
