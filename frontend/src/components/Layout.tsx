import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCartStore } from '../store/cart'
import { useAuthStore } from '../store/auth'
import { HomeIcon, ShoppingBagIcon, ShoppingCartIcon, UserIcon, LoginIcon, LogoutIcon } from './Icons'

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { items } = useCartStore()
  const { isAuthenticated, isAdmin, logout, user } = useAuthStore()
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="container-page">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-lg shadow-md">
                UC
              </div>
              <span className="hidden text-xl font-bold text-gray-900 sm:inline">
                Udari Crafts
              </span>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/"
                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <HomeIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <Link
                to="/products"
                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/products') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <ShoppingBagIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Products</span>
              </Link>
              <a
                href="/#track-order"
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                title="Track Order"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className="hidden md:inline">Track</span>
              </a>
              <Link
                to="/complaint"
                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/complaint') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Complaint</span>
              </Link>
              <Link
                to="/cart"
                className={`relative flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/cart') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <ShoppingCartIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-md">
                    {cartCount}
                  </span>
                )}
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="hidden rounded-md bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-purple-700 hover:to-blue-700 sm:inline-block"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    to={isAdmin ? "/admin/profile" : "/profile"}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive('/profile') || isActive('/admin/profile') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <UserIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <LogoutIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <LoginIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="hidden rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 sm:inline-block"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container-page flex-1 py-8">{children}</main>

      <footer className="border-t bg-white">
        <div className="container-page py-12">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-sm">
                  UC
                </div>
                <span className="font-bold text-gray-900">Udari Crafts</span>
              </div>
              <p className="text-sm text-gray-600">
                Your premier destination for handcrafted products made with love and care.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Shop</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/products" className="hover:text-blue-600">All Products</Link></li>
                <li><Link to="/cart" className="hover:text-blue-600">Shopping Cart</Link></li>
                <li><Link to="/checkout" className="hover:text-blue-600">Checkout</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Account</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {isAuthenticated ? (
                  <>
                    <li><span className="text-gray-900">Hi, {user?.name}!</span></li>
                    {isAdmin ? (
                      <>
                        <li><Link to="/admin/profile" className="hover:text-blue-600">Admin Profile</Link></li>
                        <li><Link to="/admin" className="hover:text-blue-600">Admin Panel</Link></li>
                      </>
                    ) : (
                      <>
                        <li><Link to="/profile" className="hover:text-blue-600">My Profile</Link></li>
                        <li><Link to="/profile/orders" className="hover:text-blue-600">My Orders</Link></li>
                        <li><Link to="/profile/reviews" className="hover:text-blue-600">My Reviews</Link></li>
                      </>
                    )}
                    <li><button onClick={logout} className="hover:text-blue-600">Logout</button></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/login" className="hover:text-blue-600">Login</Link></li>
                    <li><Link to="/register" className="hover:text-blue-600">Register</Link></li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="mailto:info@udaricrafts.com" className="hover:text-blue-600">
                    info@udaricrafts.com
                  </a>
                </li>
                <li>
                  <a href="tel:+923001234567" className="hover:text-blue-600">
                    +92 300 1234567
                  </a>
                </li>
                <li>
                  <Link to="/complaint" className="hover:text-blue-600">
                    Submit a Complaint
                  </Link>
                </li>
                <li className="pt-2">
                  <div className="flex gap-3">
                    <a href="#" className="text-gray-400 hover:text-blue-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-blue-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-blue-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Udari Crafts. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
