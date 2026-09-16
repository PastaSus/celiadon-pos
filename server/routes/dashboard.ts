import { Router, Response } from 'express';
import pool from '../db';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth';

const router = Router();

// Sales performance counts as a report, so cashiers are excluded (CAP-1).
router.get('/', requireAuth, requireRole('admin', 'manager'), async (_req: AuthedRequest, res: Response) => {
  try {
    // COUNT(*) comes back from pg as bigint (a string), so cast to int.
    const { rows: productCount } = await pool.query('SELECT COUNT(*)::int AS count FROM products');
    const { rows: totalStock } = await pool.query(
      'SELECT COALESCE(SUM(stock_quantity), 0)::int AS total FROM products'
    );
    const { rows: salesCount } = await pool.query('SELECT COUNT(*)::int AS count FROM sales');
    const { rows: totalRevenue } = await pool.query(
      'SELECT COALESCE(SUM(total_amount), 0)::numeric AS total FROM sales'
    );
    const { rows: recentSales } = await pool.query(
      'SELECT * FROM sales ORDER BY transaction_date DESC LIMIT 10'
    );

    res.json({
      total_products: productCount[0].count,
      current_inventory: totalStock[0].total,
      total_sales: salesCount[0].count,
      total_revenue: totalRevenue[0].total,
      recent_sales: recentSales
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
