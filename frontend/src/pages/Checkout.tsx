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
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    address: '',
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Helper functions for card formatting
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const limited = cleaned.slice(0, 16)
    const formatted = limited.match(/.{1,4}/g)?.join(' ') || limited
    return formatted
  }

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + (cleaned.length > 2 ? '/' + cleaned.slice(2, 4) : '')
    }
    return cleaned
  }

  const formatCVV = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 4)
  }

  const getCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, '')
    if (/^4/.test(cleaned)) return 'visa'
    if (/^5[1-5]/.test(cleaned)) return 'mastercard'
    if (/^3[47]/.test(cleaned)) return 'amex'
    return 'card'
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    // Shipping info validation
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format'
    if (!form.phone.trim()) newErrors.phone = 'Phone is required'
    if (!form.address.trim()) newErrors.address = 'Address is required'
    
    // Card validation
    if (!form.cardHolder.trim()) newErrors.cardHolder = 'Cardholder name is required'
    if (!form.cardNumber.trim()) newErrors.cardNumber = 'Card number is required'
    else {
      const cleaned = form.cardNumber.replace(/\s/g, '')
      if (cleaned.length < 13 || cleaned.length > 19) {
        newErrors.cardNumber = 'Invalid card number'
      }
    }
    if (!form.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required'
    else if (!/^\d{2}\/\d{2}$/.test(form.expiryDate)) {
      newErrors.expiryDate = 'Invalid format (MM/YY)'
    } else {
      const [month, year] = form.expiryDate.split('/').map(Number)
      const now = new Date()
      const currentYear = now.getFullYear() % 100
      const currentMonth = now.getMonth() + 1
      
      if (month < 1 || month > 12) {
        newErrors.expiryDate = 'Invalid month'
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiryDate = 'Card has expired'
      }
    }
    if (!form.cvv.trim()) newErrors.cvv = 'CVV is required'
    else if (form.cvv.length < 3 || form.cvv.length > 4) {
      newErrors.cvv = 'Invalid CVV'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      // Step 1: Create the order
      console.log('📦 Creating order...')
      const products = items.map((i) => ({ productId: i.productId, name: i.name, buyingQuantity: i.quantity }))
      const res = await api.post(endpoints.orders, { ...form, products })
      const order = (res.data as any).data.order
      
      console.log('✅ Order created:', order.id, order.order_number)

      // Step 2: Create Stripe checkout session
      console.log('💳 Creating Stripe checkout session...')
      const stripeRes = await api.post(endpoints.createCheckoutSession(order.id))
      const { url } = (stripeRes.data as any)
      
      console.log('🔗 Stripe checkout URL:', url)
      
      // Clear cart before redirecting to Stripe
      clear()
      
      // Step 3: Redirect to Stripe's hosted checkout page
      if (url) {
        console.log('🚀 Redirecting to Stripe...')
        window.location.href = url
      } else {
        throw new Error('Failed to get Stripe checkout URL')
      }
    } catch (e: any) {
      console.error('❌ Checkout error:', e)
      setErrors({ submit: e.response?.data?.message || 'Failed to process payment. Please try again.' })
      setLoading(false)
    }
    // Note: Don't set loading to false here because we're redirecting to Stripe
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

          {/* Payment Information */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure Payment
              </div>
            </div>

            <div className="grid gap-4">
              {/* Card Number */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={form.cardNumber}
                    onChange={(e) => setForm({ ...form, cardNumber: formatCardNumber(e.target.value) })}
                    className={`w-full rounded-lg border ${
                      errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                    } px-4 py-2 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    maxLength={19}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {getCardType(form.cardNumber) === 'visa' && (
                      <svg className="h-8 w-12" viewBox="0 0 48 32" fill="none">
                        <rect width="48" height="32" rx="4" fill="#1A1F71"/>
                        <text x="24" y="20" fontFamily="Arial" fontSize="12" fontWeight="bold" fill="white" textAnchor="middle">VISA</text>
                      </svg>
                    )}
                    {getCardType(form.cardNumber) === 'mastercard' && (
                      <svg className="h-8 w-12" viewBox="0 0 48 32">
                        <rect width="48" height="32" rx="4" fill="#EB001B"/>
                        <circle cx="20" cy="16" r="8" fill="#FF5F00" opacity="0.8"/>
                        <circle cx="28" cy="16" r="8" fill="#F79E1B" opacity="0.8"/>
                      </svg>
                    )}
                    {getCardType(form.cardNumber) === 'card' && form.cardNumber && (
                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    )}
                  </div>
                </div>
                {errors.cardNumber && <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p>}
              </div>

              {/* Cardholder Name */}
              <Input
                label="Cardholder Name"
                placeholder="JOHN DOE"
                value={form.cardHolder}
                onChange={(e) => setForm({ ...form, cardHolder: e.target.value.toUpperCase() })}
                error={errors.cardHolder}
              />

              {/* Expiry Date and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: formatExpiryDate(e.target.value) })}
                    className={`w-full rounded-lg border ${
                      errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                    } px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    maxLength={5}
                  />
                  {errors.expiryDate && <p className="mt-1 text-xs text-red-600">{errors.expiryDate}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    CVV
                    <span className="ml-1 text-gray-400">
                      <svg className="inline h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    value={form.cvv}
                    onChange={(e) => setForm({ ...form, cvv: formatCVV(e.target.value) })}
                    className={`w-full rounded-lg border ${
                      errors.cvv ? 'border-red-500' : 'border-gray-300'
                    } px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    maxLength={4}
                  />
                  {errors.cvv && <p className="mt-1 text-xs text-red-600">{errors.cvv}</p>}
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-2 flex items-start gap-2 rounded-lg bg-blue-50 p-3">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div className="text-xs text-blue-800">
                  <p className="font-semibold">Your payment is secure</p>
                  <p className="mt-1 text-blue-700">We use industry-standard encryption to protect your card information.</p>
                </div>
              </div>

              {/* Accepted Cards */}
              <div className="flex items-center gap-2 border-t pt-4">
                <span className="text-xs text-gray-500">We accept:</span>
                <div className="flex gap-2">
                  <div className="flex h-6 w-10 items-center justify-center rounded border bg-white text-xs font-bold text-blue-900">VISA</div>
                  <div className="flex h-6 w-10 items-center justify-center rounded border bg-white">
                    <div className="h-4 w-4 rounded-full bg-red-600"></div>
                    <div className="ml-[-8px] h-4 w-4 rounded-full bg-orange-500"></div>
                  </div>
                  <div className="flex h-6 w-10 items-center justify-center rounded border bg-blue-700 text-xs font-bold text-white">AMEX</div>
                </div>
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
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Payment...
                </span>
              ) : (
                'Pay with Card'
              )}
            </Button>
            
            {loading && (
              <div className="mt-3 text-center text-xs text-gray-500">
                <p>Please wait, redirecting to secure payment...</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
