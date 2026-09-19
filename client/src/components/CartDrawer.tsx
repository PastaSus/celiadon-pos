import { useEffect, useRef } from 'react';
import type { CartItem, PaymentMethod } from '../../../shared/types';
import { formatCurrency } from '../lib/api';
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

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<Element | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    openerRef.current = document.activeElement;

    const panel = panelRef.current;
    // Move focus inside the dialog on open.
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      // Return focus to the element that opened the dialog.
      const opener = openerRef.current as HTMLElement | null;
      if (opener && typeof opener.focus === 'function') {
        opener.focus();
      }
      openerRef.current = null;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
        tabIndex={-1}
        className="absolute bottom-0 inset-x-0 max-h-[85vh] flex flex-col bg-white rounded-t-lg focus:outline-none"
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
