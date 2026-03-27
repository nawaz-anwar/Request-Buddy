/**
 * Cookie Utilities
 * Parse and format cookies for HTTP requests/responses
 */

/**
 * Parse Set-Cookie header from response
 * @param {string} setCookieHeader - Set-Cookie header value
 * @param {string} domain - Domain from request URL
 * @returns {object} Parsed cookie object
 */
export function parseSetCookie(setCookieHeader, domain) {
  if (!setCookieHeader) return null

  const parts = setCookieHeader.split(';').map(part => part.trim())
  const [nameValue, ...attributes] = parts
  
  if (!nameValue || !nameValue.includes('=')) return null

  const [name, ...valueParts] = nameValue.split('=')
  const value = valueParts.join('=') // Handle values with = in them

  const cookie = {
    name: name.trim(),
    value: value.trim(),
    domain: domain,
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'Lax',
    expires: null
  }

  // Parse attributes
  attributes.forEach(attr => {
    const [key, val] = attr.split('=').map(s => s.trim())
    const lowerKey = key.toLowerCase()

    switch (lowerKey) {
      case 'domain':
        cookie.domain = val || domain
        break
      case 'path':
        cookie.path = val || '/'
        break
      case 'expires':
        cookie.expires = new Date(val).getTime()
        break
      case 'max-age':
        const maxAge = parseInt(val, 10)
        if (!isNaN(maxAge)) {
          cookie.expires = Date.now() + (maxAge * 1000)
        }
        break
      case 'httponly':
        cookie.httpOnly = true
        break
      case 'secure':
        cookie.secure = true
        break
      case 'samesite':
        cookie.sameSite = val || 'Lax'
        break
    }
  })

  return cookie
}

/**
 * Parse multiple Set-Cookie headers from response
 * @param {object} headers - Response headers object
 * @param {string} domain - Domain from request URL
 * @returns {array} Array of parsed cookie objects
 */
export function parseSetCookieHeaders(headers, domain) {
  if (!headers) return []

  const cookies = []
  
  // Handle both lowercase and case-sensitive header names
  const setCookieHeaders = headers['set-cookie'] || headers['Set-Cookie'] || []
  
  // Handle single string or array of strings
  const headerArray = Array.isArray(setCookieHeaders) 
    ? setCookieHeaders 
    : [setCookieHeaders]

  headerArray.forEach(header => {
    if (header) {
      const cookie = parseSetCookie(header, domain)
      if (cookie) {
        cookies.push(cookie)
      }
    }
  })

  return cookies
}

/**
 * Format cookies for Cookie header
 * @param {array} cookies - Array of cookie objects
 * @returns {string} Formatted cookie header value
 */
export function formatCookieHeader(cookies) {
  if (!cookies || cookies.length === 0) return ''

  return cookies
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ')
}

/**
 * Extract domain from URL
 * @param {string} url - Request URL
 * @returns {string} Domain
 */
export function extractDomain(url) {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch (error) {
    console.error('Invalid URL:', url)
    return ''
  }
}

/**
 * Check if cookie is expired
 * @param {object} cookie - Cookie object
 * @returns {boolean} True if expired
 */
export function isCookieExpired(cookie) {
  if (!cookie.expires) return false
  return cookie.expires < Date.now()
}

/**
 * Format cookie for display
 * @param {object} cookie - Cookie object
 * @returns {string} Human-readable cookie info
 */
export function formatCookieDisplay(cookie) {
  const parts = [`${cookie.name}=${cookie.value}`]
  
  if (cookie.domain) parts.push(`Domain=${cookie.domain}`)
  if (cookie.path) parts.push(`Path=${cookie.path}`)
  if (cookie.expires) {
    const date = new Date(cookie.expires)
    parts.push(`Expires=${date.toLocaleString()}`)
  }
  if (cookie.httpOnly) parts.push('HttpOnly')
  if (cookie.secure) parts.push('Secure')
  if (cookie.sameSite) parts.push(`SameSite=${cookie.sameSite}`)
  
  return parts.join('; ')
}

/**
 * Validate cookie name
 * @param {string} name - Cookie name
 * @returns {boolean} True if valid
 */
export function isValidCookieName(name) {
  if (!name || typeof name !== 'string') return false
  // Cookie names cannot contain: ( ) < > @ , ; : \ " / [ ] ? = { } or whitespace
  return !/[()<>@,;:\\"/[\]?={}\s]/.test(name)
}

/**
 * Create a new cookie object
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {string} domain - Cookie domain
 * @param {object} options - Additional cookie options
 * @returns {object} Cookie object
 */
export function createCookie(name, value, domain, options = {}) {
  return {
    name,
    value,
    domain,
    path: options.path || '/',
    expires: options.expires || null,
    httpOnly: options.httpOnly || false,
    secure: options.secure || false,
    sameSite: options.sameSite || 'Lax'
  }
}

/**
 * Merge cookies (newer cookies override older ones)
 * @param {array} existingCookies - Existing cookies
 * @param {array} newCookies - New cookies to merge
 * @returns {array} Merged cookies
 */
export function mergeCookies(existingCookies, newCookies) {
  const cookieMap = new Map()
  
  // Add existing cookies
  existingCookies.forEach(cookie => {
    const key = `${cookie.name}:${cookie.path}`
    cookieMap.set(key, cookie)
  })
  
  // Override with new cookies
  newCookies.forEach(cookie => {
    const key = `${cookie.name}:${cookie.path}`
    cookieMap.set(key, cookie)
  })
  
  return Array.from(cookieMap.values())
}

/**
 * Filter cookies by path
 * @param {array} cookies - Array of cookies
 * @param {string} path - Request path
 * @returns {array} Filtered cookies
 */
export function filterCookiesByPath(cookies, path) {
  return cookies.filter(cookie => {
    const cookiePath = cookie.path || '/'
    return path.startsWith(cookiePath)
  })
}

/**
 * Sort cookies by path specificity (most specific first)
 * @param {array} cookies - Array of cookies
 * @returns {array} Sorted cookies
 */
export function sortCookiesByPath(cookies) {
  return [...cookies].sort((a, b) => {
    const pathA = a.path || '/'
    const pathB = b.path || '/'
    return pathB.length - pathA.length
  })
}
