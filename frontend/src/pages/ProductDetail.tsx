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
          <div className="overflow-hidden rounded-xl bg-gray-100">
            <img
              src={images.length > 0 ? toImageUrl(images[selectedImage]) : getPlaceholderImage(600, 400, product.name)}
              alt={product.name}
              className="h-[400px] w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = getPlaceholderImage(600, 400, product.name)
              }}
            />
          </div>
          {images.length > 1 && (
            <div className="custom-scrollbar flex gap-2 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                    selectedImage === idx ? 'border-blue-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={toImageUrl(img)}
                    alt=""
                    className="h-20 w-20 object-cover"
                  />
                </button>
              ))}
            </div>
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
