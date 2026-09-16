import { useEffect, useState } from 'react'
import type { CartItem, Product } from '../../../shared/types'
import { fetchApi, formatCurrency } from '../lib/api'
import { Button, LoadingSpinner, stockTone, useToast } from '../components'

export default function POS() {
  const toast = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

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
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Products</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => {
            const outOfStock = product.stock_quantity <= 0
            const tone = stockTone(product.stock_quantity, product.reorder_level)
            const stockColor =
              tone === 'green'
                ? 'text-green-600'
                : tone === 'yellow'
                  ? 'text-yellow-600'
                  : 'text-red-600'

            return (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
                  outOfStock ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <p className="text-indigo-600 font-bold">{formatCurrency(product.price)}</p>
                <p className={`text-sm ${stockColor}`}>
                  {outOfStock ? 'Out of stock' : `${product.stock_quantity} in stock`}
                </p>
              </div>
            )
          })}
        </div>
        {products.length === 0 && (
          <p className="text-gray-500 py-8 text-center">No products available.</p>
        )}
      </div>

      {/* Cart */}
      <div className="bg-white rounded-lg shadow-md p-4 h-fit sticky top-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Cart</h2>

        {cart.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Click products to add to cart</p>
        ) : (
          <>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(item.product.price)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex h-8 w-8 items-center justify-center !p-0"
                      onClick={() => updateQuantity(item.product.id, -1)}
                    >
                      −
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex h-8 w-8 items-center justify-center !p-0"
                      onClick={() => updateQuantity(item.product.id, 1)}
                    >
                      +
                    </Button>
                    <Button
                      variant="dangerGhost"
                      size="sm"
                      className="ml-2"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      &times;
                      
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
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