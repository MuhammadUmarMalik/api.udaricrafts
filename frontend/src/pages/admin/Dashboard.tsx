import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { endpoints } from '../../api/endpoints'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import { Link } from 'react-router-dom'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

// Icon Components with consistent sizing
const PackageIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

const ShoppingCartIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const UsersIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const CurrencyIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const PlusIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const ClipboardIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)

const TagIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
)

const RefreshIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const StarIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

const TrendingUpIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const TrendingDownIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  const [refreshing, setRefreshing] = useState(false)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  const fetchDashboardData = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    
    api
      .get(endpoints.admin.dashboardStats)
      .then((r) => {
        const data = (r.data as any).data
        setStats(data)
        
        // Build recent activity from real data
        const activities: any[] = []
        
        // Add recent orders
        if (data.recentOrders && data.recentOrders.length > 0) {
          data.recentOrders.slice(0, 2).forEach((order: any) => {
            activities.push({
              id: `order-${order.id}`,
              type: 'order',
              message: 'New order received',
              description: `Order #${order.order_number}`,
              time: formatTimeAgo(order.created_at)
            })
          })
        }
        
        // Add low stock products
        if (data.lowStockProducts && data.lowStockProducts.length > 0) {
          const product = data.lowStockProducts[0]
          activities.push({
            id: `product-${product.id}`,
            type: 'product',
            message: 'Product stock low',
            description: `${product.name} has only ${product.quantity} items left`,
            time: 'Now'
          })
        }
        
        // Add recent reviews
        if (data.recentReviews && data.recentReviews.length > 0) {
          const review = data.recentReviews[0]
          activities.push({
            id: `review-${review.id}`,
            type: 'review',
            message: 'New review posted',
            description: `${review.rating}-star review by ${review.name}`,
            time: formatTimeAgo(review.created_at)
          })
        }
        
        setRecentActivity(activities.slice(0, 3))
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false)
        setRefreshing(false)
      })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => fetchDashboardData(), 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="text-blue-600" />
          <p className="mt-4 text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const formatChange = (change: string | number) => {
    const num = Number(change)
    return num >= 0 ? `+${num}%` : `${num}%`
  }

  const statCards = [
    { 
      label: 'Total Products', 
      value: stats?.totalProducts || 0, 
      icon: PackageIcon,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      changeColor: Number(stats?.productsChange) >= 0 ? 'text-blue-600' : 'text-red-600',
      change: formatChange(stats?.productsChange || 0),
      trending: Number(stats?.productsChange) >= 0 ? 'up' : 'down',
      link: '/admin/products',
      borderColor: 'border-blue-200'
    },
    { 
      label: 'Total Orders', 
      value: stats?.totalOrders || 0, 
      icon: ShoppingCartIcon,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      changeColor: Number(stats?.ordersChange) >= 0 ? 'text-emerald-600' : 'text-red-600',
      change: formatChange(stats?.ordersChange || 0),
      trending: Number(stats?.ordersChange) >= 0 ? 'up' : 'down',
      link: '/admin/orders',
      borderColor: 'border-emerald-200'
    },
    { 
      label: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: UsersIcon,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      changeColor: Number(stats?.usersChange) >= 0 ? 'text-purple-600' : 'text-red-600',
      change: formatChange(stats?.usersChange || 0),
      trending: Number(stats?.usersChange) >= 0 ? 'up' : 'down',
      link: '/admin/users',
      borderColor: 'border-purple-200'
    },
    { 
      label: 'Total Revenue', 
      value: `Rs ${(stats?.totalRevenue || 0).toLocaleString()}`, 
      icon: CurrencyIcon,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      changeColor: Number(stats?.revenueChange) >= 0 ? 'text-amber-600' : 'text-red-600',
      change: formatChange(stats?.revenueChange || 0),
      trending: Number(stats?.revenueChange) >= 0 ? 'up' : 'down',
      link: '/admin/orders',
      borderColor: 'border-amber-200'
    },
  ]

  const quickActions = [
    {
      title: 'Add Product',
      description: 'Create a new product',
      icon: PlusIcon,
      link: '/admin/products',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Manage Orders',
      description: 'View order status',
      icon: ClipboardIcon,
      link: '/admin/orders',
      color: 'emerald',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Categories',
      description: 'Edit categories',
      icon: TagIcon,
      link: '/admin/categories',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    }
  ]

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-lg">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-blue-600/10 to-transparent"></div>
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-purple-500/5 blur-3xl"></div>
        
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
              </span>
              System Active
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Welcome to Admin Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
              Monitor your business and manage operations efficiently
            </p>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            <RefreshIcon className={`h-4 w-4 transition-transform ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const IconComponent = stat.icon
          return (
            <Link key={stat.label} to={stat.link} className="group">
              <Card className="relative overflow-hidden border-0 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 transition-colors duration-300 group-hover:text-gray-700">{stat.label}</p>
                      <p className="mt-2 truncate text-2xl font-bold text-gray-900 sm:text-3xl">{stat.value}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        {stat.trending === 'up' ? (
                          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${stat.changeColor}`}>
                            <TrendingUpIcon />
                            {stat.change}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-red-600">
                            <TrendingDownIcon />
                            {stat.change}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">vs last month</span>
                      </div>
                    </div>
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${stat.bgColor} ${stat.iconColor} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg`}>
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
          <Card className="border-0 shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
              <p className="mt-0.5 text-sm text-gray-500">Common tasks and shortcuts</p>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              {quickActions.map((action) => {
                const IconComponent = action.icon
                return (
                  <Link
                    key={action.title}
                    to={action.link}
                    className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 text-center transition-all duration-300 hover:border-transparent hover:shadow-xl hover:scale-105"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 transition-all duration-300 group-hover:opacity-100`}></div>
                    <div className="relative z-10">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-all duration-300 group-hover:bg-white/20 group-hover:text-white group-hover:shadow-lg">
                        <IconComponent />
                      </div>
                      <p className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-white">{action.title}</p>
                      <p className="mt-1 text-xs text-gray-500 transition-colors duration-300 group-hover:text-white/90">{action.description}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="border-0 shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                  <p className="mt-0.5 text-sm text-gray-500">Latest updates</p>
                </div>
                {recentActivity.length > 0 && (
                  <Badge variant="default" className="bg-blue-100 text-blue-700">
                    {recentActivity.length}
                  </Badge>
                )}
              </div>
            </div>
            <div className="divide-y divide-gray-100 p-5">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => {
                  const iconBg = activity.type === 'order' ? 'bg-blue-100 text-blue-600' : 
                                activity.type === 'product' ? 'bg-amber-100 text-amber-600' : 
                                'bg-purple-100 text-purple-600'
                  const icon = activity.type === 'order' ? <ShoppingCartIcon className="h-4 w-4" /> : 
                              activity.type === 'product' ? <PackageIcon className="h-4 w-4" /> : 
                              <StarIcon className="h-4 w-4" />
                  
                  return (
                    <div key={activity.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{activity.message}</p>
                        <p className="mt-0.5 truncate text-xs text-gray-600">{activity.description}</p>
                        <p className="mt-1 text-xs text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <ClipboardIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
            {recentActivity.length > 0 && (
              <div className="border-t border-gray-100 p-3">
                <Link
                  to="/admin/orders"
                  className="group flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-gray-600 transition-all hover:bg-blue-50 hover:text-blue-600"
                >
                  View all activity
                  <ArrowRightIcon />
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Recent Orders & Order Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card className="border-0 shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                <p className="mt-0.5 text-sm text-gray-500">Latest customer orders</p>
              </div>
              <Link
                to="/admin/orders"
                className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="p-5">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {stats.recentOrders.map((order: any) => (
                  <Link
                    key={order.id}
                    to="/admin/orders"
                    className="group flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                        <ShoppingCartIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Order #{order.order_number}</p>
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-all group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                      <ArrowRightIcon />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <ShoppingCartIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">No orders yet</p>
                <p className="mt-1 text-xs text-gray-500">Orders will appear here once customers place them</p>
              </div>
            )}
          </div>
        </Card>

        {/* Order Status Chart */}
        <Card className="border-0 shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h3 className="text-lg font-bold text-gray-900">Order Status</h3>
            <p className="mt-0.5 text-sm text-gray-500">Distribution by status</p>
          </div>
          <div className="p-5">
            {stats?.orderStatusChart && stats.orderStatusChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.orderStatusChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }: any) => `${status}\n${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                  >
                    {stats.orderStatusChart.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      padding: '8px 12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center">
                <p className="text-sm text-gray-400">No order data available</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
        <Card className="border-0 border-l-4 border-l-amber-500 shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">Low Stock Alert</h3>
                  <Badge variant="warning" className="bg-amber-100 text-amber-700">
                    {stats.lowStockProducts.length}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">Products running out of stock</p>
              </div>
              <Link
                to="/admin/products"
                className="text-sm font-medium text-amber-600 transition-colors hover:text-amber-700"
              >
                Manage stock →
              </Link>
            </div>
          </div>
          <div className="p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {stats.lowStockProducts.map((product: any) => (
                <Link
                  key={product.id}
                  to="/admin/products"
                  className="group flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/30 p-3.5 transition-all hover:border-amber-300 hover:bg-amber-50 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 transition-all group-hover:bg-amber-500 group-hover:text-white group-hover:scale-110">
                    <PackageIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-amber-900">{product.name}</p>
                    <p className="text-xs font-medium text-amber-600 group-hover:text-amber-700">
                      Only {product.quantity} left
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
