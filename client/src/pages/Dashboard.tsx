import { useEffect, useState } from 'react'
import type { DashboardStats, Sale } from '../../../shared/types'
import { fetchApi, formatCurrency } from '../lib/api'
import { LoadingSpinner, Table, useToast } from '../components'
import type { Column } from '../components'

export default function Dashboard() {
  const toast = useToast()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApi<DashboardStats>('/dashboard')
      .then(setStats)
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to load dashboard')
      })
      .finally(() => setLoading(false))
  }, [toast])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!stats) {
    return <div className="text-center py-8 text-red-500">Failed to load dashboard</div>
  }

  const statCards = [
    { label: 'Total Products', value: String(stats.total_products), color: 'bg-blue-500' },
    { label: 'Current Inventory', value: String(stats.current_inventory), color: 'bg-green-500' },
    { label: 'Total Sales', value: String(stats.total_sales), color: 'bg-purple-500' },
    { label: 'Total Revenue', value: formatCurrency(stats.total_revenue), color: 'bg-yellow-500' }
  ]

  const columns: Column<Sale>[] = [
    {
      key: 'receipt_number',
      header: 'Receipt #',
      render: (sale) => <span className="font-mono text-sm">{sale.receipt_number}</span>
    },
    {
      key: 'total_amount',
      header: 'Amount',
      render: (sale) => formatCurrency(sale.total_amount)
    },
    {
      key: 'transaction_date',
      header: 'Date',
      render: (sale) => (
        <span className="text-sm text-gray-500">
          {new Date(sale.transaction_date).toLocaleString()}
        </span>
      )
    }
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${stat.color}`} />
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Sales */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Sales</h2>
      <Table
        columns={columns}
        rows={stats.recent_sales}
        rowKey={(sale) => sale.id}
        emptyMessage="No sales yet"
      />
    </div>
  )
}
