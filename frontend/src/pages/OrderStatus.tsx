import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { endpoints } from '../api/endpoints'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'

export default function OrderStatus() {
  const { number } = useParams<{ number: string }>()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!number) return
    api
      .get(endpoints.orderByNumber(number))
      .then((r) => setOrder((r.data as any).order))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [number])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="p-12 text-center">
          <div className="mb-4 flex justify-center">
            <svg className="h-20 w-20 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Order not found</h2>
          <p className="mb-6 text-gray-600">Please check your order number</p>
          <Link to="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const statusVariant = {
    pending: 'warning' as const,
    processing: 'info' as const,
    shipped: 'info' as const,
    delivered: 'success' as const,
    cancelled: 'danger' as const,
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <svg className="h-20 w-20 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Order Placed Successfully!</h2>
        <p className="mt-2 text-gray-600">Thank you for your order</p>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
            <p className="text-sm text-gray-500">Order #{order.order_number}</p>
          </div>
          <Badge variant={statusVariant[order.status as keyof typeof statusVariant] || 'default'}>
            {order.status}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Customer Name</p>
              <p className="font-medium text-gray-900">{order.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{order.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{order.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-lg font-bold text-blue-600">Rs {order.total}</p>
            </div>
          </div>

          {order.address && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">Delivery Address</p>
              <p className="font-medium text-gray-900">{order.address}</p>
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-center gap-4">
        <Link to="/products">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}
