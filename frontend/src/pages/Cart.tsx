import React from 'react'
import { useCartStore } from '../store/cart'
import { Link, useNavigate } from 'react-router-dom'
import { toImageUrl } from '../utils/image'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function Cart() {
  const { items, updateQuantity, removeItem, total } = useCartStore()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="p-12 text-center">
          <div className="mb-4 text-6xl">🛒</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="mb-6 text-gray-600">Start shopping to add items to your cart</p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Shopping Cart</h2>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.productId} className="p-4">
              <div className="flex gap-4">
                <Link to={`/products/${item.productId}`}>
                  {item.image ? (
                    <img
                      src={toImageUrl(item.image)}
                      alt={item.name}
                      className="h-24 w-24 flex-shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-3xl">
                      📦
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link to={`/products/${item.productId}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="mt-1 text-sm text-gray-500">Rs {item.price}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-gray-300">
                      <button
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-right font-semibold text-gray-900">
                  Rs {item.price * item.quantity}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20 p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h3>
            
            <div className="space-y-3 border-b pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">Rs {total()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between border-b pb-4">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-blue-600">Rs {total()}</span>
            </div>

            <Button
              onClick={() => navigate('/checkout')}
              className="mt-6 w-full"
              size="lg"
            >
              Proceed to Checkout
            </Button>

            <Link to="/products" className="mt-4 block text-center text-sm text-blue-600 hover:underline">
              Continue Shopping
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
