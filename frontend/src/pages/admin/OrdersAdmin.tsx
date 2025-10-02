import React, { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { endpoints } from '../../api/endpoints'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set())

  const toggleOrderDetails = (orderId: number) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  const fetch = () => {
    setLoading(true)
    api
      .post(endpoints.admin.ordersPagination, { page: 1, limit: 50 })
      .then((r) => {
        const payload = (r.data as any).data
        const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
        setOrders(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetch()
  }, [])

  const updateStatus = async (id: number, status: string) => {
    await api.put(endpoints.admin.updateOrderStatus(id), { status })
    fetch()
  }

  const updatePayment = async (id: number, status: string) => {
    await api.put(endpoints.admin.updatePaymentStatus(id, status), { status })
    fetch()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    )
  }

  const statusVariant = (status: string) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        <p className="text-gray-600">{orders.length} total orders</p>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mb-4 flex justify-center">
            <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No orders yet</h3>
          <p className="text-gray-500">Orders will appear here</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Card key={o.id} className="p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Order #{o.id} - {o.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {o.email} • {o.phone}
                  </p>
                  {o.order_number && (
                    <p className="mt-1 text-xs text-gray-400">Order Number: {o.order_number}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-600">Rs {o.total}</div>
                  <div className="mt-1 flex gap-2">
                    <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                    {o.payment_status && (
                      <Badge variant={statusVariant(o.payment_status)}>{o.payment_status}</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Order Status
                  </label>
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Payment Status
                  </label>
                  <select
                    value={o.payment_status || 'pending'}
                    onChange={(e) => updatePayment(o.id, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {o.address && (
                <div className="mt-4 rounded-lg bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                  <p className="mt-1 text-sm text-gray-600">{o.address}</p>
                </div>
              )}

              {/* Order Items Toggle Button */}
              <button
                onClick={() => toggleOrderDetails(o.id)}
                className="mt-4 flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                <span>
                  {expandedOrders.has(o.id) ? '▼' : '▶'} Order Items
                  {o.orderItems && ` (${o.orderItems.length})`}
                </span>
                <span className="text-xs text-gray-500">
                  {expandedOrders.has(o.id) ? 'Click to hide' : 'Click to view'}
                </span>
              </button>

              {/* Order Items List (Expanded) */}
              {expandedOrders.has(o.id) && o.orderItems && o.orderItems.length > 0 && (
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
                      {o.orderItems.map((item: any, idx: number) => (
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

              {/* No Order Items Message */}
              {expandedOrders.has(o.id) && (!o.orderItems || o.orderItems.length === 0) && (
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
