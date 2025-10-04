import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { endpoints } from '../api/endpoints'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'

export default function MyOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching orders from:', endpoints.customer.orders)
      const response = await api.get(endpoints.customer.orders)
      console.log('📦 Orders API Response:', response.data)
      
      // Handle different response structures
      const ordersData = (response.data as any).data || []
      console.log('📋 Parsed orders data:', ordersData)
      
      setOrders(Array.isArray(ordersData) ? ordersData : [])
    } catch (err: any) {
      console.error('❌ Failed to fetch orders:', err)
      console.error('Error response:', err.response?.data)
      console.error('Error status:', err.response?.status)
    } finally {
      setLoading(false)
    }
  }

  const toggleOrderDetails = (orderId: number) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  const statusVariant = (status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      pending: 'warning',
      processing: 'info',
      shipped: 'info',
      delivered: 'success',
      cancelled: 'danger',
      paid: 'success',
      refunded: 'danger',
    }
    return map[status] || 'default'
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-1 text-gray-600">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
        </div>
        <Link to="/profile">
          <Button variant="outline" size="sm">Back to Profile</Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mb-4 flex justify-center">
            <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No orders yet</h3>
          <p className="mt-1 text-gray-500">When you place orders, they will appear here</p>
          <Link to="/products" className="mt-4 inline-block">
            <Button>Start Shopping</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Order #{order.order_number}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {order.name} • {order.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Placed on {new Date(order.created_at || order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-600">Rs {order.total.toLocaleString()}</div>
                  <div className="mt-1 flex gap-2">
                    <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                    {order.paymentDetails && order.paymentDetails.length > 0 && (
                      <Badge variant={statusVariant(order.paymentDetails[0].status)}>
                        {order.paymentDetails[0].status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {order.address && (
                <div className="mb-4 rounded-lg bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                  <p className="mt-1 text-sm text-gray-600">{order.address}</p>
                </div>
              )}

              {/* Order Items Toggle */}
              <button
                onClick={() => toggleOrderDetails(order.id)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                <span>
                  {expandedOrders.has(order.id) ? '▼' : '▶'} Order Items
                  {order.orderItems && ` (${order.orderItems.length})`}
                </span>
                <span className="text-xs text-gray-500">
                  {expandedOrders.has(order.id) ? 'Click to hide' : 'Click to view'}
                </span>
              </button>

              {/* Order Items List */}
              {expandedOrders.has(order.id) && order.orderItems && order.orderItems.length > 0 && (
                <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Product
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {order.orderItems.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.item_name || item.product?.name || 'Unknown Product'}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-900">
                            {item.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* No Items Message */}
              {expandedOrders.has(order.id) && (!order.orderItems || order.orderItems.length === 0) && (
                <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
                  No order items found
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

