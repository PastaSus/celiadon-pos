import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Sale } from '../../../shared/types'
import { fetchApi } from '../lib/api'
import { Button, EmptyState, LoadingSpinner, useToast } from '../components'
import ReceiptView from '../components/ReceiptView'

export default function Receipt() {
  const { id } = useParams()
  const toast = useToast()
  const [sale, setSale] = useState<Sale | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id || !/^\d+$/.test(id)) {
      setNotFound(true)
      setLoading(false)
      return
    }
    fetchApi<Sale>(`/sales/${id}`)
      .then(setSale)
      .catch((error) => {
        setNotFound(true)
        toast.error(error instanceof Error ? error.message : 'Failed to load receipt')
      })
      .finally(() => setLoading(false))
  }, [id, toast])

  if (loading) {
    return <LoadingSpinner />
  }

  if (notFound || !sale) {
    return (
      <EmptyState
        message="Receipt not found."
        action={
          <Link
            to="/transactions"
            className="rounded-md text-sm text-brand hover:text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Back to Transactions
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3 print:hidden">
        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          Print Receipt
        </Button>
        <Link
          to="/pos"
          className="rounded-md text-sm text-brand hover:text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          New Sale
        </Link>
        <Link
          to="/transactions"
          className="rounded-md text-sm text-brand hover:text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          Back to Transactions
        </Link>
      </div>
      <ReceiptView sale={sale} />
    </div>
  )
}
