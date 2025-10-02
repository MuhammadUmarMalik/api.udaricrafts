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
                      {'⭐'.repeat(r.rating)}
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
