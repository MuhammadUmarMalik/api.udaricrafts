import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import { endpoints } from '../api/endpoints'
import { useCartStore } from '../store/cart'
import { toImageUrl, getPlaceholderImage } from '../utils/image'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'

type ProductImage = {
  id: number
  path: string
  productId: number
}

type Product = {
  id: number
  name: string
  description: string
  story?: string
  price: number
  discount?: number
  quantity?: number
  images?: ProductImage[] | string[]  // Support both formats for compatibility
}

type Review = {
  id: number
  productId: number
  rating: string
  description: string
  name: string
  email: string
  status: string
  createdAt: string
}

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  // Review states
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: '',
    rating: 5,
    description: ''
  })
  const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({})
  const [reviewSuccess, setReviewSuccess] = useState(false)

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

  // Function to fetch reviews for this product
  const fetchReviews = () => {
    if (!id) return
    setLoadingReviews(true)
    api
      .get(endpoints.reviews)
      .then((r) => {
        const allReviews = (r.data as any).data || []
        // Filter reviews for this product - show ALL reviews (not just approved)
        const productReviews = allReviews.filter(
          (review: Review) => review.productId === Number(id)
        )
        setReviews(productReviews)
      })
      .catch(() => {})
      .finally(() => setLoadingReviews(false))
  }

  // Fetch reviews for this product
  useEffect(() => {
    fetchReviews()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    // Handle both old format (string[]) and new format (object[])
    const firstImage = product.images && product.images.length > 0
      ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].path)
      : ''
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: firstImage,
      },
      quantity
    )
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1500)
  }

  const validateReview = () => {
    const errors: Record<string, string> = {}
    if (!reviewForm.name.trim()) errors.name = 'Name is required'
    if (!reviewForm.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewForm.email)) errors.email = 'Invalid email'
    if (!reviewForm.description.trim()) errors.description = 'Review description is required'
    if (reviewForm.description.trim().length < 10) errors.description = 'Review must be at least 10 characters'
    setReviewErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateReview() || !product) return

    setSubmittingReview(true)
    setReviewErrors({})

    try {
      await api.post(endpoints.reviews, {
        product_id: product.id,
        name: reviewForm.name,
        email: reviewForm.email,
        rating: reviewForm.rating.toString(),
        description: reviewForm.description,
        // Status is automatically set to 'pending' by the backend
      })

      setReviewSuccess(true)
      setReviewForm({ name: '', email: '', rating: 5, description: '' })
      setShowReviewForm(false)
      
      // Refresh reviews to show the newly submitted review
      fetchReviews()
      
      setTimeout(() => setReviewSuccess(false), 3000)
    } catch (error: any) {
      console.error('Review submission error:', error)
      setReviewErrors({
        submit: error.response?.data?.message || error.response?.data?.errors?.[0]?.message || 'Failed to submit review. Please try again.'
      })
    } finally {
      setSubmittingReview(false)
    }
  }

  const renderStars = (rating: number, interactive: boolean = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRate?.(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-all duration-200`}
          >
            <svg
              className={`h-5 w-5 ${
                star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    )
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
        <div className="mb-4 flex justify-center">
          <svg className="h-16 w-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Product not found</h3>
      </div>
    )
  }

  const images = product.images && product.images.length > 0 ? product.images : []
  
  // Helper function to get image path (handle both old and new format)
  const getImagePath = (img: ProductImage | string): string => {
    return typeof img === 'string' ? img : img.path
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
            <img
              src={images.length > 0 ? toImageUrl(getImagePath(images[selectedImage])) : getPlaceholderImage(600, 400, product.name)}
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
                    src={toImageUrl(getImagePath(img))}
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

      {/* Reviews Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <p className="mt-1 text-sm text-gray-500">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          <Button
            onClick={() => setShowReviewForm(!showReviewForm)}
            variant={showReviewForm ? 'outline' : 'primary'}
            size="sm"
          >
            {showReviewForm ? 'Cancel' : 'Write a Review'}
          </Button>
        </div>

        {/* Success Message */}
        {reviewSuccess && (
          <div className="animate-fade-in rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-semibold text-green-900">Review Submitted Successfully!</p>
                <p className="text-sm text-green-700">Your review will be published after admin approval.</p>
              </div>
            </div>
          </div>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Write Your Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Rating */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Rating <span className="text-red-500">*</span>
                </label>
                {renderStars(reviewForm.rating, true, (rating) => 
                  setReviewForm({ ...reviewForm, rating })
                )}
              </div>

              {/* Name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  placeholder="John Doe"
                  className={`w-full rounded-lg border ${
                    reviewErrors.name ? 'border-red-500' : 'border-gray-300'
                  } px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {reviewErrors.name && (
                  <p className="mt-1 text-xs text-red-600">{reviewErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Your Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={reviewForm.email}
                  onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                  placeholder="john@example.com"
                  className={`w-full rounded-lg border ${
                    reviewErrors.email ? 'border-red-500' : 'border-gray-300'
                  } px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {reviewErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{reviewErrors.email}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reviewForm.description}
                  onChange={(e) => setReviewForm({ ...reviewForm, description: e.target.value })}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  className={`w-full rounded-lg border ${
                    reviewErrors.description ? 'border-red-500' : 'border-gray-300'
                  } px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {reviewErrors.description && (
                  <p className="mt-1 text-xs text-red-600">{reviewErrors.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 10 characters ({reviewForm.description.length} / 10)
                </p>
              </div>

              {/* Error Message */}
              {reviewErrors.submit && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {reviewErrors.submit}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowReviewForm(false)
                    setReviewErrors({})
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Reviews List */}
        {loadingReviews ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" className="text-blue-600" />
          </div>
        ) : reviews.length === 0 ? (
          <Card className="border-0 p-12 text-center shadow-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No Reviews Yet</h3>
            <p className="mb-4 text-gray-600">Be the first to review this product!</p>
            <Button onClick={() => setShowReviewForm(true)} size="sm">
              Write First Review
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="p-6 transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{review.name}</h4>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            review.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : review.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {review.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="mb-3">
                      {renderStars(Number(review.rating))}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Average Rating Summary */}
        {reviews.length > 0 && (
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {(reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1)}
                  </span>
                  <div>
                    {renderStars(Math.round(reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length))}
                    <p className="text-xs text-gray-500">{reviews.length} reviews</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Rating Distribution</p>
                <div className="mt-2 space-y-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => Number(r.rating) === star).length
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-8 text-gray-600">{star} ★</span>
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full bg-yellow-400 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-gray-600">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
