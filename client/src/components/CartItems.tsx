import { Minus, Plus, X } from 'lucide-react';
import type { CartItem } from '../../../shared/types';
import { formatCurrency } from '../lib/api';
import Button from './Button';

interface CartItemsProps {
  items: CartItem[];
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemove: (productId: number) => void;
}

export const EMPTY_CART_MESSAGE = 'Click products to add to cart';

// The single cart line-item list: desktop panel and CartDrawer render these
// same rows, steppers, and remove actions from the one POS cart state.
export default function CartItems({ items, onUpdateQuantity, onRemove }: CartItemsProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.product.id}
          className="flex items-center justify-between border-b border-line pb-3"
        >
          <div className="flex-1">
            <p className="font-medium">{item.product.name}</p>
            <p className="text-sm text-slate-500">
              {formatCurrency(item.product.price)} each
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex h-11 w-11 items-center justify-center !p-0"
              onClick={() => onUpdateQuantity(item.product.id, -1)}
              aria-label={`Decrease quantity of ${item.product.name}`}
            >
              <Minus size={20} aria-hidden="true" />
            </Button>
            <span aria-live="polite" className="w-8 text-center">{item.quantity}</span>
            <Button
              variant="secondary"
              size="sm"
              className="flex h-11 w-11 items-center justify-center !p-0"
              onClick={() => onUpdateQuantity(item.product.id, 1)}
              aria-label={`Increase quantity of ${item.product.name}`}
            >
              <Plus size={20} aria-hidden="true" />
            </Button>
            <Button
              variant="dangerGhost"
              size="sm"
              className="ml-2 flex h-11 w-11 items-center justify-center !p-0"
              onClick={() => onRemove(item.product.id)}
              aria-label={`Remove ${item.product.name} from cart`}
            >
              <X size={20} aria-hidden="true" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
