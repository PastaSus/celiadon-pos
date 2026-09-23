import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import type { CartItem, Category, PaymentMethod, Product, Sale } from '../../../shared/types'
import { fetchApi, formatCurrency } from '../lib/api'
import { Badge, Button, CartDrawer, CartItems, CategoryChips, EMPTY_CART_MESSAGE, EmptyState, LoadingSpinner, PaymentMethodControl, SearchInput, stockTone, useToast } from '../components'

export default function POS() {
  const toast = useToast()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [cartOpen, setCartOpen] = useState(false)

  // The drawer is a below-lg surface: crossing into desktop always leaves it closed.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setCartOpen(false)
    }
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  const trimmedQuery = searchQuery.trim()
  const filtersActive = categoryFilter !== 'all' || trimmedQuery !== ''
  // Category and name narrow the already-loaded list in memory, so the grid
  // never waits on a request (UX-DR6, FR12) and the cart is left untouched.
  const visibleProducts = products.filter((product) => {
    if (categoryFilter !== 'all' && String(product.category_id) !== categoryFilter) return false
    if (trimmedQuery === '') return true
    return product.name.toLowerCase().includes(trimmedQuery.toLowerCase())
  })

  const loadProducts = () =>
    fetchApi<Product[]>('/products')
      .then(setProducts)
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to load products')
      })
      .finally(() => setLoading(false))

  const loadCategories = () =>
    fetchApi<Category[]>('/categories')
      .then(setCategories)
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to load categories')
      })

  useEffect(() => {
    loadProducts()
    loadCategories()
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
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

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

      const sale = await fetchApi<Sale>('/sales', {
        method: 'POST',
        body: JSON.stringify({ items, payment_method: paymentMethod })
      })

      toast.success('Sale completed')
      setCart([])
      setPaymentMethod('cash')
      // Stock changed, so refresh the grid.
      await loadProducts()
      navigate(`/receipts/${sale.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process transaction')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const page = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24 lg:pb-0">
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
          {filtersActive && (
            <p aria-live="polite" className="text-sm text-slate-600 mt-2">
              {visibleProducts.length} {visibleProducts.length === 1 ? 'result' : 'results'}
              {trimmedQuery !== '' && ` for \u201C${trimmedQuery}\u201D`}
            </p>
          )}
        </div>
        {categories.length > 0 && (
          <div className="mb-4">
            <CategoryChips
              categories={categories}
              selected={categoryFilter}
              onSelect={setCategoryFilter}
            />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                <h3 className="font-semibold text-slate-800 break-words">{product.name}</h3>
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
            message={filtersActive ? 'No products match this filter.' : 'No products available.'}
          />
        )}
      </div>

      {/* Cart */}
      <div className="hidden lg:block bg-white rounded-lg shadow-md p-4 h-fit sticky top-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Cart</h2>

        {cart.length === 0 ? (
          <p className="text-slate-500 text-center py-8">{EMPTY_CART_MESSAGE}</p>
        ) : (
          <>
            <div className="max-h-96 overflow-y-auto">
              <CartItems
                items={cart}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            </div>

            <PaymentMethodControl selected={paymentMethod} onSelect={setPaymentMethod} />

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

  return (
    <>
      {page}
      {/* Fixed summary bar — the only cart surface below lg */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-line-strong bg-white px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          aria-label={`Open cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}, total ${formatCurrency(total)}`}
          className="flex min-h-[56px] w-full items-center justify-between rounded-lg bg-ink px-4 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <ShoppingCart size={20} aria-hidden="true" />
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
          <span className="text-accent text-xl font-extrabold tabular-nums">
            {formatCurrency(total)}
          </span>
        </button>
      </div>
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        paymentMethod={paymentMethod}
        onPaymentMethod={setPaymentMethod}
        total={total}
        itemCount={itemCount}
        processing={processing}
        onCheckout={handleCheckout}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />
    </>
  )
}