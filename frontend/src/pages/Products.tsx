import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { endpoints } from '../api/endpoints'
import { Link } from 'react-router-dom'
import { toImageUrl, getPlaceholderImage } from '../utils/image'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'

type Product = {
  id: number
  name: string
  price: number
  images?: string[]
  discount?: number
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get(endpoints.productsPaginated)
      .then((r) => {
        const payload = (r.data as any).data
        const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
        setProducts(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">All Products</h2>
        <p className="text-sm text-gray-500">{products.length} products</p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 py-20 text-center">
          <div className="mb-3 text-5xl">📦</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No products found</h3>
          <p className="text-gray-500">Check back later for new items</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`}>
              <Card className="group overflow-hidden transition-all hover:shadow-lg">
                <div className="relative overflow-hidden bg-gray-100">
            <img
              src={p.images && p.images[0] ? toImageUrl(p.images[0]) : getPlaceholderImage(400, 400, p.name)}
              alt={p.name}
              className="h-56 w-full object-cover transition-transform group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = getPlaceholderImage(400, 400, p.name)
              }}
            />
                  {p.discount && p.discount > 0 && (
                    <div className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                      -{p.discount}%
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-600">
                      Rs {p.price}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
