import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { endpoints } from '../api/endpoints'
import Spinner from '../components/ui/Spinner'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const orderId = searchParams.get('order_id')
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(2)

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !orderId) {
        setError('Missing payment information')
        setVerifying(false)
        return
      }

      try {
        console.log('🔍 Verifying payment...', { sessionId, orderId })
        
        const response = await api.get(endpoints.verifyPayment, {
          params: { session_id: sessionId, order_id: orderId }
        })

        const data = response.data as any
        
        if (data.success) {
          console.log('✅ Payment verified successfully')
          setVerified(true)
          setOrderNumber(data.order.order_number)
          
          // Start countdown
          const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdownInterval)
                return 0
              }
              return prev - 1
            })
          }, 1000)
          
          // Redirect to order status page after 2 seconds
          setTimeout(() => {
            navigate(`/order/${data.order.order_number}`, { replace: true })
          }, 2000)
        } else {
          setError(data.message || 'Payment verification failed')
        }
      } catch (err: any) {
        console.error('❌ Payment verification error:', err)
        setError(err.response?.data?.message || 'Failed to verify payment')
      } finally {
        setVerifying(false)
      }
    }

    verifyPayment()
  }, [sessionId, orderId, navigate])

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 animate-pulse">
              <Spinner size="lg" className="text-blue-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Verifying Payment...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we confirm your payment with our payment processor.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100">
              <svg
                className="h-12 w-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Verification Failed
            </h2>
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          </div>
          <div className="mt-8">
            <button
              onClick={() => navigate('/')}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 animate-bounce">
              <svg
                className="h-12 w-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Payment Successful! 🎉
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your payment has been verified and your order has been confirmed.
            </p>
            {orderNumber && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-green-200">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Order Number</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{orderNumber}</p>
              </div>
            )}
            <div className="mt-4">
              <div className="flex items-center justify-center gap-2">
                {countdown > 0 ? (
                  <>
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                      <span className="text-blue-600 font-bold text-sm">{countdown}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Redirecting to your order details...
                    </p>
                  </>
                ) : (
                  <>
                    <Spinner size="sm" className="text-blue-600" />
                    <p className="text-sm text-gray-600">
                      Loading your order...
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            {orderNumber && (
              <button
                onClick={() => navigate(`/order/${orderNumber}`)}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                View Order Details
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
