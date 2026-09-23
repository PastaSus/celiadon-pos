import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PaymentMethod, Sale, SaleDetail } from '../../../shared/types'
import { fetchApi, formatCurrency } from '../lib/api'
import { Button, FilterSelect, LoadingSpinner, Modal, Table, useToast } from '../components'
import type { Column } from '../components'

const PAGE_SIZE = 10

const PAYMENT_FILTERS = [
  { value: 'all', label: 'All payment methods' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'e-wallet', label: 'E-Wallet' }
]

function toLocalDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function paymentLabel(method: PaymentMethod | null): string {
  switch (method) {
    case 'cash':
      return 'Cash'
    case 'card':
      return 'Card'
    case 'e-wallet':
      return 'E-Wallet'
    default:
      return '—'
  }
}

export default function Transactions() {
  const toast = useToast()
  const navigate = useNavigate()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [dateFilter, setDateFilter] = useState(() => toLocalDateKey(new Date()))
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchApi<Sale[]>('/sales')
      .then(setSales)
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to load transactions')
      })
      .finally(() => setLoading(false))
  }, [toast])

  const todayKey = toLocalDateKey(new Date())
  const filtersActive = dateFilter !== todayKey || paymentFilter !== 'all'

  const filteredSales = sales.filter((sale) => {
    if (toLocalDateKey(new Date(sale.transaction_date)) !== dateFilter) return false
    if (paymentFilter !== 'all' && sale.payment_method !== paymentFilter) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / PAGE_SIZE))

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const clearFilters = () => {
    setDateFilter(toLocalDateKey(new Date()))
    setPaymentFilter('all')
    setPage(1)
  }

  const activePaymentLabel = PAYMENT_FILTERS.find((option) => option.value === paymentFilter)?.label ?? ''
  const activeDateLabel = new Date(`${dateFilter}T00:00:00`).toLocaleDateString()
  const emptyMessage =
    sales.length === 0
      ? 'No transactions yet'
      : `No transactions on ${activeDateLabel}${paymentFilter !== 'all' ? ` paid by ${activePaymentLabel}` : ''}.`

  const viewDetails = async (sale: Sale) => {
    setLoadingDetail(true)
    try {
      const details = await fetchApi<Sale>(`/sales/${sale.id}`)
      setSelectedSale(details)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load transaction')
    } finally {
      setLoadingDetail(false)
    }
  }

  const columns: Column<Sale>[] = [
    {
      key: 'receipt_number',
      header: 'Receipt #',
      render: (sale) => <span className="font-mono text-sm">{sale.receipt_number}</span>
    },
    {
      key: 'total_amount',
      header: 'Amount',
      render: (sale) => (
        <span className="font-bold text-commit">{formatCurrency(sale.total_amount)}</span>
      )
    },
    {
      key: 'payment_method',
      header: 'Payment',
      render: (sale) => (
        <span className="text-sm text-slate-600">{paymentLabel(sale.payment_method)}</span>
      )
    },
    {
      key: 'transaction_date',
      header: 'Date',
      render: (sale) => (
        <span className="text-sm text-slate-500">
          {new Date(sale.transaction_date).toLocaleString()}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (sale) => (
        <Button variant="ghost" size="sm" onClick={() => viewDetails(sale)}>
          View Details
        </Button>
      )
    }
  ]

  const itemColumns: Column<SaleDetail>[] = [
    { key: 'product_name', header: 'Product', render: (item) => item.product_name },
    { key: 'quantity', header: 'Qty', align: 'right', render: (item) => item.quantity },
    {
      key: 'unit_price',
      header: 'Price',
      align: 'right',
      render: (item) => formatCurrency(item.unit_price)
    },
    {
      key: 'subtotal',
      header: 'Subtotal',
      align: 'right',
      render: (item) => formatCurrency(item.subtotal)
    }
  ]

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Sales Transactions</h1>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <label htmlFor="transaction-date" className="sr-only">
              Filter by date
            </label>
            <input
              id="transaction-date"
              type="date"
              value={dateFilter}
              max={todayKey}
              onChange={(e) => {
                setDateFilter(e.target.value || toLocalDateKey(new Date()))
                setPage(1)
              }}
              className="border-line-strong border rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <FilterSelect
            label="Payment method filter"
            value={paymentFilter}
            onChange={(value) => {
              setPaymentFilter(value)
              setPage(1)
            }}
            options={[...PAYMENT_FILTERS]}
            className="sm:w-52"
          />
          {filtersActive && (
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
        {filtersActive && (
          <p aria-live="polite" className="text-sm text-slate-600 mt-2">
            {filteredSales.length} {filteredSales.length === 1 ? 'result' : 'results'}
          </p>
        )}
      </div>

      <Table
        columns={columns}
        rows={filteredSales.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
        rowKey={(sale) => sale.id}
        emptyMessage={emptyMessage}
      />

      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span aria-live="polite" className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <Modal
        open={loadingDetail || selectedSale !== null}
        title="Transaction Details"
        maxWidth="max-w-lg"
        onClose={() => setSelectedSale(null)}
      >
        {loadingDetail ? (
          <LoadingSpinner />
        ) : selectedSale ? (
          <div className="space-y-4">
            <div className="bg-panel p-4 rounded-lg">
              <p className="text-sm text-slate-600">Receipt Number</p>
              <p className="font-mono font-bold">{selectedSale.receipt_number}</p>
            </div>

            <div className="bg-panel p-4 rounded-lg">
              <p className="text-sm text-slate-600">Date</p>
              <p>{new Date(selectedSale.transaction_date).toLocaleString()}</p>
            </div>

            <div className="bg-panel p-4 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">Items</p>
              <Table
                dense
                label="Items"
                columns={itemColumns}
                rows={selectedSale.items ?? []}
                rowKey={(item) => item.id}
                emptyMessage="No items"
              />
            </div>

            <div className="bg-brand-subtle p-4 rounded-lg">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-ink">
                  {formatCurrency(selectedSale.total_amount)}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/receipts/${selectedSale.id}`)}
              >
                View Receipt
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}