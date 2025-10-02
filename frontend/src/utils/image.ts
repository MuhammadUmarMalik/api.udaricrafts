const base = (import.meta as any).env.VITE_API_BASE_URL || ''

export function toImageUrl(pathOrAbsolute: string | string[] | undefined | null): string {
  // Handle null/undefined
  if (!pathOrAbsolute) return getPlaceholderImage()
  
  // Handle array (in case images come as array)
  if (Array.isArray(pathOrAbsolute)) {
    if (pathOrAbsolute.length === 0) return getPlaceholderImage()
    return toImageUrl(pathOrAbsolute[0])
  }
  
  // Ensure it's a string
  const path = String(pathOrAbsolute)
  
  // Handle full URLs
  if (path.startsWith('http')) return path
  
  // Normalize for backend responses like "uploads/foo.jpg" or absolute tmp path
  if (path.includes('uploads')) {
    const trimmed = path.replace(/.*uploads[\\/]/, 'uploads/')
    return `${base.replace(/\/$/, '')}/${trimmed.replace(/^\//, '')}`
  }
  
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

export function getPlaceholderImage(width: number = 400, height: number = 400, text: string = 'No Image'): string {
  // Use a placeholder image service
  return `https://via.placeholder.com/${width}x${height}/e5e7eb/6b7280?text=${encodeURIComponent(text)}`
}
