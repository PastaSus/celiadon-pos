import { useEffect, useState } from 'react'
import { fetchApi, DashboardStats } from '../lib/api'

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApi<DashboardStats>('/dashboard')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!stats) {
    return <div className="text-center py-8 text-red-500">Failed to load dashboard</div>
  }

  const statCards = [
    { label: 'Total Products', value: stats.total_products, icon: '📦', color: 'bg-blue-500' },
    { label: 'Current Inventory', value: stats.current_inventory, icon: '📋', color: 'bg-green-500' },
    { label: 'Total Sales', value: stats.total_sales, icon: '🛒', color: 'bg-purple-500' },
    { label: 'Total Revenue', value: `₱${stats.total_revenue.toFixed(2)}`, icon: '💰', color: 'bg-yellow-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className={`${stat.color} text-white p-3 rounded-lg`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Sales</h2>
        {stats.recent_sales.length === 0 ? (
          <p className="text-gray-500">No sales yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Receipt #</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_sales.map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-mono text-sm">{sale.receipt_number}</td>
                    <td className="py-2">₱{sale.total_amount.toFixed(2)}</td>
                    <td className="py-2 text-sm text-gray-500">
                      {new Date(sale.transaction_date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
