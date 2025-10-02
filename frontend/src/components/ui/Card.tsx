import React from 'react'

type CardProps = {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${
        onClick ? 'cursor-pointer transition-shadow hover:shadow-md' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

