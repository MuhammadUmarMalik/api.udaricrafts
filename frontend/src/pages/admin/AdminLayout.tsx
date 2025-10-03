import React, { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import { 
  DashboardIcon, 
  PackageIcon, 
  FolderIcon, 
  ShoppingCartIcon, 
  UsersIcon, 
  StarIcon,
  PhotoIcon, 
  ClipboardIcon,
  LogoutIcon,
  GlobeIcon,
  MenuIcon,
  CloseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon
} from '../../components/Icons'

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { 
      path: '/admin', 
      label: 'Dashboard', 
      icon: <DashboardIcon className="h-5 w-5" />,
      exact: true 
    },
    { 
      path: '/admin/profile', 
      label: 'Profile', 
      icon: <UserIcon className="h-5 w-5" />
    },
    { 
      path: '/admin/products', 
      label: 'Products', 
      icon: <PackageIcon className="h-5 w-5" />
    },
    { 
      path: '/admin/categories', 
      label: 'Categories', 
      icon: <FolderIcon className="h-5 w-5" />
    },
    { 
      path: '/admin/orders', 
      label: 'Orders', 
      icon: <ShoppingCartIcon className="h-5 w-5" />
    },
    { 
      path: '/admin/reviews', 
      label: 'Reviews', 
      icon: <StarIcon className="h-5 w-5" />
    },
    { 
      path: '/admin/banners', 
      label: 'Banners', 
      icon: <PhotoIcon className="h-5 w-5" />
    },
    { 
      path: '/admin/users', 
      label: 'Users', 
      icon: <UsersIcon className="h-5 w-5" />
    },
    { 
      path: '/admin/notifications', 
      label: 'Notifications', 
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    },
    { 
      path: '/admin/complaints', 
      label: 'Complaints', 
      icon: <ClipboardIcon className="h-5 w-5" />
    },
  ]

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col border-r bg-white shadow-lg transition-all duration-300`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold shadow-md">
                  UC
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Udari Crafts</h1>
                  <p className="text-xs text-gray-500">Admin Panel</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="mx-auto rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              title="Expand sidebar"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(item.path, item.exact)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Info */}
        <div className="border-t p-4">
          {sidebarOpen ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="truncate text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400"
                >
                  <GlobeIcon className="h-4 w-4" />
                  View Site
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-red-700 hover:shadow-md"
                >
                  <LogoutIcon className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="mx-auto rounded-lg border border-gray-300 p-2 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
                title="View Site"
              >
                <GlobeIcon className="h-5 w-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="mx-auto rounded-lg bg-red-600 p-2 text-white hover:bg-red-700 hover:shadow-md transition-all"
                title="Logout"
              >
                <LogoutIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {navItems.find((item) => isActive(item.path, item.exact))?.label || 'Admin Panel'}
            </h2>
            <p className="text-sm text-gray-500">
              Welcome back, {user?.name}!
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <span className="text-xs font-medium text-gray-600">Role:</span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                {user?.role || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
