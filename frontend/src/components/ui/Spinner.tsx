import React from 'react'

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={`inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent ${sizes[size]} ${className}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  )
}

