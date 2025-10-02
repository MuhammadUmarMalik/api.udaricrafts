import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { endpoints } from '../../api/endpoints'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [recentActivity] = useState([
    { id: 1, type: 'order', message: 'New order received', time: '5 min ago' },
    { id: 2, type: 'product', message: 'Product stock low', time: '1 hour ago' },
    { id: 3, type: 'review', message: 'New review posted', time: '2 hours ago' },
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
      icon: '📦', 
      color: 'blue',
      change: '+12%',
      link: '/admin/products'
    },
    { 
      label: 'Total Orders', 
      value: stats?.totalOrders || 0, 
      icon: '🛒', 
      color: 'green',
      change: '+8%',
      link: '/admin/orders'
    },
    { 
      label: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: '👥', 
      color: 'purple',
      change: '+5%',
      link: '/admin/users'
    },
    { 
      label: 'Total Revenue', 
      value: `Rs ${stats?.totalRevenue || 0}`, 
      icon: '💰', 
      color: 'yellow',
      change: '+15%',
      link: '/admin/orders'
    },
  ]

  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600',
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <h1 className="mb-2 text-3xl font-bold">Welcome to Admin Dashboard</h1>
        <p className="text-blue-100">
          Here's what's happening with your store today
        </p>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.label} to={stat.link}>
            <Card className="group overflow-hidden transition-all hover:shadow-lg">
              <div className="relative p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="mt-1 text-xs text-green-600">{stat.change} from last month</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${colorClasses[stat.color]} text-2xl text-white shadow-lg`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
          <div className="grid gap-3">
            <Link
              to="/admin/products"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <span className="text-2xl">➕</span>
              <div>
                <p className="font-medium text-gray-900">Add New Product</p>
                <p className="text-sm text-gray-500">Create and list a new product</p>
              </div>
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-medium text-gray-900">Manage Orders</p>
                <p className="text-sm text-gray-500">View and update order status</p>
              </div>
            </Link>
            <Link
              to="/admin/categories"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <span className="text-2xl">🏷️</span>
              <div>
                <p className="font-medium text-gray-900">Manage Categories</p>
                <p className="text-sm text-gray-500">Add or edit product categories</p>
              </div>
            </Link>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  {activity.type === 'order' && '🛒'}
                  {activity.type === 'product' && '📦'}
                  {activity.type === 'review' && '⭐'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Additional Info */}
      {stats && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">System Statistics</h3>
          <div className="overflow-auto">
            <pre className="rounded-lg bg-gray-50 p-4 text-xs">
              {JSON.stringify(stats, null, 2)}
            </pre>
          </div>
        </Card>
      )}
    </div>
  )
}
