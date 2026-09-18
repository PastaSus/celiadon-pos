import { useEffect, useState } from 'react'
import type { Product } from '../../../shared/types'
import { fetchApi, formatCurrency } from '../lib/api'
import { Badge, Button, LoadingSpinner, Modal, Table, stockTone, useToast } from '../components'
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

  const loadProducts = () => {
    fetchApi<Product[]>('/products')
      .then(setProducts)
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to load products')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts()
    // toast's identity is stable, so this still runs once on mount.
  }, [toast])

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
      loadProducts()
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
      loadProducts()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete product')
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
        <Button onClick={openAddModal}>+ Add Product</Button>
      </div>

      <Table
        columns={columns}
        rows={products}
        rowKey={(product) => product.id}
        emptyMessage="No products yet. Add your first product!"
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
    </div>
  )
}