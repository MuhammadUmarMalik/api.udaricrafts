import React, { useState } from 'react'
import { useCartStore } from '../store/cart'
import { api } from '../api/client'
import { endpoints } from '../api/endpoints'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'

export default function Checkout() {
  const { items, clear, total } = useCartStore()
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    if (!form.phone.trim()) newErrors.phone = 'Phone is required'
    if (!form.address.trim()) newErrors.address = 'Address is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const products = items.map((i) => ({ productId: i.productId, name: i.name, buyingQuantity: i.quantity }))
      const res = await api.post(endpoints.orders, { ...form, products })
      const order = (res.data as any).data
      clear()
      navigate(`/order/${order.order_number}`)
    } catch (e) {
      setErrors({ submit: 'Failed to place order. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Checkout</h2>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Shipping Information</h3>
            <div className="grid gap-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors.name}
              />
              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
              />
              <Input
                label="Phone Number"
                placeholder="+92 300 1234567"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                error={errors.phone}
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Delivery Address
                </label>
                <textarea
                  placeholder="Enter your complete address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={3}
                  className={`w-full rounded-lg border ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  } px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
              </div>
            </div>
          </Card>

          {errors.submit && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {errors.submit}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20 p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h3>
            
            <div className="mb-4 space-y-2 border-b pb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium">Rs {item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-b pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">Rs {total()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-blue-600">Rs {total()}</span>
            </div>

            <Button
              onClick={submit}
              className="mt-6 w-full"
              size="lg"
              disabled={loading || items.length === 0}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
