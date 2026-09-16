import { useEffect, useState } from 'react'
import { fetchApi, Sale } from '../lib/api'

export default function Transactions() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  useEffect(() => {
    fetchApi<Sale[]>('/sales')
      .then(setSales)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const viewDetails = async (sale: Sale) => {
    try {
      const details = await fetchApi<Sale>(`/sales/${sale.id}`)
      setSelectedSale(details)
    } catch (error) {
      console.error('Error fetching sale details:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Sales Transactions</h1>

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{sale.receipt_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">₱{sale.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sale.transaction_date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => viewDetails(sale)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sales.length === 0 && (
          <div className="text-center py-8 text-gray-500">No transactions yet</div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Transaction Details</h2>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Receipt Number</p>
                <p className="font-mono font-bold">{selectedSale.receipt_number}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Date</p>
                <p>{new Date(selectedSale.transaction_date).toLocaleString()}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Items</p>
                {selectedSale.items && selectedSale.items.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1">Product</th>
                        <th className="text-right py-1">Qty</th>
                        <th className="text-right py-1">Price</th>
                        <th className="text-right py-1">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.items.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-1">{item.product_name}</td>
                          <td className="text-right py-1">{item.quantity}</td>
                          <td className="text-right py-1">₱{item.unit_price.toFixed(2)}</td>
                          <td className="text-right py-1">₱{item.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">No items</p>
                )}
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-indigo-600">₱{selectedSale.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
