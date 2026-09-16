const API_BASE = '/api';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: number;
  receipt_number: string;
  total_amount: number;
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
