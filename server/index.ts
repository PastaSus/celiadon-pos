import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import productsRouter from './routes/products';
import categoriesRouter from './routes/categories';
import salesRouter from './routes/sales';
import dashboardRouter from './routes/dashboard';
import stockRouter from './routes/stock';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/sales', salesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/stock', stockRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Vercel runs this file as a serverless function, not a long-lived process:
// there is no port to listen on, so only listen when run directly (local dev,
// `npm run dev` / `npm start`). Under Vercel the exported app handles requests.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
