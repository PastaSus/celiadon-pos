import { useEffect, useState } from 'react'
import type { Sale, SaleDetail } from '../../../shared/types'
import { fetchApi, formatCurrency } from '../lib/api'
import { Button, LoadingSpinner, Modal, Table, useToast } from '../components'
import type { Column } from '../components'

export default function Transactions() {
  const toast = useToast()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    fetchApi<Sale[]>('/sales')
      .then(setSales)
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to load transactions')
      })
      .finally(() => setLoading(false))
  }, [toast])

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

      <Table
        columns={columns}
        rows={sales}
        rowKey={(sale) => sale.id}
        emptyMessage="No transactions yet"
      />

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
              <p className="text-sm text-slate-500">Receipt Number</p>
              <p className="font-mono font-bold">{selectedSale.receipt_number}</p>
            </div>

            <div className="bg-panel p-4 rounded-lg">
              <p className="text-sm text-slate-500">Date</p>
              <p>{new Date(selectedSale.transaction_date).toLocaleString()}</p>
            </div>

            <div className="bg-panel p-4 rounded-lg">
              <p className="text-sm text-slate-500 mb-2">Items</p>
              <Table
                dense
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
          </div>
        ) : null}
      </Modal>
    </div>
  )
}