import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { endpoints } from '../../api/endpoints'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import { toImageUrl } from '../../utils/image'

type ProductForm = {
  name: string
  category_id: number | ''
  description: string
  story: string
  sizes: string
  colors: string
  discount: number | ''
  price: number | ''
  quantity: number | ''
  path: FileList | null
}

type Product = {
  id: number
  name: string
  category: number
  description: string
  story: string
  size: string
  color: string
  discount: number
  price: number
  quantity: number
  images: string[]
}

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<ProductForm>({
    name: '',
    category_id: '',
    description: '',
    story: '',
    sizes: '',
    colors: '',
    discount: 0,
    price: '',
    quantity: '',
    path: null,
  })

  const fetchProducts = () => {
    setLoading(true)
    Promise.all([
      api.get(endpoints.admin.products).then((r) => setProducts((r.data as any).data || [])),
      api.get(endpoints.admin.categories).then((r) => setCategories((r.data as any).data || [])),
    ])
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const resetForm = () => {
    setForm({
      name: '',
      category_id: '',
      description: '',
      story: '',
      sizes: '',
      colors: '',
      discount: 0,
      price: '',
      quantity: '',
      path: null,
    })
    setEditingProduct(null)
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      category_id: product.category,
      description: product.description,
      story: product.story,
      sizes: product.size || '',
      colors: product.color || '',
      discount: product.discount,
      price: product.price,
      quantity: product.quantity,
      path: null,
    })
    setShowModal(true)
  }

  const submit = async () => {
    setSubmitting(true)
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('category_id', String(form.category_id))
    fd.append('description', form.description)
    fd.append('story', form.story)
    fd.append('sizes', form.sizes)
    fd.append('colors', form.colors)
    fd.append('discount', String(form.discount || 0))
    fd.append('price', String(form.price))
    fd.append('quantity', String(form.quantity))
    
    if (form.path) {
      Array.from(form.path).forEach((file) => fd.append('path', file))
    }

    try {
      if (editingProduct) {
        await api.put(endpoints.admin.product(editingProduct.id), fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        await api.post(endpoints.admin.products, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      resetForm()
      setShowModal(false)
      fetchProducts()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to save product')
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(endpoints.admin.product(id))
      fetchProducts()
    } catch (e) {
      alert('Failed to delete product')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
          <p className="text-gray-600">{products.length} total products</p>
        </div>
        <Button onClick={openCreateModal} size="lg">
          + Add New Product
        </Button>
      </div>

      {/* Products Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Discount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={toImageUrl(p.images?.[0])}
                        alt={p.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{p.name}</div>
                        <div className="text-sm text-gray-500">ID: {p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge variant="info">
                      {categories.find((c) => c.id === p.category)?.name || 'Unknown'}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-semibold text-gray-900">Rs {p.price}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge variant={p.quantity > 10 ? 'success' : p.quantity > 0 ? 'warning' : 'danger'}>
                      {p.quantity} units
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {p.discount > 0 ? (
                      <Badge variant="danger">{p.discount}% OFF</Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button onClick={() => openEditModal(p)} variant="outline" size="sm">
                        ✏️ Edit
                      </Button>
                      <Button onClick={() => remove(p.id)} variant="danger" size="sm">
                        🗑️ Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="py-12 text-center">
              <div className="mb-3 text-5xl">📦</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No products yet</h3>
              <p className="mb-4 text-gray-500">Get started by creating your first product</p>
              <Button onClick={openCreateModal}>Create Product</Button>
            </div>
          )}
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          resetForm()
        }}
        title={editingProduct ? 'Edit Product' : 'Create New Product'}
        size="xl"
      >
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Product Name *"
              placeholder="e.g., Handwoven Tapestry"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category *</label>
              <select
                value={form.category_id as number}
                onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Describe the product..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Story/Details</label>
            <textarea
              value={form.story}
              onChange={(e) => setForm({ ...form, story: e.target.value })}
              rows={2}
              placeholder="Tell the story behind this product..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Available Sizes"
              placeholder="e.g., Small, Medium, Large"
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
            />
            <Input
              label="Available Colors"
              placeholder="e.g., Red, Blue, Green"
              value={form.colors}
              onChange={(e) => setForm({ ...form, colors: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Price (Rs) *"
              type="number"
              placeholder="0"
              value={form.price as number}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
            <Input
              label="Discount (%)"
              type="number"
              placeholder="0"
              value={form.discount as number}
              onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
            />
            <Input
              label="Stock Quantity *"
              type="number"
              placeholder="0"
              value={form.quantity as number}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Product Images {editingProduct ? '(optional - upload to replace)' : '*'}
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setForm({ ...form, path: e.target.files })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">You can upload multiple images</p>
          </div>

          {editingProduct && editingProduct.images && editingProduct.images.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Current Images</label>
              <div className="flex gap-2 overflow-x-auto">
                {editingProduct.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={toImageUrl(img)}
                    alt=""
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 border-t pt-4">
            <Button onClick={submit} disabled={submitting} className="flex-1">
              {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
            <Button
              onClick={() => {
                setShowModal(false)
                resetForm()
              }}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
