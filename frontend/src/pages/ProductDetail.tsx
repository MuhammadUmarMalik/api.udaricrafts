import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import { endpoints } from '../api/endpoints'
import { useCartStore } from '../store/cart'
import { toImageUrl, getPlaceholderImage } from '../utils/image'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'

type Product = {
  id: number
  name: string
  description: string
  story?: string
  price: number
  discount?: number
  quantity?: number
  images?: string[]
}

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    if (!id) return
    api
      .get(endpoints.products(Number(id)))
      .then((r) => {
        setProduct((r.data as any).data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
      },
      quantity
    )
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 py-20 text-center">
        <div className="mb-3 text-5xl">❌</div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Product not found</h3>
      </div>
    )
  }

  const images = product.images && product.images.length > 0 ? product.images : []

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
            <img
              src={images.length > 0 ? toImageUrl(images[selectedImage]) : getPlaceholderImage(600, 400, product.name)}
              alt={product.name}
              className="h-[500px] w-full object-contain transition-transform duration-300"
              onError={(e) => {
                const target = e.currentTarget
                target.src = getPlaceholderImage(600, 400, product.name)
                target.onerror = null // Prevent infinite loop
              }}
              loading="eager"
            />
            {product.discount && product.discount > 0 && (
              <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                {product.discount}% OFF
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="custom-scrollbar flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`group relative flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                    selectedImage === idx 
                      ? 'border-blue-600 shadow-lg ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <img
                    src={toImageUrl(img)}
                    alt={`${product.name} - Image ${idx + 1}`}
                    className="h-24 w-24 object-cover transition-transform duration-200 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.currentTarget
                      target.src = getPlaceholderImage(100, 100, `${idx + 1}`)
                      target.onerror = null
                    }}
                    loading="lazy"
                  />
                  {selectedImage === idx && (
                    <div className="absolute inset-0 bg-blue-600/10"></div>
                  )}
                </button>
              ))}
            </div>
          )}
          {images.length === 0 && (
            <p className="text-center text-sm text-gray-500">No images available for this product</p>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="mb-3 text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-blue-600">
                Rs {product.price}
              </span>
              {product.discount && product.discount > 0 && (
                <Badge variant="danger">{product.discount}% OFF</Badge>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="mb-2 font-semibold text-gray-900">Description</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {product.story && (
            <div className="border-t pt-6">
              <h3 className="mb-2 font-semibold text-gray-900">Story</h3>
              <p className="text-gray-600">{product.story}</p>
            </div>
          )}

          {product.quantity !== undefined && (
            <div className="border-t pt-6">
              <Badge variant={product.quantity > 0 ? 'success' : 'danger'}>
                {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
              </Badge>
            </div>
          )}

          <div className="border-t pt-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-lg border border-gray-300">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-6 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t pt-6">
            <Button
              onClick={handleAddToCart}
              className="w-full"
              size="lg"
              disabled={product.quantity === 0}
            >
              {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
