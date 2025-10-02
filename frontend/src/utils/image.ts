const base = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:3333'

export function toImageUrl(pathOrAbsolute: string | string[] | undefined | null): string {
  // Handle null/undefined
  if (!pathOrAbsolute) {
    console.log('🖼️ Image path is null/undefined, using placeholder')
    return getPlaceholderImage()
  }
  
  // Handle array (in case images come as array)
  if (Array.isArray(pathOrAbsolute)) {
    if (pathOrAbsolute.length === 0) {
      console.log('🖼️ Image array is empty, using placeholder')
      return getPlaceholderImage()
    }
    return toImageUrl(pathOrAbsolute[0])
  }
  
  // Ensure it's a string
  const path = String(pathOrAbsolute).trim()
  
  // Handle empty strings
  if (!path) {
    console.log('🖼️ Image path is empty string, using placeholder')
    return getPlaceholderImage()
  }
  
  // Handle full URLs
  if (path.startsWith('http://') || path.startsWith('https://')) {
    console.log('🖼️ Using full URL:', path)
    return path
  }
  
  // Remove any leading slashes
  const cleanPath = path.replace(/^\/+/, '')
  
  // Ensure base URL doesn't end with slash
  const cleanBase = base.replace(/\/+$/, '')
  
  // Construct the full URL
  // The backend serves files from /uploads, so paths like "uploads/file.jpg" should work
  const fullUrl = `${cleanBase}/${cleanPath}`
  console.log('🖼️ Constructed image URL:', fullUrl, 'from path:', path)
  
  return fullUrl
}

export function getPlaceholderImage(width: number = 400, height: number = 400, text: string = 'No Image'): string {
  // Create an SVG placeholder as a data URI with gradient and icon
  const iconSize = Math.min(width, height) / 3
  const fontSize = Math.min(width, height) / 15
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      
      <!-- Image Icon -->
      <g transform="translate(${width / 2}, ${height / 2 - fontSize})">
        <path
          transform="translate(${-iconSize / 2}, ${-iconSize / 2})"
          d="M ${iconSize * 0.15} ${iconSize * 0.1} 
             h ${iconSize * 0.7} 
             a ${iconSize * 0.15} ${iconSize * 0.15} 0 0 1 ${iconSize * 0.15} ${iconSize * 0.15} 
             v ${iconSize * 0.5} 
             a ${iconSize * 0.15} ${iconSize * 0.15} 0 0 1 ${-iconSize * 0.15} ${iconSize * 0.15} 
             h ${-iconSize * 0.7} 
             a ${iconSize * 0.15} ${iconSize * 0.15} 0 0 1 ${-iconSize * 0.15} ${-iconSize * 0.15} 
             v ${-iconSize * 0.5} 
             a ${iconSize * 0.15} ${iconSize * 0.15} 0 0 1 ${iconSize * 0.15} ${-iconSize * 0.15} z
             M ${iconSize * 0.3} ${iconSize * 0.3} 
             a ${iconSize * 0.08} ${iconSize * 0.08} 0 1 1 ${iconSize * 0.16} 0 
             a ${iconSize * 0.08} ${iconSize * 0.08} 0 1 1 ${-iconSize * 0.16} 0
             M ${iconSize * 0.15} ${iconSize * 0.7} 
             l ${iconSize * 0.2} ${-iconSize * 0.2} 
             l ${iconSize * 0.15} ${iconSize * 0.15} 
             l ${iconSize * 0.2} ${-iconSize * 0.25} 
             l ${iconSize * 0.15} ${iconSize * 0.2}"
          fill="none"
          stroke="#d1d5db"
          stroke-width="${iconSize * 0.06}"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      
      <!-- Text -->
      <text
        x="50%"
        y="${height / 2 + iconSize / 2 + fontSize}"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="${fontSize}px"
        font-weight="500"
        fill="#9ca3af"
      >${escapeXml(text)}</text>
    </svg>
  `.trim()
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case "'": return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}
