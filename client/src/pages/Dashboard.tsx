import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import type {
  DashboardStats,
  PaymentMethod,
  PaymentMixResponse,
  Product,
  RevenueBucket,
  RevenueGranularity,
  RevenueTrendResponse,
  Sale,
  SummaryResponse,
  TopProduct,
  TopProductsResponse
} from '../../../shared/types'
import { fetchApi, formatCurrency } from '../lib/api'
import { Badge, ChartPanel, DateRangeBar, LoadingSpinner, StatCard, Table, defaultRange, stockStatus, stockTone, useToast } from '../components'
import type { Column, DateRange, RangePreset } from '../components'

const GRANULARITIES: RevenueGranularity[] = ['daily', 'weekly', 'monthly']

// Largest-remainder shares in tenths of a percent so the displayed legend
// values always sum to exactly 100%.
function largestRemainderShares(revenues: number[]): number[] {
  const total = revenues.reduce((sum, value) => sum + value, 0)
  if (total <= 0) return revenues.map(() => 0)
  const tenths = revenues.map((revenue) => Math.floor((revenue / total) * 1000))
  let remainder = 1000 - tenths.reduce((sum, value) => sum + value, 0)
  const order = revenues
    .map((revenue, index) => ({ index, frac: (revenue / total) * 1000 - tenths[index] }))
    .sort((a, b) => b.frac - a.frac)
  let k = 0
  while (remainder > 0) {
    tenths[order[k % order.length].index] += 1
    remainder -= 1
    k += 1
  }
  return tenths.map((value) => value / 10)
}

const PAYMENT_METHODS: PaymentMethod[] = ['cash', 'card', 'e-wallet']

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Card',
  'e-wallet': 'E-Wallet'
}

// Slice fills mirror palette tokens (brand/commit/ink) — SVG fills cannot use
// Tailwind classes, so the hexes live in this one map with their token cited.
const PAYMENT_FILLS: Record<PaymentMethod, string> = {
  cash: '#1690E8', // brand
  card: '#0B7E71', // commit
  'e-wallet': '#0A1929' // ink
}

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
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [topLoading, setTopLoading] = useState(true)
  const [topError, setTopError] = useState(false)
  const [mix, setMix] = useState<PaymentMixResponse['data']>([])
  const [mixLoading, setMixLoading] = useState(true)
  const [mixError, setMixError] = useState(false)
  const [trendError, setTrendError] = useState(false)
  const [range, setRange] = useState<DateRange>(() => defaultRange())
  const [preset, setPreset] = useState<RangePreset>('30')
  const [summary, setSummary] = useState<SummaryResponse['data'] | null>(null)
  const [lowProducts, setLowProducts] = useState<Product[]>([])
  const [lowError, setLowError] = useState(false)

  const rangeQuery = `from=${range.from}&to=${range.to}`

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
    fetchApi<RevenueTrendResponse>(`/reports/revenue-trend?granularity=${granularity}&${rangeQuery}`)
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
  }, [granularity, rangeQuery, toast])

  useEffect(() => {
    let cancelled = false
    setTopLoading(true)
    fetchApi<TopProductsResponse>(`/reports/top-products?${rangeQuery}`)
      .then((response) => {
        if (!cancelled) {
          setTopProducts(response.data)
          setTopError(false)
        }
      })
      .catch((error) => {
        // Keep previous good data on screen; surface the server's message.
        if (!cancelled) {
          setTopError(true)
          toast.error(error instanceof Error ? error.message : 'Failed to load top products')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setTopLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [rangeQuery, toast])

  useEffect(() => {
    let cancelled = false
    setMixLoading(true)
    fetchApi<PaymentMixResponse>(`/reports/payment-mix?${rangeQuery}`)
      .then((response) => {
        if (!cancelled) {
          setMix(response.data)
          setMixError(false)
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setMixError(true)
          toast.error(error instanceof Error ? error.message : 'Failed to load payment mix')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setMixLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [rangeQuery, toast])

  useEffect(() => {
    let cancelled = false
    fetchApi<Product[]>('/products')
      .then((response) => {
        if (!cancelled) {
          setLowProducts(response)
          setLowError(false)
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLowError(true)
          toast.error(error instanceof Error ? error.message : 'Failed to load products')
        }
      })
    return () => {
      cancelled = true
    }
  }, [toast])

  useEffect(() => {
    let cancelled = false
    fetchApi<SummaryResponse>(`/reports/summary?${rangeQuery}`)
      .then((response) => {
        if (!cancelled) {
          setSummary(response.data)
        }
      })
      .catch((error) => {
        // Keep previous good data on screen; surface the server's message.
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : 'Failed to load summary')
        }
      })
    return () => {
      cancelled = true
    }
  }, [rangeQuery, toast])

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

  const summaryTiles = [
    { label: 'Revenue', value: summary ? formatCurrency(summary.total_revenue) : '—', tone: 'bg-brand' },
    { label: 'Transactions', value: summary ? String(summary.transaction_count) : '—', tone: 'bg-teal' },
    { label: 'Average sale', value: summary ? formatCurrency(summary.average_sale) : '—', tone: 'bg-commit' },
    { label: 'Items sold', value: summary ? String(summary.items_sold) : '—', tone: 'bg-slate-500' }
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

  const topColumns: Column<TopProduct & { rank: number }>[] = [
    {
      key: 'rank',
      header: 'Rank',
      render: (row) => row.rank
    },
    {
      key: 'product_name',
      header: 'Product',
      render: (row) => row.product_name
    },
    {
      key: 'quantity',
      header: 'Qty',
      align: 'right',
      render: (row) => row.quantity
    },
    {
      key: 'revenue',
      header: 'Revenue',
      align: 'right',
      render: (row) => formatCurrency(row.revenue)
    }
  ]

  const trendIsEmpty = trend.length === 0 || trend.every((point) => point.revenue === 0)

  const rankedTop = topProducts.map((product, index) => ({ ...product, rank: index + 1 }))
  const topFailed = topError && topProducts.length === 0

  const mixTotal = mix.reduce((sum, slice) => sum + slice.revenue, 0)
  const mixRevenues = PAYMENT_METHODS.map(
    (method) => mix.find((slice) => slice.method === method)?.revenue ?? 0
  )
  const mixShares = largestRemainderShares(mixRevenues)
  const mixRows = PAYMENT_METHODS.map((method, index) => ({
    method,
    label: PAYMENT_LABELS[method],
    revenue: mixRevenues[index],
    share: mixShares[index]
  }))
  const mixIsEmpty = mix.length === 0 || mixTotal === 0
  const mixFailed = mixError && mix.length === 0

  // Point-in-time stock, independent of the selected range. Out-of-stock
  // first, then lowest quantity, then name — status and tone derive once per
  // product so rows, badges, and order can never disagree.
  const lowStock = lowProducts
    .map((product) => ({
      product,
      status: stockStatus(product.stock_quantity, product.reorder_level),
      tone: stockTone(product.stock_quantity, product.reorder_level)
    }))
    .filter((entry) => entry.status !== 'healthy')
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'out' ? -1 : 1
      return (
        a.product.stock_quantity - b.product.stock_quantity ||
        a.product.name.localeCompare(b.product.name)
      )
    })
  const lowFailed = lowError && lowProducts.length === 0
  const trendTotal = trend.reduce((sum, point) => sum + point.revenue, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

      <div className="mb-6">
        <DateRangeBar
          from={range.from}
          to={range.to}
          preset={preset}
          onChange={(next, nextPreset) => {
            setRange(next)
            setPreset(nextPreset)
          }}
        />
      </div>

      {/* Key numbers for the selected range */}
      <h2 className="text-lg font-semibold text-slate-800 mb-4">For the selected range</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryTiles.map((tile) => (
          <StatCard key={tile.label} label={tile.label} value={tile.value} toneClass={tile.tone} />
        ))}
      </div>

      {/* Low-stock callout — hidden entirely when nothing is low */}
      {(lowStock.length > 0 || lowFailed) && (
        <section aria-label="Low stock" className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Low stock ({lowStock.length})
            </h2>
            <Link
              to="/inventory?stock=low"
              className="rounded-md text-sm text-brand hover:text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              View in Inventory
            </Link>
          </div>
          {lowFailed ? (
            <p className="text-sm text-danger">Failed to load low stock.</p>
          ) : (
            <ul className="divide-y divide-line">
              {lowStock.map((entry) => (
                <li
                  key={entry.product.id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2"
                >
                  <span title={entry.product.name} className="min-w-0 flex-1 truncate text-sm text-slate-800">
                    {entry.product.name}
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="text-sm tabular-nums text-slate-500">
                      {entry.product.stock_quantity} left · Reorder at {entry.product.reorder_level}
                    </span>
                    <Badge tone={entry.tone}>
                      {entry.status === 'out' ? 'Out of stock' : 'Low stock'}
                    </Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Stats Cards */}
      <h2 className="text-lg font-semibold text-slate-800 mb-4">All time</h2>
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

      {/* Top products and payment mix */}
      <p className="text-sm text-slate-500 mb-4">
        Showing {new Date(`${range.from}T00:00:00`).toLocaleDateString()} to{' '}
        {new Date(`${range.to}T00:00:00`).toLocaleDateString()}.
      </p>
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPanel
          title="Top products"
          loading={topLoading}
          isEmpty={!topLoading && (topFailed || topProducts.length === 0)}
          emptyMessage={topFailed ? 'Failed to load top products.' : undefined}
        >
          <Table
            columns={topColumns}
            rows={rankedTop}
            rowKey={(row) => row.product_id}
            emptyMessage="No sales in this range"
          />
        </ChartPanel>

        <ChartPanel
          title="Payment mix"
          loading={mixLoading}
          isEmpty={!mixLoading && (mixFailed || mixIsEmpty)}
          emptyMessage={mixFailed ? 'Failed to load payment mix.' : undefined}
        >
          <div
            role="img"
            aria-label={`Payment mix chart, ${mixRows.map((row) => `${row.label} ${row.share}%`).join(', ')}`}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mixRows} dataKey="revenue" nameKey="label" outerRadius="80%">
                  {mixRows.map((row) => (
                    <Cell key={row.method} fill={PAYMENT_FILLS[row.method]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(label: string) =>
                    `${label} · ${mixRows.find((row) => row.label === label)?.share ?? 0}%`
                  }
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                />
              </PieChart>
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
