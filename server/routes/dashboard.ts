import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

// Get dashboard stats
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [productCount] = await pool.query('SELECT COUNT(*) as count FROM products');
    const [totalStock] = await pool.query('SELECT COALESCE(SUM(stock_quantity), 0) as total FROM products');
    const [salesCount] = await pool.query('SELECT COUNT(*) as count FROM sales');
    const [totalRevenue] = await pool.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM sales');
    const [recentSales] = await pool.query(
      'SELECT * FROM sales ORDER BY transaction_date DESC LIMIT 10'
    );

    res.json({
      total_products: (productCount as any[])[0].count,
      current_inventory: (totalStock as any[])[0].total,
      total_sales: (salesCount as any[])[0].count,
      total_revenue: (totalRevenue as any[])[0].total,
      recent_sales: recentSales
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
