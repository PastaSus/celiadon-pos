import { useEffect, useRef, useState } from 'react'
import type { Category, Product } from '../../../shared/types'
import { fetchApi, formatCurrency } from '../lib/api'
import { Badge, Button, EmptyState, LoadingSpinner, Modal, SearchInput, Table, stockTone, useToast } from '../components'
import type { Column } from '../components'

const EMPTY_FORM = { name: '', price: '', stock_quantity: '' }

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
    // toast's identity is stable, so this still runs once on mount.
  }, [toast])

  const handleSearch = (term: string) => {
    // A whitespace-only term counts as cleared, matching the server, so the
    // UI never sits in searching mode over the full list.
    const query = term.trim()
    setSearchQuery(query)
    loadProducts(query)
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
      stock_quantity: product.stock_quantity.toString()
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
        stock_quantity: parseInt(formData.stock_quantity, 10)
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
      .then(setCategories)
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
      key: 'stock',
      header: 'Stock',
      render: (product) => (
        <Badge tone={stockTone(product.stock_quantity, product.reorder_level)}>
          {product.stock_quantity}
        </Badge>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={openCategories}>
            Manage categories
          </Button>
          <Button onClick={openAddModal}>+ Add Product</Button>
        </div>
      </div>

      <div className="mb-6 max-w-md">
        <SearchInput
          value={searchText}
          onChange={setSearchText}
          onSearch={handleSearch}
          placeholder="Search products..."
        />
        {searchQuery !== '' && (
          <p aria-live="polite" className="text-sm text-slate-500 mt-2">
            {products.length} {products.length === 1 ? 'result' : 'results'} for &ldquo;
            {searchQuery}&rdquo;
          </p>
        )}
      </div>

      <Table
        columns={columns}
        rows={products}
        rowKey={(product) => product.id}
        emptyMessage={
          searchQuery !== '' ? 'No products match this filter' : 'No products yet. Add your first product!'
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
          <div className="mb-6">
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
        <form onSubmit={handleAddCategory} className="flex gap-3 mb-6">
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
                      className="flex-1 border-line-strong border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
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