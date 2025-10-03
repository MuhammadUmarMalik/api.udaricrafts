import React, { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { endpoints } from '../../api/endpoints'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

type Review = {
  id: number
  productId: number
  rating: string
  description: string
  name: string
  email: string
  status: string
  createdAt: string
  product?: {
    id: number
    name: string
  }
}

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const fetchReviews = () => {
    setLoading(true)
    Promise.all([
      api.get(endpoints.admin.reviews),
      api.get(endpoints.admin.products)
    ])
      .then(([reviewsRes, productsRes]) => {
        const reviewsData = (reviewsRes.data as any).data || []
        const productsData = (productsRes.data as any).data || []
        
        // Map products to reviews
        const reviewsWithProducts = reviewsData.map((review: Review) => ({
          ...review,
          product: productsData.find((p: any) => p.id === review.productId)
        }))
        
        setReviews(reviewsWithProducts)
        setProducts(productsData)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(endpoints.admin.review(id), { status })
      fetchReviews()
    } catch (error) {
      console.error('Failed to update review status:', error)
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this review permanently?')) return
    try {
      await api.delete(endpoints.admin.review(id))
      fetchReviews()
    } catch (error) {
      console.error('Failed to delete review:', error)
    }
  }

  const renderStars = (rating: string) => {
    const numRating = Number(rating)
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-5 w-5 ${star <= numRating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm font-medium text-gray-700">({rating}/5)</span>
      </div>
    )
  }

  const filteredReviews = filterStatus === 'all' 
    ? reviews 
    : reviews.filter(r => r.status === filterStatus)

  const statusCounts = {
    all: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
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
          <h2 className="text-2xl font-bold text-gray-900">Reviews Management</h2>
          <p className="text-gray-600">{reviews.length} total reviews</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {[
          { key: 'all', label: 'All Reviews', variant: 'default' as const },
          { key: 'pending', label: 'Pending', variant: 'warning' as const },
          { key: 'approved', label: 'Approved', variant: 'success' as const },
          { key: 'rejected', label: 'Rejected', variant: 'danger' as const },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setFilterStatus(filter.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              filterStatus === filter.key
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {filter.label}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                filterStatus === filter.key
                  ? 'bg-white text-blue-600'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {statusCounts[filter.key as keyof typeof statusCounts]}
            </span>
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {filterStatus === 'all' ? 'No reviews yet' : `No ${filterStatus} reviews`}
          </h3>
          <p className="text-gray-500">
            {filterStatus === 'all' 
              ? 'Customer reviews will appear here' 
              : `No reviews with ${filterStatus} status`}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <div className="flex items-start gap-4 p-6">
                {/* Avatar */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white">
                  {review.name.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  {/* Customer Info & Product */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.name}</h4>
                      <p className="text-sm text-gray-500">{review.email}</p>
                      {review.product && (
                        <p className="mt-1 text-sm text-gray-600">
                          Product: <span className="font-medium text-blue-600">{review.product.name}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          review.status === 'approved' 
                            ? 'success' 
                            : review.status === 'rejected' 
                            ? 'danger' 
                            : 'warning'
                        }
                      >
                        {review.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Rating */}
                  {renderStars(review.rating)}

                  {/* Review Text */}
                  <p className="text-gray-700 leading-relaxed">{review.description}</p>

                  {/* Date */}
                  <p className="text-xs text-gray-400">
                    Submitted on {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 border-t pt-3">
                    {review.status !== 'approved' && (
                      <Button
                        onClick={() => updateStatus(review.id, 'approved')}
                        variant="success"
                        size="sm"
                      >
                        <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve
                      </Button>
                    )}
                    {review.status !== 'rejected' && (
                      <Button
                        onClick={() => updateStatus(review.id, 'rejected')}
                        variant="warning"
                        size="sm"
                      >
                        <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </Button>
                    )}
                    {review.status !== 'pending' && (
                      <Button
                        onClick={() => updateStatus(review.id, 'pending')}
                        variant="outline"
                        size="sm"
                      >
                        <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Set Pending
                      </Button>
                    )}
                    <Button
                      onClick={() => remove(review.id)}
                      variant="danger"
                      size="sm"
                    >
                      <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
