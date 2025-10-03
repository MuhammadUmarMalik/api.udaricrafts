import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { endpoints } from '../api/endpoints'
import { Link } from 'react-router-dom'
import { toImageUrl, getPlaceholderImage } from '../utils/image'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'

type ProductImage = {
  id: number
  path: string
  productId: number
}

type Product = {
  id: number
  name: string
  price: number
  images?: ProductImage[] | string[]  // Support both formats for compatibility
  discount?: number
  category?: number
}

type Review = {
  id: number
  productId: number
  rating: string
  description: string
  name: string
  email: string
  status: string
}

type Category = {
  id: number
  name: string
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get(endpoints.productsPaginated),
      api.get(endpoints.categories),
      api.get(endpoints.reviews),
    ])
      .then(([productsRes, categoriesRes, reviewsRes]) => {
        const payload = (productsRes.data as any).data
        const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
        console.log('[Products] API Response:', items)
        console.log('[Products] Sample product images:', items[0]?.images)
        setAllProducts(items)
        setProducts(items)
        setCategories((categoriesRes.data as any).data || [])
        setReviews((reviewsRes.data as any).data || [])
      })
      .catch((err) => {
        console.error('[Products] Failed to load data:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const filterByCategory = (categoryId: number | null) => {
    setSelectedCategory(categoryId)
    setSearchQuery('') // Clear search when filtering
    if (categoryId === null) {
      setProducts(allProducts)
    } else {
      setProducts(allProducts.filter(p => p.category === categoryId))
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      // If search is empty, show all products or filtered by category
      if (selectedCategory !== null) {
        setProducts(allProducts.filter(p => p.category === selectedCategory))
      } else {
        setProducts(allProducts)
      }
      return
    }

    try {
      setSearching(true)
      const response = await api.get(`${endpoints.productsSearch}?q=${encodeURIComponent(query)}`)
      const searchResults = (response.data as any).data || []
      
      // If category is selected, filter search results by category
      if (selectedCategory !== null) {
        setProducts(searchResults.filter((p: Product) => p.category === selectedCategory))
      } else {
        setProducts(searchResults)
      }
    } catch (err) {
      console.error('Search failed:', err)
      setProducts([])
    } finally {
      setSearching(false)
    }
  }

  const getProductReviews = (productId: number) => {
    // Show ALL reviews (not just approved)
    return reviews.filter(r => r.productId === productId)
  }

  const getAverageRating = (productId: number) => {
    const productReviews = getProductReviews(productId)
    if (productReviews.length === 0) return 0
    const sum = productReviews.reduce((acc, r) => acc + Number(r.rating), 0)
    return (sum / productReviews.length).toFixed(1)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="text-blue-600" />
          <p className="mt-4 text-sm text-gray-500">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">All Products</h2>
        <p className="text-sm text-gray-500">
          {products.length} products found
          {searching && ' (searching...)'}
        </p>
      </div>

      {/* Search and Filter Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Category Filter Dropdown */}
        <div className="flex items-center gap-3">
          <label htmlFor="category-filter" className="text-sm font-semibold text-gray-700">
            Category:
          </label>
          <div className="relative">
            <select
              id="category-filter"
              value={selectedCategory ?? ''}
              onChange={(e) => filterByCategory(e.target.value ? Number(e.target.value) : null)}
              className="appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-gray-900 shadow-sm transition-all hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Categories ({allProducts.length})</option>
              {categories.map((cat) => {
                const count = allProducts.filter(p => p.category === cat.id).length
                return (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({count})
                  </option>
                )
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <Card className="border-0 shadow-md">
          <div className="rounded-lg py-20 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No products found</h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => {
            // Handle both old format (string[]) and new format (object[])
            const firstImage = p.images && p.images.length > 0 
              ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].path)
              : null
            const imageUrl = firstImage 
              ? toImageUrl(firstImage) 
              : getPlaceholderImage(400, 400, p.name)
            const productReviews = getProductReviews(p.id)
            const avgRating = getAverageRating(p.id)
            
            return (
              <Link key={p.id} to={`/products/${p.id}`} className="group">
                <Card className="flex h-full flex-col overflow-hidden border-0 shadow-md transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl">
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src={imageUrl}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.currentTarget
                        target.src = getPlaceholderImage(400, 400, p.name)
                        target.onerror = null
                      }}
                      loading="lazy"
                    />
                    {p.discount && p.discount > 0 && (
                      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg transition-transform group-hover:scale-110">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        -{p.discount}% OFF
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-3 line-clamp-2 text-lg font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-600">
                      {p.name}
                    </h3>

                    {/* Reviews Section */}
                    {productReviews.length > 0 ? (
                      <div className="mb-3 space-y-2">
                        {/* Average Rating */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                                  star <= Number(avgRating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-gray-200 text-gray-200'
                                }`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm font-bold text-gray-900">{avgRating}</span>
                          <span className="text-xs text-gray-500">({productReviews.length} reviews)</span>
                        </div>

                        {/* Latest Review Preview */}
                        <div className="rounded-lg bg-gray-50 p-2.5 transition-colors group-hover:bg-blue-50">
                          <div className="mb-1 flex items-center gap-1.5">
                            <p className="text-xs font-semibold text-gray-900">
                              {productReviews[0].name}
                            </p>
                            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                              productReviews[0].status === 'approved' 
                                ? 'bg-green-100 text-green-700' 
                                : productReviews[0].status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {productReviews[0].status.toUpperCase()}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-xs leading-relaxed text-gray-600">
                            "{productReviews[0].description}"
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-2 text-center">
                        <p className="text-xs text-gray-400">No reviews yet</p>
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                      <span className="text-2xl font-bold text-blue-600">
                        Rs {p.price?.toLocaleString() || p.price}
                      </span>
                      <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <span>View</span>
                        <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
