import { useEffect, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import type { CartItem, Product } from '../../../shared/types'
import { fetchApi, formatCurrency } from '../lib/api'
import { Badge, Button, EmptyState, LoadingSpinner, SearchInput, stockTone, useToast } from '../components'

export default function POS() {
  const toast = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const trimmedQuery = searchQuery.trim()
  const visibleProducts =
    trimmedQuery === ''
      ? products
      : products.filter((product) =>
          product.name.toLowerCase().includes(trimmedQuery.toLowerCase())
        )

  const loadProducts = () =>
    fetchApi<Product[]>('/products')
      .then(setProducts)
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to load products')
      })
      .finally(() => setLoading(false))

  useEffect(() => {
    loadProducts()
    // toast's identity is stable, so this still runs once on mount.
  }, [toast])

  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      toast.error('Product is out of stock')
      return
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          toast.error('Not enough stock')
          return prev
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id !== productId) return item
          const newQty = item.quantity + delta
          if (newQty <= 0) return null
          if (newQty > item.product.stock_quantity) {
            toast.error('Not enough stock')
            return item
          }
          return { ...item, quantity: newQty }
        })
        .filter((item): item is CartItem => item !== null)
    )
  }

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    setProcessing(true)
    try {
      const items = cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity
      }))

      await fetchApi('/sales', {
        method: 'POST',
        body: JSON.stringify({ items })
      })

      toast.success('Sale completed')
      setCart([])
      // Stock changed, so refresh the grid.
      await loadProducts()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process transaction')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products Grid */}
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Products</h1>
        <div className="mb-4 max-w-md">
          <SearchInput
            value={searchText}
            onChange={setSearchText}
            onSearch={setSearchQuery}
            placeholder="Search products..."
          />
          {trimmedQuery !== '' && (
            <p aria-live="polite" className="text-sm text-slate-500 mt-2">
              {visibleProducts.length} {visibleProducts.length === 1 ? 'result' : 'results'} for
              &ldquo;{trimmedQuery}&rdquo;
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {visibleProducts.map((product) => {
            const outOfStock = product.stock_quantity <= 0

            return (
              <button
                key={product.id}
                type="button"
                disabled={outOfStock}
                aria-label={`Add ${product.name} to cart`}
                onClick={() => addToCart(product)}
                className={`bg-white rounded-lg shadow-md p-4 text-left transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                  outOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <h3 className="font-semibold text-slate-800">{product.name}</h3>
                <p className="text-slate-800 font-bold tabular-nums">{formatCurrency(product.price)}</p>
                <div className="mt-1">
                  <Badge tone={stockTone(product.stock_quantity, product.reorder_level)}>
                    {outOfStock ? 'Out of stock' : `${product.stock_quantity} in stock`}
                  </Badge>
                </div>
              </button>
            )
          })}
        </div>
        {visibleProducts.length === 0 && (
          <EmptyState
            message={trimmedQuery !== '' ? 'No products match your search.' : 'No products available.'}
          />
        )}
      </div>

      {/* Cart */}
      <div className="bg-white rounded-lg shadow-md p-4 h-fit sticky top-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Cart</h2>

        {cart.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Click products to add to cart</p>
        ) : (
          <>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cart.map((item) => (
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
                      onClick={() => updateQuantity(item.product.id, -1)}
                      aria-label={`Decrease quantity of ${item.product.name}`}
                    >
                      <Minus size={20} aria-hidden="true" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex h-11 w-11 items-center justify-center !p-0"
                      onClick={() => updateQuantity(item.product.id, 1)}
                      aria-label={`Increase quantity of ${item.product.name}`}
                    >
                      <Plus size={20} aria-hidden="true" />
                    </Button>
                    <Button
                      variant="dangerGhost"
                      size="sm"
                      className="ml-2 flex h-11 w-11 items-center justify-center !p-0"
                      onClick={() => removeFromCart(item.product.id)}
                      aria-label={`Remove ${item.product.name} from cart`}
                    >
                      <X size={20} aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-line mt-4 pt-4">
              <div className="bg-ink rounded-lg p-4 flex justify-between items-center">
                <span className="text-white font-bold">Total:</span>
                <span className="text-accent text-2xl font-extrabold tabular-nums">
                  {formatCurrency(total)}
                </span>
              </div>
              <Button
                variant="success"
                size="lg"
                className="w-full mt-4"
                onClick={handleCheckout}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Complete Sale'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}