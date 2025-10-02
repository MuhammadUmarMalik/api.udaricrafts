import React from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-lg border ${
          error ? 'border-red-500' : 'border-gray-300'
        } px-4 py-2 text-sm focus:outline-none focus:ring-2 ${
          error ? 'focus:ring-red-500' : 'focus:ring-blue-500'
        } disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

