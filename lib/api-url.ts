/**
 * API URL construction utility for server-side and client-side requests
 * Optimized for Cloudflare/OpenNext.js environment
 */

/**
 * Get the base URL for API requests
 * @returns Base URL for the current environment
 */
function getBaseUrl(): string {
  // Client-side: use window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // Server-side: For Cloudflare/OpenNext.js, prefer relative URLs
  // which work correctly in the edge environment
  return ''
}

/**
 * Construct API URL with proper base URL
 * @param path - API path (e.g., '/api/files/123')
 * @returns Full API URL
 */
export function getApiUrl(path: string): string {
  const baseUrl = getBaseUrl()
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  
  // If baseUrl is empty (server-side production), return relative URL
  if (!baseUrl) {
    return normalizedPath
  }
  
  return `${baseUrl}${normalizedPath}`
}

/**
 * Make API request with proper URL construction and error handling
 * @param path - API path
 * @param options - Fetch options
 * @returns Response or throws error
 */
export async function apiRequest(path: string, options: RequestInit = {}): Promise<Response> {
  // Server-side: Always use absolute URL with localhost for OpenNext.js
  const url = typeof window === 'undefined' ? 
    `http://localhost:3000${path.startsWith('/') ? path : '/' + path}` : 
    getApiUrl(path)
  
  const defaultOptions: RequestInit = {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }
  
  try {
    console.log(`Making API request to: ${url}`)
    const response = await fetch(url, defaultOptions)
    
    if (!response.ok) {
      console.error(`API request failed: ${response.status} ${response.statusText}`)
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    
    return response
  } catch (error) {
    console.error(`API request error for ${url}:`, error)
    throw error
  }
}