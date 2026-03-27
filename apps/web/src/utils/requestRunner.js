// -----------------------------
// Request Runner (Electron/Renderer compatible)
// -----------------------------

import { useCookieStore } from '../stores/cookieStore'
import { parseSetCookieHeaders, formatCookieHeader, extractDomain } from './cookieUtils'

/**
 * Run an HTTP request with proper error handling and response formatting
 * @param {Object} req - Request object with method, url, headers, params, body, auth
 * @returns {Promise<Object>} Response object with status, data, headers, time, size
 */
export async function runRequest(req) {
  if (!req || !req.method || !req.url) {
    return {
      error: "Invalid request object - missing method or URL",
      status: 0,
      time: 0,
      size: 0,
      data: null,
      headers: {}
    }
  }

  const start = performance.now()

  try {
    // Build URL with params
    let finalUrl
    try {
      finalUrl = new URL(req.url)
    } catch (urlError) {
      return {
        error: `Invalid URL: ${req.url}`,
        status: 0,
        time: 0,
        size: 0,
        data: null,
        headers: {}
      }
    }

    // Add query parameters
    if (req.params) {
      if (Array.isArray(req.params)) {
        // Handle array format
        req.params.filter(p => p.enabled && p.key).forEach(p => {
          finalUrl.searchParams.append(p.key, p.value || '')
        })
      } else if (typeof req.params === 'object') {
        // Handle object format
        Object.entries(req.params).forEach(([key, value]) => {
          if (typeof value === 'object' && value.enabled !== false) {
            finalUrl.searchParams.append(key, value.value || '')
          } else if (typeof value === 'string') {
            finalUrl.searchParams.append(key, value)
          }
        })
      }
    }

    // Build headers
    const headers = {}
    if (req.headers) {
      if (Array.isArray(req.headers)) {
        // Handle array format
        req.headers.filter(h => h.enabled && h.key).forEach(h => {
          headers[h.key] = h.value || ''
        })
      } else if (typeof req.headers === 'object') {
        // Handle object format
        Object.entries(req.headers).forEach(([key, value]) => {
          if (typeof value === 'object' && value.enabled !== false) {
            headers[key] = value.value || ''
          } else if (typeof value === 'string') {
            headers[key] = value
          }
        })
      }
    }

    // STEP 3: ATTACH COOKIES TO REQUESTS
    // Get cookies for this URL and add them to headers
    try {
      const cookieStore = useCookieStore.getState()
      const cookies = cookieStore.getCookiesForUrl(finalUrl.toString())
      
      if (cookies.length > 0) {
        const cookieHeader = formatCookieHeader(cookies)
        if (cookieHeader) {
          headers['Cookie'] = cookieHeader
          console.log('🍪 Attached cookies to request:', cookieHeader)
        }
      }
    } catch (cookieError) {
      console.warn('Failed to attach cookies:', cookieError)
      // Don't fail the request if cookie handling fails
    }

    // Handle Authentication
    if (req.auth?.type === "bearer" && req.auth.bearerToken) {
      headers["Authorization"] = `Bearer ${req.auth.bearerToken}`
    } else if (req.auth?.type === "basic" && req.auth.basic) {
      const username = req.auth.basic.username || ''
      const password = req.auth.basic.password || ''
      const encoded = btoa(`${username}:${password}`)
      headers["Authorization"] = `Basic ${encoded}`
    }

    // Handle Request Body
    let data = undefined
    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      if (req.body.type === "json" && req.body.content) {
        data = req.body.content
        headers["Content-Type"] = "application/json"
      } else if (req.body.type === "raw" && req.body.content) {
        data = req.body.content
        // Don't override Content-Type if already set
        if (!headers["Content-Type"]) {
          headers["Content-Type"] = "text/plain"
        }
      } else if (req.body.type === "form-data" && req.body.data) {
        const form = new FormData()
        Object.entries(req.body.data).forEach(([key, value]) => {
          if (value.enabled !== false) {
            if (value.type === 'file' && value.file) {
              form.append(key, value.file)
            } else {
              form.append(key, value.value || '')
            }
          }
        })
        data = form
        // Don't set Content-Type for FormData, let browser handle it
      }
    }

    let response
    let responseHeaders = {}

    // Try Electron API first, then fallback to fetch
    if (window.electronAPI && window.electronAPI.httpRequest) {
      console.log('Using Electron API for request')
      response = await window.electronAPI.httpRequest({
        method: req.method,
        url: finalUrl.toString(),
        headers,
        data,
        body: req.body
      })
      
      responseHeaders = response.headers || {}
    } else {
      // Fallback to fetch API
      console.log('Using fetch API for request')
      const fetchOptions = {
        method: req.method,
        headers,
      }

      if (data !== undefined) {
        fetchOptions.body = data
      }

      const fetchResponse = await fetch(finalUrl.toString(), fetchOptions)
      responseHeaders = Object.fromEntries(fetchResponse.headers.entries())
      
      let responseData
      const contentType = fetchResponse.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await fetchResponse.json()
        } catch {
          responseData = await fetchResponse.text()
        }
      } else {
        responseData = await fetchResponse.text()
      }

      response = {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        data: responseData,
        headers: responseHeaders
      }
    }

    // STEP 2: CAPTURE COOKIES FROM RESPONSE
    // Parse Set-Cookie headers and store them
    try {
      const domain = extractDomain(finalUrl.toString())
      const newCookies = parseSetCookieHeaders(responseHeaders, domain)
      
      if (newCookies.length > 0) {
        const cookieStore = useCookieStore.getState()
        cookieStore.setCookies(newCookies)
        console.log('🍪 Captured cookies from response:', newCookies.length, 'cookies')
      }
    } catch (cookieError) {
      console.warn('Failed to capture cookies:', cookieError)
      // Don't fail the request if cookie handling fails
    }

    const time = Math.round(performance.now() - start)
    return {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: responseHeaders,
      time,
      size: JSON.stringify(response.data)?.length || 0
    }
  } catch (err) {
    const time = Math.round(performance.now() - start)
    console.error('Request failed:', err)
    
    return {
      error: err.message || 'Request failed',
      status: err.response?.status || 0,
      statusText: err.response?.statusText || 'Error',
      data: err.response?.data || { error: err.message },
      headers: err.response?.headers || {},
      time,
      size: 0
    }
  }
}

/**
 * Validate request object before sending
 * @param {Object} req - Request object to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateRequest(req) {
  const errors = []
  
  if (!req) {
    errors.push('Request object is required')
    return { isValid: false, errors }
  }
  
  if (!req.method) {
    errors.push('HTTP method is required')
  }
  
  if (!req.url) {
    errors.push('URL is required')
  } else {
    try {
      new URL(req.url)
    } catch {
      errors.push('Invalid URL format')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}