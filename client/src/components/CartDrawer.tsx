import type { CartItem, PaymentMethod } from '../../../shared/types';
import { formatCurrency } from '../lib/api';
import { useDialog } from '../hooks/useDialog';
import Button from './Button';
import CartItems, { EMPTY_CART_MESSAGE } from './CartItems';
import PaymentMethodControl from './PaymentMethodControl';
import { X } from 'lucide-react';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  paymentMethod: PaymentMethod;
  onPaymentMethod: (method: PaymentMethod) => void;
  total: number;
  itemCount: number;
  processing: boolean;
  onCheckout: () => void;
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemove: (productId: number) => void;
}

// Bottom-rising cart for viewports below lg (Story 5.2). A viewport
// presentation of the one POS cart — same dialog behavior as NavDrawer, pinned
// navy footer carrying the total in flat accent with Complete Sale beside it.
export default function CartDrawer({
  open,
  onClose,
  cart,
  paymentMethod,
  onPaymentMethod,
  total,
  itemCount,
  processing,
  onCheckout,
  onUpdateQuantity,
  onRemove
}: CartDrawerProps) {
  const { panelRef, mounted, shown } = useDialog({ open, onClose });

  if (!mounted) return null;

  const scrim = shown ? 'opacity-100 duration-base ease-out' : 'opacity-0 duration-fast ease-in';
  const panel = shown
    ? 'translate-y-0 duration-base ease-out'
    : 'translate-y-full duration-fast ease-in';

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className={`absolute inset-0 bg-black bg-opacity-50 transition-opacity ${scrim}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
        tabIndex={-1}
        className={`absolute bottom-0 inset-x-0 max-h-[85vh] flex flex-col bg-white rounded-t-lg focus:outline-none transition-transform ${panel}`}
      >
        <div className="flex items-center justify-between p-4 pb-2">
          <h2 className="text-xl font-bold">
            Cart{itemCount > 0 ? ` (${itemCount} items)` : ''}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 flex items-center justify-center min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-md"
            aria-label="Close cart"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4">
          {cart.length === 0 ? (
            <p className="text-slate-500 text-center py-8">{EMPTY_CART_MESSAGE}</p>
          ) : (
            <>
              <CartItems items={cart} onUpdateQuantity={onUpdateQuantity} onRemove={onRemove} />
              <div className="mt-4">
                <PaymentMethodControl selected={paymentMethod} onSelect={onPaymentMethod} />
              </div>
            </>
          )}
        </div>
        {cart.length > 0 && (
          <div className="bg-ink p-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-4">
            <span className="text-accent text-2xl font-extrabold tabular-nums">
              {formatCurrency(total)}
            </span>
            <Button
              variant="success"
              size="lg"
              className="flex-1"
              onClick={onCheckout}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Complete Sale'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
