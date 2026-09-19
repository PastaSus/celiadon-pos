import type { PaymentMethod, Sale } from '../../../shared/types';
import { STORE_NAME, formatCurrency } from '../lib/api';

function paymentLabel(method: PaymentMethod | null): string {
  switch (method) {
    case 'cash':
      return 'Cash';
    case 'card':
      return 'Card';
    case 'e-wallet':
      return 'E-Wallet';
    default:
      return '—';
  }
}

interface ReceiptViewProps {
  sale: Sale;
}

/**
 * Paper-slip receipt shared by the post-sale and history paths (one layout,
 * one data source). Screen shows it at 80mm; `@media print` CSS in index.css
 * sizes the printed page the same way with the app chrome hidden.
 */
export default function ReceiptView({ sale }: ReceiptViewProps) {
  const items = sale.items ?? [];

  return (
    <div className="mx-auto w-[80mm] max-w-full bg-white p-4 text-sm text-slate-900">
      <h1 className="text-center text-base font-bold">{STORE_NAME}</h1>
      <p className="mt-1 text-center font-mono text-xs">{sale.receipt_number}</p>
      <p className="text-center text-xs text-slate-500">
        {new Date(sale.transaction_date).toLocaleString()}
      </p>

      <hr className="my-3 border-slate-300" />

      {items.length === 0 ? (
        <p className="text-slate-500">No items</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id} className="mb-2">
              <p>{item.product_name ?? 'Unknown product'}</p>
              <p className="flex justify-between text-slate-600">
                <span>
                  {item.quantity} × {formatCurrency(item.unit_price)}
                </span>
                <span>{formatCurrency(item.subtotal)}</span>
              </p>
            </li>
          ))}
        </ul>
      )}

      <hr className="my-3 border-slate-300" />

      <p className="flex justify-between font-bold">
        <span>Total</span>
        <span>{formatCurrency(sale.total_amount)}</span>
      </p>
      <p className="mt-1 flex justify-between text-slate-600">
        <span>Paid by</span>
        <span>{paymentLabel(sale.payment_method)}</span>
      </p>
    </div>
  );
}
