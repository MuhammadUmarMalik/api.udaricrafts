import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { endpoints } from '../../api/endpoints'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import { Link } from 'react-router-dom'

// Icon Components
const PackageIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

const ShoppingCartIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const UsersIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const CurrencyIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const PlusIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const ClipboardIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)

const TagIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
)

const TrendingUpIcon = () => (
  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const TrendingDownIcon = () => (
  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [recentActivity] = useState([
    { id: 1, type: 'order', message: 'New order received', description: 'Order #12345 placed by John Doe', time: '5 min ago' },
    { id: 2, type: 'product', message: 'Product stock low', description: 'Wooden Sculpture has only 3 items left', time: '1 hour ago' },
    { id: 3, type: 'review', message: 'New review posted', description: '5-star review on Handmade Basket', time: '2 hours ago' },
  ])

  useEffect(() => {
    api
      .get(endpoints.admin.dashboardStats)
      .then((r) => setStats((r.data as any).data))
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

  const statCards = [
    { 
      label: 'Total Products', 
      value: stats?.totalProducts || 0, 
      icon: PackageIcon,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      changeColor: 'text-blue-600',
      change: '+12%',
      trending: 'up',
      link: '/admin/products'
    },
    { 
      label: 'Total Orders', 
      value: stats?.totalOrders || 0, 
      icon: ShoppingCartIcon,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      changeColor: 'text-emerald-600',
      change: '+8%',
      trending: 'up',
      link: '/admin/orders'
    },
    { 
      label: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: UsersIcon,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      changeColor: 'text-purple-600',
      change: '+5%',
      trending: 'up',
      link: '/admin/users'
    },
    { 
      label: 'Total Revenue', 
      value: `Rs ${stats?.totalRevenue || 0}`, 
      icon: CurrencyIcon,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      changeColor: 'text-amber-600',
      change: '+15%',
      trending: 'up',
      link: '/admin/orders'
    },
  ]

  const quickActions = [
    {
      title: 'Add New Product',
      description: 'Create and list a new product',
      icon: PlusIcon,
      link: '/admin/products',
      color: 'blue'
    },
    {
      title: 'Manage Orders',
      description: 'View and update order status',
      icon: ClipboardIcon,
      link: '/admin/orders',
      color: 'emerald'
    },
    {
      title: 'Manage Categories',
      description: 'Add or edit product categories',
      icon: TagIcon,
      link: '/admin/categories',
      color: 'purple'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-xl">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-600/20 to-transparent"></div>
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl"></div>
        
        <div className="relative">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
            </span>
            System Active
          </div>
          <h1 className="mb-3 text-4xl font-bold text-white">Welcome to Admin Dashboard</h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Here's what's happening with your store today. Monitor your business and manage operations efficiently.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const IconComponent = stat.icon
          return (
            <Link key={stat.label} to={stat.link}>
              <Card className="group relative overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                      <div className="mt-2 flex items-center gap-1">
                        {stat.trending === 'up' ? (
                          <span className={`flex items-center gap-1 text-xs font-semibold ${stat.changeColor}`}>
                            <TrendingUpIcon />
                            {stat.change}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                            <TrendingDownIcon />
                            {stat.change}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">from last month</span>
                      </div>
                    </div>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${stat.bgColor} ${stat.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                      <IconComponent />
                    </div>
                  </div>
                </div>
                <div className={`h-1 w-full ${stat.bgColor} transition-all duration-300 group-hover:h-2`}></div>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-md">
            <div className="border-b border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
              <p className="mt-1 text-sm text-gray-500">Common tasks and shortcuts</p>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-3">
              {quickActions.map((action) => {
                const IconComponent = action.icon
                const colorClasses = {
                  blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
                  emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
                  purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
                }
                return (
                  <Link
                    key={action.title}
                    to={action.link}
                    className="group flex flex-col items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-6 text-center transition-all duration-300 hover:border-gray-200 hover:bg-white hover:shadow-md"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${colorClasses[action.color as keyof typeof colorClasses]}`}>
                      <IconComponent />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-gray-900">{action.title}</p>
                      <p className="mt-1 text-xs text-gray-500">{action.description}</p>
                    </div>
                    <div className="mt-auto flex items-center gap-1 text-xs font-medium text-gray-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span>Go</span>
                      <ArrowRightIcon />
                    </div>
                  </Link>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="border-0 shadow-md">
            <div className="border-b border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
              <p className="mt-1 text-sm text-gray-500">Latest updates</p>
            </div>
            <div className="divide-y divide-gray-100 p-6">
              {recentActivity.map((activity) => {
                const iconBg = activity.type === 'order' ? 'bg-blue-100 text-blue-600' : 
                              activity.type === 'product' ? 'bg-amber-100 text-amber-600' : 
                              'bg-purple-100 text-purple-600'
                const icon = activity.type === 'order' ? <ShoppingCartIcon /> : 
                            activity.type === 'product' ? <PackageIcon /> : 
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                
                return (
                  <div key={activity.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{activity.message}</p>
                      <p className="mt-1 text-xs text-gray-600">{activity.description}</p>
                      <p className="mt-1 text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-gray-100 p-4">
              <Link
                to="/admin/orders"
                className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                View all activity
                <ArrowRightIcon />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
