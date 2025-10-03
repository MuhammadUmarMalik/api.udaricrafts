import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { endpoints } from '../../api/endpoints'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import { toImageUrl, getPlaceholderImage } from '../../utils/image'

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

type ProductImage = {
  id: number
  path: string
  productId: number
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
  images: ProductImage[]
}

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null)
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

  const deleteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return
    setDeletingImageId(imageId)
    try {
      await api.delete(endpoints.admin.productImage(imageId))
      
      // Update the editing product's images locally
      if (editingProduct) {
        setEditingProduct({
          ...editingProduct,
          images: editingProduct.images.filter(img => img.id !== imageId)
        })
      }
      
      // Refresh the products list
      fetchProducts()
      alert('Image deleted successfully!')
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to delete image')
    } finally {
      setDeletingImageId(null)
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

      {/* Products Grid */}
      {products.length === 0 ? (
        <Card className="border-0 shadow-md">
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No products yet</h3>
            <p className="mb-6 text-gray-500">Get started by creating your first product</p>
            <Button onClick={openCreateModal} className="shadow-lg">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Product
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <Card key={p.id} className="group relative flex flex-col overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src={p.images && p.images.length > 0 && p.images[0]?.path ? toImageUrl(p.images[0].path) : getPlaceholderImage(400, 400, p.name)}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.currentTarget
                    target.src = getPlaceholderImage(400, 400, p.name)
                    target.onerror = null
                  }}
                  loading="lazy"
                />
                
                {/* Discount Badge */}
                {p.discount > 0 && (
                  <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    {p.discount}% OFF
                  </div>
                )}

                {/* Image Count Badge */}
                {p.images && p.images.length > 1 && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    {p.images.length}
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </div>

              {/* Product Info */}
              <div className="flex flex-1 flex-col p-5">
                {/* Category Badge */}
                <div className="mb-3">
                  <Badge variant="info" className="text-xs">
                    {categories.find((c) => c.id === p.category)?.name || 'Unknown'}
                  </Badge>
                </div>

                {/* Product Name */}
                <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 group-hover:text-blue-600">
                  {p.name}
                </h3>

                {/* Product ID */}
                <p className="mb-3 text-xs text-gray-500">
                  ID: <span className="font-mono font-medium">{p.id}</span>
                </p>

                {/* Price and Stock */}
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      Rs {p.price.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Badge 
                      variant={p.quantity > 10 ? 'success' : p.quantity > 0 ? 'warning' : 'danger'}
                      className="inline-flex items-center gap-1"
                    >
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                      </svg>
                      {p.quantity}
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto grid grid-cols-2 gap-2 border-t pt-4">
                  <button
                    onClick={() => openEditModal(p)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition-all hover:bg-blue-600 hover:text-white hover:shadow-md"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-all hover:bg-red-600 hover:text-white hover:shadow-md"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

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
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Current Images ({editingProduct.images.length})
              </label>
              <div className="custom-scrollbar flex gap-3 overflow-x-auto rounded-lg bg-gray-50 p-4">
                {editingProduct.images.map((img, idx) => (
                  <div key={img.id} className="group relative flex-shrink-0 overflow-hidden rounded-lg border-2 border-gray-200 shadow-sm transition-all hover:border-blue-400 hover:shadow-md">
                    <img
                      src={toImageUrl(img.path)}
                      alt={`Product image ${idx + 1}`}
                      className="h-32 w-32 rounded-lg object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.currentTarget
                        target.src = getPlaceholderImage(150, 150, `${idx + 1}`)
                        target.onerror = null
                      }}
                    />
                    
                    {/* Image Number Badge */}
                    <div className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white shadow-md">
                      #{idx + 1}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteImage(img.id)}
                      disabled={deletingImageId === img.id}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-all hover:bg-red-700 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete this image"
                    >
                      {deletingImageId === img.id ? (
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>

                    {/* Image ID for reference */}
                    <div className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-mono text-white">
                      ID: {img.id}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 p-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-xs text-blue-800">
                  <p className="font-semibold">Image Management:</p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5">
                    <li>Click the red trash icon to delete an image</li>
                    <li>Upload new images below to add more (won't replace existing)</li>
                    <li>At least one image is recommended for display</li>
                  </ul>
                </div>
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
