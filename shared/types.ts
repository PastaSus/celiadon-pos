/**
 * Single source of truth for every type that crosses the client/server
 * boundary (AD-6). Both packages import from this file, so changing a shape
 * here surfaces a compile error in whichever side has not been updated.
 *
 * Server imports must use `import type` so tsx/esbuild erases them at runtime.
 */

export type UserRole = 'admin' | 'cashier' | 'manager';

export type PaymentMethod = 'cash' | 'card' | 'e-wallet';

export type StockMovementType = 'sale' | 'restock' | 'adjustment' | 'return';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  category_id: number | null;
  reorder_level: number;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: number;
  receipt_number: string;
  total_amount: number;
  payment_method: PaymentMethod | null;
  user_id: number | null;
  transaction_date: string;
  items?: SaleDetail[];
}

export interface SaleDetail {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_name?: string;
}

export interface StockMovement {
  id: number;
  product_id: number;
  type: StockMovementType;
  /** The signed delta, not the resulting quantity: negative means stock left. */
  quantity: number;
  reason: string | null;
  user_id: number | null;
  created_at: string;
  /* Joined for display on the list response; absent on a bare inserted row. */
  product_name?: string;
  user_email?: string | null;
}

export interface DashboardStats {
  total_products: number;
  current_inventory: number;
  total_sales: number;
  total_revenue: number;
  recent_sales: Sale[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ApiError {
  error: string;
}