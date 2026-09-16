import { useEffect, useState } from 'react'
import { fetchApi, Product, CartItem } from '../lib/api'

export default function POS() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchApi<Product[]>('/products')
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      alert('Product out of stock')
      return
    }
    
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          alert('Not enough stock')
          return prev
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta
            if (newQty <= 0) return null
            if (newQty > item.product.stock_quantity) {
              alert('Not enough stock')
              return item
            }
            return { ...item, quantity: newQty }
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    })
  }

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty')
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

      alert('Transaction completed successfully!')
      setCart([])
      // Reload products to get updated stock
      const updatedProducts = await fetchApi<Product[]>('/products')
      setProducts(updatedProducts)
    } catch (error) {
      console.error('Error processing sale:', error)
      alert('Failed to process transaction')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products Grid */}
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Products</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
                product.stock_quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <h3 className="font-semibold text-gray-800">{product.name}</h3>
              <p className="text-indigo-600 font-bold">₱{product.price.toFixed(2)}</p>
              <p className={`text-sm ${product.stock_quantity > 10 ? 'text-green-600' : product.stock_quantity > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
              </p>
            </div>
          ))}
        </div>
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
                <div key={item.product.id} className="flex items-center justify-between border-b pb-3">
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">₱{item.product.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {processing ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
