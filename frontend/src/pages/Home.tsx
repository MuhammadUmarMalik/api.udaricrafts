import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { endpoints } from '../api/endpoints'
import { toImageUrl, getPlaceholderImage } from '../utils/image'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'

type Banner = { id: number; image: string }
type Category = { id: number; name: string }

export default function Home() {
  const navigate = useNavigate()
  const [banners, setBanners] = useState<Banner[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [orderNumber, setOrderNumber] = useState('')
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get(endpoints.banners).then((r) => setBanners((r.data as any).data || [])).catch(() => setBanners([])),
      api.get(endpoints.categories).then((r) => setCategories((r.data as any).data || [])).catch(() => setCategories([])),
    ])
      .finally(() => setLoading(false))
  }, [])

  const handleTrackOrder = () => {
    setSearchError('')
    if (!orderNumber.trim()) {
      setSearchError('Please enter an order number')
      return
    }
    // Navigate to order status page
    navigate(`/order/${orderNumber.trim()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTrackOrder()
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-4 h-20 w-20">
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-75"></div>
            <div className="relative flex h-20 w-20 items-center justify-center">
              <Spinner size="lg" className="text-blue-600" />
            </div>
          </div>
          <p className="text-lg font-medium text-gray-700">Loading amazing crafts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-20">
      {/* Hero Section - Ultra Modern */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 px-6 py-32 text-center text-white shadow-[0_20px_70px_rgba(0,0,0,0.3)] md:px-12 md:py-40">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        
        {/* Floating Decoration Circles */}
        <div className="absolute -right-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-yellow-400 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 h-96 w-96 animate-pulse rounded-full bg-pink-400 opacity-20 blur-3xl" style={{ animationDelay: '1s' }}></div>
        <div className="absolute right-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-cyan-400 opacity-10 blur-3xl" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-300 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-yellow-400"></span>
            </span>
            <span className="text-sm font-semibold">Handcrafted with Love ❤️</span>
          </div>

          <h1 className="mb-6 animate-fade-in bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-5xl font-extrabold leading-tight text-transparent md:text-7xl lg:text-8xl">
            Welcome to <br />
            <span className="inline-block bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200 bg-clip-text text-transparent">
              Udari Crafts
            </span>
          </h1>
          
          <p className="mx-auto mb-12 max-w-3xl text-lg leading-relaxed opacity-95 md:text-xl lg:text-2xl">
            Discover unique <span className="font-bold text-yellow-300">handcrafted products</span> made with love, care, and traditional craftsmanship
          </p>
          
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Link to="/products" className="group w-full sm:w-auto">
              <Button 
                size="lg" 
                className="group relative w-full overflow-hidden !bg-white !px-8 !py-4 !text-lg !font-bold !text-blue-600 shadow-2xl transition-all duration-300 hover:!bg-gray-50 hover:scale-110 hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] sm:w-auto"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Shop Now
                  <svg className="h-6 w-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
            </Link>
            
            <a href="#categories" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full !border-2 !border-white !bg-white/10 !px-8 !py-4 !text-lg !font-bold !text-white backdrop-blur-md transition-all duration-300 hover:!bg-white hover:!text-blue-600 hover:scale-110 hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] sm:w-auto"
              >
                Browse Categories
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-center md:gap-12">
            <div className="group transition-transform hover:scale-110">
              <div className="text-3xl font-bold text-yellow-300 md:text-4xl">500+</div>
              <div className="text-sm opacity-90">Products</div>
            </div>
            <div className="h-12 w-px bg-white/30"></div>
            <div className="group transition-transform hover:scale-110">
              <div className="text-3xl font-bold text-yellow-300 md:text-4xl">10K+</div>
              <div className="text-sm opacity-90">Happy Customers</div>
            </div>
            <div className="h-12 w-px bg-white/30"></div>
            <div className="group flex items-center gap-2 transition-transform hover:scale-110">
              <svg className="h-8 w-8 fill-yellow-300" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div>
                <div className="text-3xl font-bold text-yellow-300 md:text-4xl">4.9</div>
                <div className="text-sm opacity-90">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order Tracking Section */}
      <section id="track-order" className="relative scroll-mt-20">
        <Card className="overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 md:p-12">
            <div className="mx-auto max-w-3xl text-center">
              {/* Icon & Title */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <h2 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
                Track Your Order
              </h2>
              <p className="mb-8 text-lg text-gray-600">
                Enter your order number below to check the status of your order
              </p>

              {/* Search Bar */}
              <div className="mx-auto max-w-2xl">
                <div className="relative flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={orderNumber}
                      onChange={(e) => {
                        setOrderNumber(e.target.value)
                        setSearchError('')
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter order number (e.g., ORD-123456)"
                      className={`w-full rounded-xl border-2 ${
                        searchError ? 'border-red-300' : 'border-gray-300'
                      } bg-white pl-14 pr-6 py-4 text-lg text-gray-900 shadow-md transition-all placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <button
                    onClick={handleTrackOrder}
                    className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!orderNumber.trim()}
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Track Order
                    <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>

                {/* Error Message */}
                {searchError && (
                  <div className="mt-3 animate-fade-in rounded-lg bg-red-50 p-3 text-left text-sm text-red-700">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">{searchError}</span>
                    </div>
                  </div>
                )}

                {/* Help Text */}
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Find your order number in your confirmation email</span>
                </div>
              </div>

              {/* Quick Features */}
              <div className="mt-10 grid gap-6 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-6 text-center shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">Real-Time Updates</h3>
                  <p className="text-sm text-gray-600">Track your order status in real-time</p>
                </div>
                <div className="rounded-xl bg-white p-6 text-center shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">Order History</h3>
                  <p className="text-sm text-gray-600">View all your order details</p>
                </div>
                <div className="rounded-xl bg-white p-6 text-center shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">Email Updates</h3>
                  <p className="text-sm text-gray-600">Get notifications via email</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Features Section - Modern Cards */}
      <section className="relative">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">Why Choose Us</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">Experience the best in handcrafted products with unmatched quality and service</p>
        </div>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100 p-8 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-blue-200 opacity-50 blur-2xl transition-all group-hover:scale-150"></div>
            <div className="relative">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">Best Prices</h3>
              <p className="leading-relaxed text-gray-600">Competitive pricing on all handcrafted items without compromising quality</p>
            </div>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-green-100 p-8 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-green-200 opacity-50 blur-2xl transition-all group-hover:scale-150"></div>
            <div className="relative">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">Quality Guaranteed</h3>
              <p className="leading-relaxed text-gray-600">Each product is crafted with meticulous attention to detail and care</p>
            </div>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100 p-8 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl sm:col-span-2 lg:col-span-1">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-purple-200 opacity-50 blur-2xl transition-all group-hover:scale-150"></div>
            <div className="relative">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">Fast Delivery</h3>
              <p className="leading-relaxed text-gray-600">Quick and secure shipping to your doorstep with tracking</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Banners - Featured Collections */}
      {banners.length > 0 && (
        <section>
          <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="mb-2 text-4xl font-bold text-gray-900 md:text-5xl">✨ Featured Collections</h2>
              <p className="text-lg text-gray-600">Curated selections of our finest works - Click to explore</p>
            </div>
            <Link to="/products">
              <Button variant="outline" className="flex items-center gap-2">
                View All
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>
          <div className="custom-scrollbar flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory">
            {banners.map((b, idx) => (
              <Link 
                key={b.id} 
                to="/products"
                className="group relative flex-shrink-0 overflow-hidden rounded-3xl shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-fade-in snap-center"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <img
                  src={toImageUrl(b.image)}
                  alt={`Featured collection ${idx + 1}`}
                  className="h-72 w-[28rem] object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = getPlaceholderImage(600, 300, 'Featured Collection')
                  }}
                  loading="lazy"
                />
                {/* Dark overlay - always visible but stronger on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-500 group-hover:from-black/80 group-hover:via-black/40"></div>
                
                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  {/* Badge */}
                  <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-white/20 px-3 py-1 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-300"></span>
                    </span>
                    <span className="text-xs font-semibold text-white">Featured</span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="mb-2 text-2xl font-bold text-white transition-all duration-300 group-hover:scale-105">
                    Explore Collection
                  </h3>
                  
                  {/* Description */}
                  <p className="mb-4 text-sm text-white/90">
                    Discover amazing handcrafted products
                  </p>
                  
                  {/* Call to action button */}
                  <div className="flex items-center gap-2 text-white transition-all duration-300 group-hover:gap-3">
                    <span className="text-sm font-semibold">Shop Now</span>
                    <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
                
                {/* Corner accent */}
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-60"></div>
              </Link>
            ))}
          </div>
          
          {/* Scroll hint */}
          {banners.length > 2 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="h-5 w-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <span>Scroll to see more</span>
              <svg className="h-5 w-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          )}
        </section>
      )}

      {/* Categories - Shop by Category */}
      <section id="categories">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">Shop by Category</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">Explore our diverse range of handcrafted products</p>
        </div>
        
        {categories.length === 0 ? (
          <Card className="border-0 p-16 text-center shadow-lg">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-gradient-to-br from-gray-100 to-gray-200 p-8">
                <svg className="h-20 w-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">No categories available yet</h3>
            <p className="text-gray-500">Check back soon for new categories</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((c, idx) => (
              <Link key={c.id} to="/products" className="group" style={{ animationDelay: `${idx * 50}ms` }}>
                <Card className="relative overflow-hidden border-0 p-8 text-center shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                  <div className="relative">
                    <div className="mb-4 flex justify-center">
                      <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 p-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:from-blue-500 group-hover:to-purple-500 group-hover:shadow-xl">
                        <svg className="h-10 w-10 text-blue-600 transition-colors duration-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 transition-colors duration-500 group-hover:text-blue-600">{c.name}</h3>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section - Attractive Call to Action */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 py-24 text-center text-white shadow-[0_20px_70px_rgba(0,0,0,0.3)] md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-10"></div>
        <div className="absolute -right-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-blue-500 opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 h-96 w-96 animate-pulse rounded-full bg-purple-500 opacity-10 blur-3xl" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md">
            <span className="text-sm font-semibold">✨ Limited Time Offer</span>
          </div>
          <h2 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
            Ready to Start Shopping?
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-gray-300 md:text-xl">
            Browse our complete collection of handcrafted products and find something special today
          </p>
          <Link to="/products" className="group inline-block">
            <Button 
              size="lg" 
              className="group relative overflow-hidden !bg-white !px-10 !py-5 !text-xl !font-bold !text-gray-900 shadow-2xl transition-all duration-300 hover:!bg-gray-100 hover:scale-110 hover:shadow-[0_0_50px_rgba(255,255,255,0.5)]"
            >
              <span className="flex items-center gap-3">
                View All Products
                <svg className="h-6 w-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Trust Badges - Social Proof */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white via-gray-50 to-white p-12 shadow-xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-100 opacity-50 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-100 opacity-50 blur-3xl"></div>
        
        <div className="relative grid grid-cols-2 gap-12 text-center md:grid-cols-4">
          <div className="group transition-transform duration-300 hover:scale-110">
            <div className="mb-4 text-5xl font-bold text-blue-600 md:text-6xl">100%</div>
            <p className="text-base font-semibold text-gray-600 md:text-lg">Handcrafted</p>
            <p className="mt-1 text-sm text-gray-400">Authentic products</p>
          </div>
          <div className="group transition-transform duration-300 hover:scale-110">
            <div className="mb-4 text-5xl font-bold text-green-600 md:text-6xl">500+</div>
            <p className="text-base font-semibold text-gray-600 md:text-lg">Happy Customers</p>
            <p className="mt-1 text-sm text-gray-400">And growing</p>
          </div>
          <div className="group transition-transform duration-300 hover:scale-110">
            <div className="mb-4 text-5xl font-bold text-purple-600 md:text-6xl">24/7</div>
            <p className="text-base font-semibold text-gray-600 md:text-lg">Support</p>
            <p className="mt-1 text-sm text-gray-400">Always here</p>
          </div>
          <div className="group transition-transform duration-300 hover:scale-110">
            <div className="mb-4 flex items-center justify-center gap-2 text-5xl font-bold text-pink-600 md:text-6xl">
              <svg className="h-12 w-12 fill-pink-600" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              4.9
            </div>
            <p className="text-base font-semibold text-gray-600 md:text-lg">Average Rating</p>
            <p className="mt-1 text-sm text-gray-400">Excellent reviews</p>
          </div>
        </div>
      </section>
    </div>
  )
}
