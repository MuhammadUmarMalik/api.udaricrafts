import React, { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { endpoints } from '../../api/endpoints'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    setLoading(true)
    api
      .get(endpoints.admin.reviews)
      .then((r) => setReviews((r.data as any).data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetch()
  }, [])

  const remove = async (id: number) => {
    if (!confirm('Delete this review?')) return
    await api.delete(endpoints.admin.review(id))
    fetch()
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
        <p className="text-gray-600">{reviews.length} total reviews</p>
      </div>

      {reviews.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mb-3 text-5xl">💬</div>
          <h3 className="text-lg font-semibold text-gray-900">No reviews yet</h3>
          <p className="text-gray-500">Customer reviews will appear here</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <Card key={r.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-gray-700">{r.comment || r.review || r.text || 'No comment'}</p>
                  {r.rating && (
                    <div className="mt-2 flex items-center gap-1">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-sm text-gray-500">({r.rating}/5)</span>
                    </div>
                  )}
                  {r.created_at && (
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button onClick={() => remove(r.id)} variant="danger" size="sm">
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
