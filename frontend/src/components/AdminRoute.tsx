import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-6xl">🔒</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mb-6 text-gray-600">You don't have permission to access this page.</p>
          <a href="/" className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
            Go to Homepage
          </a>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}

