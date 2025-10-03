import { useState } from 'react'
import { useCartStore } from '../store/cart'
import { api } from '../api/client'
import { endpoints } from '../api/endpoints'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'

export default function Checkout() {
  const { items, clear, total } = useCartStore()
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    address: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    // Validate shipping info only
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format'
    if (!form.phone.trim()) newErrors.phone = 'Phone is required'
    if (!form.address.trim()) newErrors.address = 'Address is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      // Step 1: Create the order with shipping info
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
      setErrors({ submit: e.response?.data?.message || 'Failed to process checkout. Please try again.' })
      setLoading(false)
    }
    // Note: Don't set loading to false here because we're redirecting to Stripe
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Checkout</h2>
        <p className="mt-2 text-gray-600">Complete your shipping information to proceed to secure payment</p>
      </div>

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
                  placeholder="Enter your complete delivery address"
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

          {/* Payment Info Card */}
          <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Secure Payment via Stripe</h3>
                <p className="mt-2 text-sm text-gray-700">
                  After confirming your shipping details, you'll be redirected to Stripe's secure payment gateway to complete your purchase.
                </p>
                <div className="mt-4 flex items-center gap-6">
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold">We accept:</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex h-8 w-12 items-center justify-center rounded border-2 border-gray-200 bg-white text-xs font-bold text-blue-900 shadow-sm">VISA</div>
                    <div className="flex h-8 w-12 items-center justify-center rounded border-2 border-gray-200 bg-white shadow-sm">
                      <div className="h-5 w-5 rounded-full bg-red-600"></div>
                      <div className="ml-[-10px] h-5 w-5 rounded-full bg-orange-500"></div>
                    </div>
                    <div className="flex h-8 w-12 items-center justify-center rounded border-2 border-gray-200 bg-blue-700 text-xs font-bold text-white shadow-sm">AMEX</div>
                  </div>
                </div>
                <div className="mt-4 rounded-lg bg-white/60 p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <svg className="h-4 w-4 flex-shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Your payment information is encrypted and processed securely by Stripe</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {errors.submit && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              <div className="flex items-start gap-2">
                <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errors.submit}</span>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20 p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h3>
            
            <div className="mb-4 max-h-60 space-y-3 overflow-y-auto border-b pb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border bg-gray-50">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full rounded-lg object-cover" />
                    ) : (
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-semibold text-gray-900">Rs {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-b pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">Rs {total().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-blue-600">Rs {total().toLocaleString()}</span>
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
                  Redirecting to Payment...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Proceed to Secure Payment
                </span>
              )}
            </Button>
            
            {loading && (
              <div className="mt-3 text-center text-xs text-gray-500">
                <p className="flex items-center justify-center gap-1">
                  <svg className="h-3 w-3 animate-pulse text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Redirecting to Stripe secure payment gateway...
                </p>
              </div>
            )}

            {items.length === 0 && (
              <p className="mt-4 text-center text-sm text-gray-500">Your cart is empty</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
