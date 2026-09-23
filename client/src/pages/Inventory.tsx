import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Category, Product } from '../../../shared/types'
import { fetchApi, formatCurrency } from '../lib/api'
import { Badge, Button, EmptyState, FilterSelect, LoadingSpinner, Modal, SearchInput, Table, stockStatus, stockTone, useToast } from '../components'
import type { Column, StockStatus } from '../components'

const EMPTY_FORM = { name: '', price: '', stock_quantity: '', category_id: '', reorder_level: '10' }

// The stock cell keeps the bare quantity and names the status for screen
// readers, so badge colour is never the only way to read a stock value.
const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  out: 'out of stock',
  low: 'low stock',
  healthy: 'in stock'
}

// Values double as the `?stock=` deep-link vocabulary the Dashboard's low-stock
// callout points at (FR27), so the URL and the filter state never diverge.
const STOCK_FILTERS = [
  { value: 'all', label: 'All stock' },
  { value: 'in-stock', label: 'In stock' },
  { value: 'low', label: 'Low stock' },
  { value: 'out-of-stock', label: 'Out of stock' }
] as const

type StockFilter = (typeof STOCK_FILTERS)[number]['value']

function readStockFilter(raw: string | null): StockFilter {
  return STOCK_FILTERS.some((option) => option.value === raw) ? (raw as StockFilter) : 'all'
}

export default function Inventory() {
  const toast = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [editCategoryName, setEditCategoryName] = useState('')
  const [confirmingCategoryId, setConfirmingCategoryId] = useState<number | null>(null)
  const [categorySaving, setCategorySaving] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  // Monotonic request id: a slow earlier search never overwrites fresher rows.
  const searchSeq = useRef(0)
  // Full catalog for the category delete warning, independent of the
  // search-filtered products list shown in the table.
  const [categoryScopeProducts, setCategoryScopeProducts] = useState<Product[]>([])
  const [searchParams, setSearchParams] = useSearchParams()
  // Read once from the URL so a deep link lands on a pre-filtered list (FR27).
  const [categoryFilter, setCategoryFilter] = useState(() => {
    const raw = searchParams.get('category')
    // Only a numeric id can name a category; anything else would leave the
    // select and the list disagreeing about what is actually filtered.
    return raw !== null && /^\d+$/.test(raw) ? raw : 'all'
  })
  const [stockFilter, setStockFilter] = useState<StockFilter>(() =>
    readStockFilter(searchParams.get('stock'))
  )

  // Keep the URL in step with the filters so a filtered list stays linkable.
  // `replace` keeps a history entry per filter change out of the back button.
  useEffect(() => {
    const next = new URLSearchParams()
    if (categoryFilter !== 'all') next.set('category', categoryFilter)
    if (stockFilter !== 'all') next.set('stock', stockFilter)
    // Compare before navigating: react-router treats a same-value navigation as
    // a fresh location, which would re-run this effect on every render.
    if (next.toString() === searchParams.toString()) return
    setSearchParams(next, { replace: true })
  }, [categoryFilter, stockFilter, searchParams, setSearchParams])

  const loadProducts = (query: string) => {
    const my = ++searchSeq.current
    const endpoint = query === '' ? '/products' : `/products?search=${encodeURIComponent(query)}`
    fetchApi<Product[]>(endpoint)
      .then((rows) => {
        if (my === searchSeq.current) setProducts(rows)
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to load products')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts('')
    // The filter row and the product form both need the category list.
    loadCategories()
    // toast's identity is stable, so this still runs once on mount.
  }, [toast])

  const handleSearch = (term: string) => {
    // A whitespace-only term counts as cleared, matching the server, so the
    // UI never sits in searching mode over the full list.
    const query = term.trim()
    setSearchQuery(query)
    loadProducts(query)
  }

  const filtersActive = searchQuery !== '' || categoryFilter !== 'all' || stockFilter !== 'all'

  // "In stock" is what a cashier can sell (above zero), and low stock is the
  // subset of it at or below the product's own reorder level, so nothing
  // sellable is ever hidden by asking for what is available. The status comes
  // from the same helper the badge uses, so the filter and the column behind it
  // can never contradict each other.
  const visibleProducts = products.filter((product) => {
    if (categoryFilter !== 'all' && String(product.category_id) !== categoryFilter) return false
    const status = stockStatus(product.stock_quantity, product.reorder_level)
    if (stockFilter === 'in-stock') return status !== 'out'
    if (stockFilter === 'low') return status === 'low'
    if (stockFilter === 'out-of-stock') return status === 'out'
    return true
  })

  // One click restores the unfiltered list (UX-DR26) - the search term included.
  const clearFilters = () => {
    setSearchText('')
    setSearchQuery('')
    setCategoryFilter('all')
    setStockFilter('all')
    loadProducts('')
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
    setFormData(EMPTY_FORM)
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setFormData(EMPTY_FORM)
    setShowModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      category_id: product.category_id === null ? '' : String(product.category_id),
      reorder_level: product.reorder_level.toString()
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity, 10),
        category_id: formData.category_id === '' ? null : Number(formData.category_id),
        // Always sent: PUT is a full-record replace, so omitting the key would
        // silently reset a tuned threshold to the server's default of 10.
        reorder_level: parseInt(formData.reorder_level, 10)
      }

      if (editingProduct) {
        await fetchApi(`/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        })
        toast.success('Product updated')
      } else {
        await fetchApi('/products', {
          method: 'POST',
          body: JSON.stringify(data)
        })
        toast.success('Product added')
      }

      closeModal()
      loadProducts(searchQuery)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await fetchApi(`/products/${pendingDelete.id}`, { method: 'DELETE' })
      toast.success('Product deleted')
      setPendingDelete(null)
      loadProducts(searchQuery)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete product')
    }
  }

  const loadCategories = () => {
    setCategoriesLoading(true)
    fetchApi<Category[]>('/categories')
      .then((rows) => {
        setCategories(rows)
        // A deleted category must not leave a filter selected that no longer exists.
        setCategoryFilter((prev) =>
          prev === 'all' || rows.some((category) => String(category.id) === prev) ? prev : 'all'
        )
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to load categories')
      })
      .finally(() => setCategoriesLoading(false))
  }

  const openCategories = () => {
    setNewCategoryName('')
    setEditingCategoryId(null)
    setConfirmingCategoryId(null)
    setShowCategories(true)
    loadCategories()
    fetchApi<Product[]>('/products')
      .then(setCategoryScopeProducts)
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to load products')
      })
  }

  const closeCategories = () => {
    setShowCategories(false)
    setEditingCategoryId(null)
    setConfirmingCategoryId(null)
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setCategorySaving(true)
    try {
      await fetchApi('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newCategoryName })
      })
      toast.success('Category added')
      setNewCategoryName('')
      loadCategories()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add category')
    } finally {
      setCategorySaving(false)
    }
  }

  const handleRenameCategory = async (id: number) => {
    setCategorySaving(true)
    try {
      await fetchApi(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editCategoryName })
      })
      toast.success('Category renamed')
      setEditingCategoryId(null)
      loadCategories()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to rename category')
    } finally {
      setCategorySaving(false)
    }
  }

  const handleDeleteCategory = async (id: number) => {
    setCategorySaving(true)
    try {
      await fetchApi(`/categories/${id}`, { method: 'DELETE' })
      toast.success('Category deleted')
      setConfirmingCategoryId(null)
      loadCategories()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete category')
    } finally {
      setCategorySaving(false)
    }
  }

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (product) => <span className="font-medium text-slate-900">{product.name}</span>
    },
    {
      key: 'price',
      header: 'Price',
      render: (product) => <span className="text-slate-600">{formatCurrency(product.price)}</span>
    },
    {
      key: 'category',
      header: 'Category',
      render: (product) => {
        const category = categories.find((item) => item.id === product.category_id)
        if (!category) return <span className="text-sm text-slate-500">Uncategorized</span>
        // Neutral badge, never azure: azure is reserved for interactive elements.
        return <Badge tone="gray">{category.name}</Badge>
      }
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (product) => {
        const status = stockStatus(product.stock_quantity, product.reorder_level)
        return (
          <Badge tone={stockTone(product.stock_quantity, product.reorder_level)}>
            {product.stock_quantity}
            <span className="sr-only"> {STOCK_STATUS_LABEL[status]}</span>
          </Badge>
        )
      }
    },
    {
      key: 'reorder_level',
      header: 'Reorder at',
      render: (product) => (
        <span className="text-sm text-slate-600 tabular-nums">{product.reorder_level}</span>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (product) => (
        <span className="text-sm text-slate-500">
          {new Date(product.created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product) => (
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(product)}>
            Edit
          </Button>
          <Button variant="dangerGhost" size="sm" onClick={() => setPendingDelete(product)}>
            Delete
          </Button>
        </div>
      )
    }
  ]

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" className="w-full sm:w-auto" onClick={openCategories}>
            Manage categories
          </Button>
          <Button className="w-full sm:w-auto" onClick={openAddModal}>+ Add Product</Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="sm:flex-1 sm:max-w-md">
            <SearchInput
              value={searchText}
              onChange={setSearchText}
              onSearch={handleSearch}
              placeholder="Search products..."
            />
          </div>
          <FilterSelect
            label="Category filter"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: 'all', label: 'All categories' },
              ...categories.map((category) => ({
                value: String(category.id),
                label: category.name
              }))
            ]}
            className="sm:w-52"
          />
          <FilterSelect
            label="Stock status filter"
            value={stockFilter}
            onChange={(value) => setStockFilter(readStockFilter(value))}
            options={[...STOCK_FILTERS]}
            className="sm:w-44"
          />
          {filtersActive && (
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
        {filtersActive && (
          <p aria-live="polite" className="text-sm text-slate-600 mt-2">
            {visibleProducts.length} {visibleProducts.length === 1 ? 'result' : 'results'}
            {searchQuery !== '' && ` for \u201C${searchQuery}\u201D`}
          </p>
        )}
      </div>

      <Table
        columns={columns}
        rows={visibleProducts}
        rowKey={(product) => product.id}
        emptyMessage={
          filtersActive ? 'No products match this filter' : 'No products yet. Add your first product!'
        }
      />

      <Modal
        open={showModal}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="product-name" className="block text-sm font-medium text-slate-700 mb-1">
              Product Name
              <span aria-hidden="true" className="text-danger"> *</span>
            </label>
            <input
              id="product-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border-line-strong border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="product-price" className="block text-sm font-medium text-slate-700 mb-1">
              Price
              <span aria-hidden="true" className="text-danger"> *</span>
            </label>
            <input
              id="product-price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full border-line-strong border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="product-category"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Category
            </label>
            <select
              id="product-category"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full border-line-strong border rounded-lg px-3 py-2 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="product-stock" className="block text-sm font-medium text-slate-700 mb-1">
              Stock Quantity
              <span aria-hidden="true" className="text-danger"> *</span>
            </label>
            <input
              id="product-stock"
              type="number"
              min="0"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
              className="w-full border-line-strong border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="product-reorder" className="block text-sm font-medium text-slate-700 mb-1">
              Reorder Level
              <span aria-hidden="true" className="text-danger"> *</span>
            </label>
            <input
              id="product-reorder"
              type="number"
              min="0"
              step="1"
              value={formData.reorder_level}
              onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
              className="w-full border-line-strong border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
            <p className="mt-1 text-sm text-slate-500">
              Warn when stock is at or below this quantity.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingProduct ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={pendingDelete !== null}
        title="Delete product"
        onClose={() => setPendingDelete(null)}
      >
        <p className="text-sm text-slate-600">
          Delete <span className="font-semibold">{pendingDelete?.name}</span>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setPendingDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>

      <Modal open={showCategories} title="Manage categories" onClose={closeCategories}>
        <form onSubmit={handleAddCategory} className="flex flex-wrap gap-3 mb-6">
          <label htmlFor="new-category" className="sr-only">
            New category name
          </label>
          <input
            id="new-category"
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name"
            maxLength={255}
            required
            className="flex-1 border-line-strong border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <Button type="submit" disabled={categorySaving}>
            Add
          </Button>
        </form>

        {categoriesLoading ? (
          <LoadingSpinner label="Loading categories..." />
        ) : categories.length === 0 ? (
          <EmptyState message="No categories yet." />
        ) : (
          <ul className="space-y-2">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between gap-3 border-b border-line pb-2"
              >
                {editingCategoryId === category.id ? (
                  <form
                    className="flex flex-1 items-center justify-between gap-3"
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleRenameCategory(category.id)
                    }}
                  >
                    <label htmlFor={`rename-category-${category.id}`} className="sr-only">
                      Category name
                    </label>
                    <input
                      id={`rename-category-${category.id}`}
                      type="text"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      maxLength={255}
                      required
            className="flex-1 min-w-0 border-line-strong border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                    <div className="flex gap-3">
                      <Button type="submit" size="sm" disabled={categorySaving}>
                        Save
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingCategoryId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : confirmingCategoryId === category.id ? (
                  <>
                    <span className="text-sm text-slate-600">
                      Delete <span className="font-semibold">{category.name}</span>?
                      {(() => {
                        const using = categoryScopeProducts.filter((p) => p.category_id === category.id)
                        if (using.length === 0) return null
                        return (
                          <span>
                            {' '}
                            {using.length} {using.length === 1 ? 'product uses' : 'products use'}{' '}
                            it: {using.map((p) => p.name).join(', ')}.
                          </span>
                        )
                      })()}
                    </span>
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={categorySaving}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setConfirmingCategoryId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-slate-800">{category.name}</span>
                    <div className="flex gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Edit ${category.name}`}
                        onClick={() => {
                          setEditingCategoryId(category.id)
                          setEditCategoryName(category.name)
                          setConfirmingCategoryId(null)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="dangerGhost"
                        size="sm"
                        aria-label={`Delete ${category.name}`}
                        onClick={() => {
                          setConfirmingCategoryId(category.id)
                          setEditingCategoryId(null)
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  )
}