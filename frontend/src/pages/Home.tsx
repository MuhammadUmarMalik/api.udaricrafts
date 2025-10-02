import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { endpoints } from '../api/endpoints'
import { toImageUrl, getPlaceholderImage } from '../utils/image'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'

type Banner = { id: number; image: string }
type Category = { id: number; name: string }

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(endpoints.banners).then((r) => setBanners((r.data as any).data || [])).catch(() => setBanners([])),
      api.get(endpoints.categories).then((r) => setCategories((r.data as any).data || [])).catch(() => setCategories([])),
    ])
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
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-20 text-center text-white shadow-2xl md:px-12">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
            Welcome to <span className="text-yellow-300">Udari Crafts</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg opacity-95 md:text-xl">
            Discover unique handcrafted products made with love, care, and traditional craftsmanship
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/products">
              <Button size="lg" className="!bg-white !text-blue-600 hover:!bg-gray-100 shadow-lg">
                Shop Now
              </Button>
            </Link>
            <a href="#categories">
              <Button size="lg" variant="outline" className="!border-white !text-white hover:!bg-white hover:!text-blue-600">
                Browse Categories
              </Button>
            </a>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-yellow-400 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-pink-400 opacity-20 blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 text-center transition-all hover:shadow-lg">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Best Prices</h3>
          <p className="text-sm text-gray-600">Competitive pricing on all handcrafted items</p>
        </Card>
        <Card className="p-6 text-center transition-all hover:shadow-lg">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Quality Guaranteed</h3>
          <p className="text-sm text-gray-600">Each product is crafted with attention to detail</p>
        </Card>
        <Card className="p-6 text-center transition-all hover:shadow-lg">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
            <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Fast Delivery</h3>
          <p className="text-sm text-gray-600">Quick and secure shipping to your doorstep</p>
        </Card>
      </section>

      {/* Banners */}
      {banners.length > 0 && (
        <section>
          <h2 className="mb-6 text-3xl font-bold text-gray-900">Featured Collections</h2>
          <div className="custom-scrollbar flex gap-4 overflow-x-auto pb-4">
            {banners.map((b) => (
              <div key={b.id} className="flex-shrink-0 overflow-hidden rounded-xl shadow-lg transition-transform hover:scale-105">
                <img
                  src={toImageUrl(b.image)}
                  alt="featured collection"
                  className="h-56 w-96 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = getPlaceholderImage(600, 300, 'Featured')
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section id="categories">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">Shop by Category</h2>
          <p className="text-gray-600">Explore our diverse range of handcrafted products</p>
        </div>
        {categories.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mb-4 flex justify-center">
              <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500">No categories available yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((c) => (
              <Link key={c.id} to="/products">
                <Card className="p-6 text-center transition-all hover:scale-105 hover:shadow-lg">
                  <div className="mb-3 flex justify-center">
                    <svg className="h-10 w-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">{c.name}</h3>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-16 text-center text-white shadow-xl">
        <h2 className="mb-3 text-3xl font-bold">
          Ready to Start Shopping?
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-gray-300">
          Browse our complete collection of handcrafted products and find something special today
        </p>
        <Link to="/products">
          <Button size="lg" className="!bg-white !text-gray-900 hover:!bg-gray-100 shadow-lg">
            View All Products →
          </Button>
        </Link>
      </section>

      {/* Trust Badges */}
      <section className="border-t pt-12">
        <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          <div>
            <div className="mb-2 text-3xl font-bold text-blue-600">100%</div>
            <p className="text-sm text-gray-600">Handcrafted</p>
          </div>
          <div>
            <div className="mb-2 text-3xl font-bold text-green-600">500+</div>
            <p className="text-sm text-gray-600">Happy Customers</p>
          </div>
          <div>
            <div className="mb-2 text-3xl font-bold text-purple-600">24/7</div>
            <p className="text-sm text-gray-600">Support</p>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-center gap-2 text-3xl font-bold text-pink-600">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              4.9
            </div>
            <p className="text-sm text-gray-600">Average Rating</p>
          </div>
        </div>
      </section>
    </div>
  )
}
