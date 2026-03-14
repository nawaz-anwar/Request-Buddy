import { useState } from 'react'
import { Plus, Trash2, Cookie, AlertCircle, Clock, Shield, Globe } from 'lucide-react'
import { useCookieStore } from '../../stores/cookieStore'
import { extractDomain, formatCookieDisplay, isValidCookieName, createCookie } from '../../utils/cookieUtils'

export default function CookiesTab({ url, onChange }) {
  const { getCookiesForUrl, setCookie, deleteCookie } = useCookieStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCookie, setNewCookie] = useState({
    name: '',
    value: '',
    path: '/',
    httpOnly: false,
    secure: false
  })

  const domain = url ? extractDomain(url) : ''
  const cookies = url ? getCookiesForUrl(url) : []

  const handleAddCookie = () => {
    if (!newCookie.name || !domain) return

    if (!isValidCookieName(newCookie.name)) {
      alert('Invalid cookie name. Cookie names cannot contain special characters or whitespace.')
      return
    }

    const cookie = createCookie(
      newCookie.name,
      newCookie.value,
      domain,
      {
        path: newCookie.path || '/',
        httpOnly: newCookie.httpOnly,
        secure: newCookie.secure
      }
    )

    setCookie(cookie)
    
    // Reset form
    setNewCookie({
      name: '',
      value: '',
      path: '/',
      httpOnly: false,
      secure: false
    })
    setShowAddForm(false)

    // Trigger onChange to update parent
    if (onChange) {
      onChange({ cookies: [...cookies, cookie] })
    }
  }

  const handleDeleteCookie = (cookie) => {
    deleteCookie(cookie.domain, cookie.name, cookie.path)
    
    // Trigger onChange to update parent
    if (onChange) {
      const updatedCookies = cookies.filter(
        c => !(c.name === cookie.name && c.path === cookie.path)
      )
      onChange({ cookies: updatedCookies })
    }
  }

  const isExpired = (cookie) => {
    if (!cookie.expires) return false
    return cookie.expires < Date.now()
  }

  if (!url) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 p-8">
        <div className="text-center">
          <Cookie className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Enter a URL to manage cookies
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cookie className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Cookies for {domain}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {cookies.length} cookie{cookies.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Cookie</span>
          </button>
        </div>

        {/* Info Banner */}
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Cookies are automatically sent with requests to matching domains. 
              Response cookies are automatically captured and stored.
            </p>
          </div>
        </div>
      </div>

      {/* Add Cookie Form */}
      {showAddForm && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Add New Cookie
          </h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newCookie.name}
                  onChange={(e) => setNewCookie({ ...newCookie, name: e.target.value })}
                  placeholder="session_id"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Value *
                </label>
                <input
                  type="text"
                  value={newCookie.value}
                  onChange={(e) => setNewCookie({ ...newCookie, value: e.target.value })}
                  placeholder="abc123"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Path
              </label>
              <input
                type="text"
                value={newCookie.path}
                onChange={(e) => setNewCookie({ ...newCookie, path: e.target.value })}
                placeholder="/"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newCookie.httpOnly}
                  onChange={(e) => setNewCookie({ ...newCookie, httpOnly: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-700 dark:text-gray-300">HttpOnly</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newCookie.secure}
                  onChange={(e) => setNewCookie({ ...newCookie, secure: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-700 dark:text-gray-300">Secure</span>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAddCookie}
                disabled={!newCookie.name || !newCookie.value}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                Add Cookie
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cookies List */}
      <div className="flex-1 overflow-y-auto">
        {cookies.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <Cookie className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                No cookies for this domain
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Cookies will be automatically captured from responses
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {cookies.map((cookie, index) => (
              <div
                key={`${cookie.name}-${cookie.path}-${index}`}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200 ${
                  isExpired(cookie) ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {cookie.name}
                      </h4>
                      {isExpired(cookie) && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded">
                          Expired
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono break-all mb-2">
                      {cookie.value}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Globe className="h-3 w-3" />
                        <span>{cookie.domain}</span>
                      </div>
                      <span>•</span>
                      <span>Path: {cookie.path}</span>
                      {cookie.expires && (
                        <>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(cookie.expires).toLocaleDateString()}
                            </span>
                          </div>
                        </>
                      )}
                      {(cookie.httpOnly || cookie.secure) && (
                        <>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Shield className="h-3 w-3" />
                            <span>
                              {[
                                cookie.httpOnly && 'HttpOnly',
                                cookie.secure && 'Secure'
                              ].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCookie(cookie)}
                    className="ml-4 p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                    title="Delete cookie"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
