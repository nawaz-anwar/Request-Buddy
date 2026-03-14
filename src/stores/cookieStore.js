import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Cookie Store - Manages cookies similar to Postman's Cookie Jar
 * 
 * Structure:
 * {
 *   "api.example.com": [
 *     {
 *       name: "session_id",
 *       value: "abc123",
 *       domain: "api.example.com",
 *       path: "/",
 *       expires: timestamp,
 *       httpOnly: false,
 *       secure: false,
 *       sameSite: "Lax"
 *     }
 *   ]
 * }
 */

export const useCookieStore = create(
  persist(
    (set, get) => ({
      // Cookie jar organized by domain
      cookieJar: {},

      // Add or update a cookie
      setCookie: (cookie) => {
        const { domain, name } = cookie
        if (!domain || !name) {
          console.error('Cookie must have domain and name')
          return
        }

        set((state) => {
          const domainCookies = state.cookieJar[domain] || []
          
          // Remove existing cookie with same name and path
          const filteredCookies = domainCookies.filter(
            c => !(c.name === cookie.name && c.path === cookie.path)
          )
          
          // Add new cookie
          return {
            cookieJar: {
              ...state.cookieJar,
              [domain]: [...filteredCookies, cookie]
            }
          }
        })
      },

      // Add multiple cookies at once
      setCookies: (cookies) => {
        cookies.forEach(cookie => get().setCookie(cookie))
      },

      // Get all cookies for a domain (including subdomains)
      getCookiesForDomain: (domain) => {
        const cookieJar = get().cookieJar
        const now = Date.now()
        const allCookies = []

        // Get cookies for exact domain and parent domains
        Object.keys(cookieJar).forEach(cookieDomain => {
          // Check if cookie domain matches or is a parent domain
          if (domain === cookieDomain || domain.endsWith('.' + cookieDomain) || cookieDomain.startsWith('.')) {
            const cookies = cookieJar[cookieDomain] || []
            
            // Filter out expired cookies
            const validCookies = cookies.filter(cookie => {
              if (!cookie.expires) return true
              return cookie.expires > now
            })
            
            allCookies.push(...validCookies)
          }
        })

        return allCookies
      },

      // Get cookies for a specific URL (domain + path matching)
      getCookiesForUrl: (url) => {
        try {
          const urlObj = new URL(url)
          const domain = urlObj.hostname
          const path = urlObj.pathname
          const isSecure = urlObj.protocol === 'https:'

          const domainCookies = get().getCookiesForDomain(domain)
          
          // Filter by path and secure flag
          return domainCookies.filter(cookie => {
            // Check path matching
            const cookiePath = cookie.path || '/'
            if (!path.startsWith(cookiePath)) {
              return false
            }

            // Check secure flag
            if (cookie.secure && !isSecure) {
              return false
            }

            return true
          })
        } catch (error) {
          console.error('Invalid URL:', url, error)
          return []
        }
      },

      // Delete a specific cookie
      deleteCookie: (domain, name, path = '/') => {
        set((state) => {
          const domainCookies = state.cookieJar[domain] || []
          const filteredCookies = domainCookies.filter(
            c => !(c.name === name && c.path === path)
          )

          if (filteredCookies.length === 0) {
            // Remove domain if no cookies left
            const { [domain]: removed, ...rest } = state.cookieJar
            return { cookieJar: rest }
          }

          return {
            cookieJar: {
              ...state.cookieJar,
              [domain]: filteredCookies
            }
          }
        })
      },

      // Delete all cookies for a domain
      deleteDomainCookies: (domain) => {
        set((state) => {
          const { [domain]: removed, ...rest } = state.cookieJar
          return { cookieJar: rest }
        })
      },

      // Clear all cookies
      clearAllCookies: () => {
        set({ cookieJar: {} })
      },

      // Clean up expired cookies
      cleanupExpiredCookies: () => {
        const now = Date.now()
        set((state) => {
          const newCookieJar = {}
          
          Object.keys(state.cookieJar).forEach(domain => {
            const validCookies = state.cookieJar[domain].filter(cookie => {
              if (!cookie.expires) return true
              return cookie.expires > now
            })
            
            if (validCookies.length > 0) {
              newCookieJar[domain] = validCookies
            }
          })
          
          return { cookieJar: newCookieJar }
        })
      },

      // Get all domains with cookies
      getAllDomains: () => {
        return Object.keys(get().cookieJar)
      },

      // Get cookie count for a domain
      getCookieCount: (domain) => {
        const cookies = get().cookieJar[domain] || []
        return cookies.length
      },

      // Export cookies (for backup/sync)
      exportCookies: () => {
        return JSON.stringify(get().cookieJar, null, 2)
      },

      // Import cookies (from backup/sync)
      importCookies: (jsonString) => {
        try {
          const cookieJar = JSON.parse(jsonString)
          set({ cookieJar })
          return true
        } catch (error) {
          console.error('Failed to import cookies:', error)
          return false
        }
      }
    }),
    {
      name: 'request-buddy-cookies', // LocalStorage key
      version: 1,
    }
  )
)

// Auto-cleanup expired cookies every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    useCookieStore.getState().cleanupExpiredCookies()
  }, 5 * 60 * 1000)
}
