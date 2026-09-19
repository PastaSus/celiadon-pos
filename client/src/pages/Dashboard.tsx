import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import type {
  DashboardStats,
  RevenueBucket,
  RevenueGranularity,
  RevenueTrendResponse,
  Sale
} from '../../../shared/types'
import { fetchApi, formatCurrency } from '../lib/api'
import { ChartPanel, LoadingSpinner, Table, useToast } from '../components'
import type { Column } from '../components'

const GRANULARITIES: RevenueGranularity[] = ['daily', 'weekly', 'monthly']

function formatBucketLabel(bucket: string, granularity: RevenueGranularity): string {
  const date = new Date(bucket)
  if (granularity === 'monthly') {
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatBucketFull(bucket: string, granularity: RevenueGranularity): string {
  const date = new Date(bucket)
  if (granularity === 'monthly') {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
  if (granularity === 'weekly') {
    return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Dashboard() {
  const toast = useToast()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [granularity, setGranularity] = useState<RevenueGranularity>('monthly')
  const [trend, setTrend] = useState<RevenueBucket[]>([])
  const [trendLoading, setTrendLoading] = useState(true)
  const [trendError, setTrendError] = useState(false)

  useEffect(() => {
    fetchApi<DashboardStats>('/dashboard')
      .then(setStats)
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to load dashboard')
      })
      .finally(() => setLoading(false))
  }, [toast])

  useEffect(() => {
    let cancelled = false
    setTrendLoading(true)
    fetchApi<RevenueTrendResponse>(`/reports/revenue-trend?granularity=${granularity}`)
      .then((response) => {
        if (!cancelled) {
          setTrend(response.data)
          setTrendError(false)
        }
      })
      .catch((error) => {
        // Keep previous good data on screen; surface the server's message.
        if (!cancelled) {
          setTrendError(true)
          toast.error(error instanceof Error ? error.message : 'Failed to load revenue trend')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setTrendLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [granularity, toast])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!stats) {
    return <div className="text-center py-8 text-danger">Failed to load dashboard</div>
  }

  const statCards = [
    { label: 'Total Products', value: String(stats.total_products), color: 'bg-teal' },
    { label: 'Current Inventory', value: String(stats.current_inventory), color: 'bg-commit' },
    { label: 'Total Sales', value: String(stats.total_sales), color: 'bg-slate-500' },
    { label: 'Total Revenue', value: formatCurrency(stats.total_revenue), color: 'bg-brand' }
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
        <span className="text-sm text-slate-500">
          {new Date(sale.transaction_date).toLocaleString()}
        </span>
      )
    }
  ]

  const trendIsEmpty = trend.length === 0 || trend.every((point) => point.revenue === 0)
  const trendTotal = trend.reduce((sum, point) => sum + point.revenue, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${stat.color}`} />
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
            <p className="text-2xl font-bold text-slate-800 mt-2 tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Trend */}
      <div className="mb-8">
        <ChartPanel
          title="Revenue trend"
          loading={trendLoading}
          isEmpty={!trendLoading && (trendError ? trend.length === 0 : trendIsEmpty)}
          emptyMessage={trendError ? 'Failed to load revenue trend' : undefined}
          actions={
            <div className="flex gap-2" role="group" aria-label="Aggregation">
              {GRANULARITIES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setGranularity(option)}
                  aria-pressed={granularity === option}
                  className={`rounded-full px-3 py-1 text-sm capitalize transition-colors ${
                    granularity === option
                      ? 'bg-brand text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          }
        >
          <div
            role="img"
            aria-label={`Revenue trend chart, ${granularity} aggregation, ${formatCurrency(trendTotal)} total`}
            className="h-full w-full text-brand"
          >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="bucket"
                tickFormatter={(bucket: string) => formatBucketLabel(bucket, granularity)}
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={{ stroke: '#E0E0E0' }}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                tickFormatter={(value: number) => formatCurrency(Number(value))}
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={{ stroke: '#E0E0E0' }}
                tickLine={false}
                width={90}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                labelFormatter={(bucket: string) => formatBucketFull(bucket, granularity)}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="currentColor"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </ChartPanel>
      </div>

      {/* Recent Sales */}
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Sales</h2>
      <Table
        columns={columns}
        rows={stats.recent_sales}
        rowKey={(sale) => sale.id}
        emptyMessage="No sales yet"
      />
    </div>
  )
}
