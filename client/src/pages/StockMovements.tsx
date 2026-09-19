import { useEffect, useRef, useState } from 'react'
import type { Product, StockMovement, StockMovementType } from '../../../shared/types'
import { fetchApi } from '../lib/api'
import { Badge, Button, FilterSelect, LoadingSpinner, Modal, SearchInput, Table, useToast } from '../components'
import type { Column, Tone } from '../components'

const EMPTY_FORM = { product_id: '', type: 'restock' as StockMovementType, quantity: '', reason: '' }

const TYPE_LABELS: Record<StockMovementType, string> = {
  sale: 'Sale',
  restock: 'Restock',
  adjustment: 'Adjustment',
  return: 'Return'
}

// An adjustment carries no judgment, and neither does a sale - DESIGN.md is
// explicit that an adjustment gets no color. Stock coming back in is the only
// positive signal, so it is the only type that earns the commit tone. Direction
// lives in the signed delta column, never in the color alone.
const TYPE_TONES: Record<StockMovementType, Tone> = {
  sale: 'gray',
  restock: 'green',
  adjustment: 'gray',
  return: 'green'
}

// Hand-recordable types, mirroring the API's MANUAL_TYPES: a sale movement is
// written by the sale transaction, never by a person filling in a form.
const MANUAL_TYPES: StockMovementType[] = ['restock', 'adjustment', 'return']

export default function StockMovements() {
  const toast = useToast()
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [productFilter, setProductFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  // Monotonic request id: a slow earlier filter never overwrites fresher rows.
  const listSeq = useRef(0)

  // Filters go to the server rather than being applied here, unlike Inventory's
  // in-memory row filter: movement history grows without bound and is never all
  // loaded just to be narrowed afterwards.
  const loadMovements = () => {
    const my = ++listSeq.current
    const params = new URLSearchParams()
    if (productFilter !== 'all') params.set('product_id', productFilter)
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (searchQuery !== '') params.set('search', searchQuery)
    const query = params.toString()
    fetchApi<StockMovement[]>(`/stock/movements${query === '' ? '' : `?${query}`}`)
      .then((rows) => {
        if (my === listSeq.current) setMovements(rows)
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to load stock movements')
      })
      .finally(() => {
        if (my === listSeq.current) setLoading(false)
      })
  }

  const loadProducts = () =>
    fetchApi<Product[]>('/products')
      .then(setProducts)
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to load products')
      })

  useEffect(() => {
    loadProducts()
    // toast's identity is stable, so this still runs once on mount.
  }, [toast])

  useEffect(() => {
    loadMovements()
  }, [searchQuery, productFilter, typeFilter, toast])

  const filtersActive = searchQuery !== '' || productFilter !== 'all' || typeFilter !== 'all'

  // One click restores the unfiltered list, search term included (UX-DR26).
  const clearFilters = () => {
    setSearchText('')
    setSearchQuery('')
    setProductFilter('all')
    setTypeFilter('all')
  }

  const openModal = () => {
    setFormData(EMPTY_FORM)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setFormData(EMPTY_FORM)
  }

  const selectedProduct = products.find((product) => String(product.id) === formData.product_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await fetchApi('/stock/movements', {
        method: 'POST',
        body: JSON.stringify({
          product_id: Number(formData.product_id),
          type: formData.type,
          quantity: parseInt(formData.quantity, 10),
          reason: formData.reason
        })
      })
      toast.success('Stock movement recorded')
      closeModal()
      // The movement moved a quantity, so both the history and the product list
      // behind it are reloaded (UX-DR23).
      loadMovements()
      loadProducts()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to record stock movement')
    } finally {
      setSaving(false)
    }
  }

  const columns: Column<StockMovement>[] = [
    {
      key: 'created_at',
      header: 'When',
      render: (movement) => (
        <span className="text-sm text-slate-500">
          {new Date(movement.created_at).toLocaleString()}
        </span>
      )
    },
    {
      key: 'product',
      header: 'Product',
      render: (movement) => (
        <span className="font-medium text-slate-900">{movement.product_name ?? 'Deleted product'}</span>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (movement) => (
        <Badge tone={TYPE_TONES[movement.type]}>{TYPE_LABELS[movement.type]}</Badge>
      )
    },
    {
      key: 'quantity',
      header: 'Change',
      align: 'right',
      render: (movement) => (
        <span className={`tabular-nums ${movement.quantity > 0 ? 'text-commit' : 'text-slate-600'}`}>
          {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
        </span>
      )
    },
    {
      key: 'user',
      header: 'Who',
      render: (movement) => (
        <span className="text-sm text-slate-500">{movement.user_email ?? 'Unknown user'}</span>
      )
    },
    {
      key: 'reason',
      header: 'Note',
      render: (movement) => (
        <span className="text-sm text-slate-500">{movement.reason ?? 'No reason recorded'}</span>
      )
    }
  ]

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Stock Movements</h1>
        {/* Nothing to restock before a product exists, so the action is absent
            rather than rendered disabled (UX-DR25). */}
        {products.length > 0 && <Button onClick={openModal}>Record movement</Button>}
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="sm:flex-1 sm:max-w-md">
            <SearchInput
              value={searchText}
              onChange={setSearchText}
              onSearch={setSearchQuery}
              placeholder="Search products..."
            />
          </div>
          <FilterSelect
            label="Product filter"
            value={productFilter}
            onChange={setProductFilter}
            options={[
              { value: 'all', label: 'All products' },
              ...products.map((product) => ({
                value: String(product.id),
                label: product.name
              }))
            ]}
            className="sm:w-56"
          />
          <FilterSelect
            label="Type filter"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'all', label: 'All types' },
              ...Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }))
            ]}
            className="sm:w-44"
          />
          {filtersActive && (
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
        {filtersActive && (
          <p aria-live="polite" className="text-sm text-slate-500 mt-2">
            {movements.length} {movements.length === 1 ? 'result' : 'results'}
            {searchQuery !== '' && ` for \u201C${searchQuery}\u201D`}
          </p>
        )}
      </div>

      <Table
        columns={columns}
        rows={movements}
        rowKey={(movement) => movement.id}
        emptyMessage={
          filtersActive ? 'No stock movements match this filter' : 'No stock movements yet.'
        }
      />

      <Modal open={showModal} title="Record movement" onClose={closeModal}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="movement-product"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Product
              <span aria-hidden="true" className="text-danger"> *</span>
            </label>
            <select
              id="movement-product"
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              className="w-full border-line-strong border rounded-lg px-3 py-2 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand"
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={String(product.id)}>
                  {product.name} — {product.stock_quantity} in stock
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="movement-type" className="block text-sm font-medium text-slate-700 mb-1">
              Type
              <span aria-hidden="true" className="text-danger"> *</span>
            </label>
            <select
              id="movement-type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as StockMovementType })
              }
              className="w-full border-line-strong border rounded-lg px-3 py-2 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {MANUAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="movement-quantity"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              New quantity
              <span aria-hidden="true" className="text-danger"> *</span>
            </label>
            <input
              id="movement-quantity"
              type="number"
              min="0"
              step="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full border-line-strong border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
            <p className="mt-1 text-sm text-slate-500">
              {selectedProduct
                ? `Currently ${selectedProduct.stock_quantity} in stock.`
                : 'The quantity the shelf should hold when this is done.'}
            </p>
          </div>
          <div className="mb-6">
            <label
              htmlFor="movement-reason"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Reason
              <span aria-hidden="true" className="text-danger"> *</span>
            </label>
            <input
              id="movement-reason"
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Weekly delivery, stocktake correction, damaged in transit"
              className="w-full border-line-strong border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Recording...' : 'Record movement'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
