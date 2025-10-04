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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!number) {
      setLoading(false)
      return
    }
    
    const fetchOrder = async () => {
      try {
        console.log('🔍 Fetching order:', number)
        const response = await api.get(endpoints.orderByNumber(number))
        console.log('✅ Order fetched:', response.data)
        
        // Handle different response structures
        const orderData = (response.data as any).order || (response.data as any).data?.order
        
        if (orderData) {
          setOrder(orderData)
          setError(null)
        } else {
          console.warn('⚠️ No order data in response')
          setError('Invalid response format')
        }
        setLoading(false)
      } catch (err: any) {
        console.error('❌ Failed to fetch order:', err)
        const errorMsg = err.response?.data?.message || err.message || 'Failed to load order'
        
        // Retry once after 500ms if initial fetch fails
        setTimeout(async () => {
          try {
            console.log('🔄 Retrying order fetch:', number)
            const response = await api.get(endpoints.orderByNumber(number))
            console.log('✅ Retry successful:', response.data)
            
            const orderData = (response.data as any).order || (response.data as any).data?.order
            
            if (orderData) {
              setOrder(orderData)
              setError(null)
            } else {
              setError('Order not found')
            }
            setLoading(false)
          } catch (retryError: any) {
            console.error('❌ Retry failed:', retryError)
            setError(retryError.response?.data?.message || errorMsg)
            setLoading(false)
          }
        }, 500)
      }
    }
    
    fetchOrder()
  }, [number])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <Spinner size="lg" className="text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Loading your order details...</h3>
          <p className="mt-2 text-sm text-gray-600">Please wait a moment</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 py-12 px-4">
        <div className="mx-auto max-w-2xl w-full">
          <Card className="p-12 text-center">
            <div className="mb-4 flex justify-center">
              <svg className="h-20 w-20 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Order not found</h2>
            <p className="mb-6 text-gray-600">
              {error || 'Please check your order number'}
            </p>
            {number && (
              <p className="mb-4 text-sm text-gray-500 font-mono bg-gray-100 py-2 px-4 rounded">
                Order: {number}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <Link to="/products">
                <Button>Continue Shopping</Button>
              </Link>
              {number && (
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              )}
            </div>
          </Card>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Order Placed Successfully! 🎉</h2>
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
    </div>
  )
}
