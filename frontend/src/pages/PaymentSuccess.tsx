import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderNumber = searchParams.get('order')

  useEffect(() => {
    // Redirect to order status page after a brief moment
    if (orderNumber) {
      const timer = setTimeout(() => {
        navigate(`/order/${orderNumber}`)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [orderNumber, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100">
            <svg
              className="h-12 w-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your order has been placed successfully.
          </p>
          {orderNumber && (
            <p className="mt-2 text-sm text-gray-500">
              Order Number: <span className="font-semibold">{orderNumber}</span>
            </p>
          )}
          <p className="mt-4 text-sm text-gray-500">
            You will be redirected to your order details shortly...
          </p>
        </div>
        <div className="mt-8 space-y-4">
          {orderNumber && (
            <button
              onClick={() => navigate(`/order/${orderNumber}`)}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Order Details
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}

