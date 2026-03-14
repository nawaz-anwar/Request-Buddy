import { useState, useCallback } from 'react'
import { 
  FileText, 
  Code, 
  Info, 
  Eye, 
  EyeOff, 
  Copy, 
  Check,
  Download,
  Clock,
  Database,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Cookie
} from 'lucide-react'
import { highlightJson, getContentType, formatResponseData } from '../../utils/syntaxHighlight'

export default function ResponseViewer({ response }) {
  const [activeTab, setActiveTab] = useState('body')
  const [isRawView, setIsRawView] = useState(false)
  const [htmlPreviewOpen, setHtmlPreviewOpen] = useState(false)
  const [copiedStates, setCopiedStates] = useState({})
  const [bodyViewMode, setBodyViewMode] = useState('pretty') // 'pretty', 'raw', 'preview'

  if (!response) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Response
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Send a request to see the response here
          </p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400'
    if (status >= 300 && status < 400) return 'text-yellow-600 dark:text-yellow-400'
    if (status >= 400 && status < 500) return 'text-orange-600 dark:text-orange-400'
    if (status >= 500) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getStatusBadgeColor = (status) => {
    if (status >= 200 && status < 300) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    if (status >= 300 && status < 400) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
    if (status >= 400 && status < 500) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
    if (status >= 500) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  }

  const getStatusIcon = (status) => {
    if (status >= 200 && status < 300) return <CheckCircle className="h-4 w-4" />
    if (status >= 400) return <XCircle className="h-4 w-4" />
    return <AlertCircle className="h-4 w-4" />
  }

  const formatSize = (bytes) => {
    if (!bytes) return '0 B'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  // Parse cookies from Set-Cookie headers
  const parseCookies = () => {
    const headers = response.headers || {}
    const cookies = []
    
    // Look for Set-Cookie headers (can be array or single value)
    const setCookieHeaders = headers['set-cookie'] || headers['Set-Cookie'] || []
    const cookieArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders].filter(Boolean)
    
    cookieArray.forEach((cookieString, index) => {
      if (!cookieString) return
      
      const cookie = {
        id: index,
        name: '',
        value: '',
        domain: '',
        path: '',
        expires: '',
        httpOnly: false,
        secure: false,
        sameSite: ''
      }
      
      // Split by semicolon and parse each part
      const parts = cookieString.split(';').map(part => part.trim())
      
      // First part is name=value
      if (parts[0]) {
        const [name, ...valueParts] = parts[0].split('=')
        cookie.name = name.trim()
        cookie.value = valueParts.join('=').trim()
      }
      
      // Parse attributes
      parts.slice(1).forEach(part => {
        const [key, value] = part.split('=').map(s => s.trim())
        const lowerKey = key.toLowerCase()
        
        switch (lowerKey) {
          case 'domain':
            cookie.domain = value || ''
            break
          case 'path':
            cookie.path = value || ''
            break
          case 'expires':
            cookie.expires = value || ''
            break
          case 'max-age':
            if (value) {
              const maxAge = parseInt(value)
              const expiryDate = new Date(Date.now() + maxAge * 1000)
              cookie.expires = expiryDate.toUTCString()
            }
            break
          case 'httponly':
            cookie.httpOnly = true
            break
          case 'secure':
            cookie.secure = true
            break
          case 'samesite':
            cookie.sameSite = value || 'Lax'
            break
        }
      })
      
      cookies.push(cookie)
    })
    
    return cookies
  }

  const contentType = getContentType(response.headers)
  
  const isJsonResponse = () => {
    return contentType === 'application/json'
  }

  const isHtmlResponse = () => {
    return contentType === 'text/html'
  }

  const formatJsonData = (data) => {
    try {
      if (typeof data === 'string') {
        return JSON.stringify(JSON.parse(data), null, 2)
      }
      return JSON.stringify(data, null, 2)
    } catch {
      return typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    }
  }

  const getRawData = () => {
    if (typeof response.data === 'string') {
      return response.data
    }
    return JSON.stringify(response.data, null, 2)
  }

  const copyToClipboard = useCallback((text, key = 'default') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStates(prev => ({ ...prev, [key]: true }))
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }))
      }, 2000)
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err)
    })
  }, [])

  const downloadResponse = () => {
    const content = isRawView ? getRawData() : formatJsonData(response.data)
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `response-${Date.now()}.${isJsonResponse() ? 'json' : 'txt'}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderBody = () => {
    if (response.error) {
      return (
        <div className="h-full flex flex-col">
          <div className="p-4 flex-1 overflow-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <h4 className="font-medium text-red-800 dark:text-red-200">Request Error</h4>
              </div>
              <p className="text-red-700 dark:text-red-300 text-sm">{response.error}</p>
            </div>
          </div>
        </div>
      )
    }

    const content = bodyViewMode === 'raw' ? getRawData() : formatJsonData(response.data)
    
    return (
      <div className="h-full flex flex-col">
        {/* Body Header with View Controls */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">Response Body</h4>
            
            {/* View Mode Buttons */}
            <div className="flex items-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden">
              {isJsonResponse() && (
                <button
                  onClick={() => setBodyViewMode('pretty')}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    bodyViewMode === 'pretty'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Pretty
                </button>
              )}
              <button
                onClick={() => setBodyViewMode('raw')}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  bodyViewMode === 'raw'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Raw
              </button>
              {isHtmlResponse() && (
                <button
                  onClick={() => setBodyViewMode('preview')}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    bodyViewMode === 'preview'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Preview
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => copyToClipboard(content, 'body')}
              className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-md transition-all duration-200 ${
                copiedStates.body
                  ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={copiedStates.body ? 'Copied!' : 'Copy response body'}
            >
              {copiedStates.body ? (
                <>
                  <Check className="h-3 w-3" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={downloadResponse}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Download response"
            >
              <Download className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Body Content - Scrollable container */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          {bodyViewMode === 'preview' && isHtmlResponse() ? (
            <div className="p-4 h-full">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-full min-h-[400px]">
                <iframe
                  srcDoc={getRawData()}
                  className="w-full h-full bg-white"
                  title="HTML Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="bg-gray-900 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-700">
                {isJsonResponse() && bodyViewMode === 'pretty' ? (
                  <pre className="p-4 text-sm whitespace-pre-wrap font-mono leading-relaxed text-gray-100">
                    <code 
                      dangerouslySetInnerHTML={{ 
                        __html: formatResponseData(response.data, contentType, true) 
                      }}
                    />
                  </pre>
                ) : (
                  <pre className="p-4 text-sm text-gray-100 whitespace-pre-wrap font-mono leading-relaxed">
                    {content}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderHeaders = () => {
    const headers = response.headers || {}
    const headerEntries = Object.entries(headers)

    return (
      <div className="h-full flex flex-col">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              Response Headers ({headerEntries.length})
            </h4>
            {headerEntries.length > 0 && (
              <button
                onClick={() => {
                  const allHeaders = headerEntries.map(([key, value]) => `${key}: ${value}`).join('\n')
                  copyToClipboard(allHeaders, 'all-headers')
                }}
                className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-md transition-all duration-200 ${
                  copiedStates['all-headers']
                    ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {copiedStates['all-headers'] ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy All</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 min-h-0 overflow-auto">
          {headerEntries.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-3">
                <Code className="h-6 w-6 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">No headers received</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                Response headers will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {headerEntries.map(([key, value], index) => (
                <div key={index} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                        {key}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm break-all font-mono">
                        {String(value)}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`${key}: ${value}`, `header-${index}`)}
                      className={`ml-2 p-1 rounded transition-all duration-200 ${
                        copiedStates[`header-${index}`]
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      }`}
                      title={copiedStates[`header-${index}`] ? 'Copied!' : 'Copy header'}
                    >
                      {copiedStates[`header-${index}`] ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
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

  const renderCookies = () => {
    const cookies = parseCookies()

    return (
      <div className="h-full flex flex-col">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
            Cookies ({cookies.length})
          </h4>
        </div>
        
        <div className="flex-1 min-h-0 overflow-auto">
          {cookies.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-3">
                <Cookie className="h-6 w-6 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">No cookies received</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                Cookies will appear here when Set-Cookie headers are present
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Value</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Domain</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Path</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Expires</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Flags</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {cookies.map((cookie) => (
                    <tr key={cookie.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {cookie.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-600 dark:text-gray-400 font-mono text-xs max-w-xs truncate">
                          {cookie.value || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-600 dark:text-gray-400 text-xs">
                          {cookie.domain || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-600 dark:text-gray-400 text-xs">
                          {cookie.path || '/'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-600 dark:text-gray-400 text-xs">
                          {cookie.expires ? new Date(cookie.expires).toLocaleDateString() : 'Session'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {cookie.httpOnly && (
                            <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                              HttpOnly
                            </span>
                          )}
                          {cookie.secure && (
                            <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded">
                              Secure
                            </span>
                          )}
                          {cookie.sameSite && (
                            <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded">
                              {cookie.sameSite}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => copyToClipboard(`${cookie.name}=${cookie.value}`, `cookie-${cookie.id}`)}
                          className={`p-1 rounded transition-all duration-200 ${
                            copiedStates[`cookie-${cookie.id}`]
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                          title={copiedStates[`cookie-${cookie.id}`] ? 'Copied!' : 'Copy cookie'}
                        >
                          {copiedStates[`cookie-${cookie.id}`] ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderMeta = () => {
    return (
      <div className="h-full flex flex-col">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm">Response Metadata</h4>
        </div>
        
        <div className="flex-1 min-h-0 overflow-auto p-4 space-y-4">
          {/* Status */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-2">
              {getStatusIcon(response.status)}
              <h5 className="font-medium text-gray-900 dark:text-white">Status</h5>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`font-semibold px-3 py-1 rounded-md text-sm ${getStatusBadgeColor(response.status)}`}>
                {response.status} {response.statusText || 'Unknown'}
              </span>
            </div>
          </div>

          {/* Timing */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <h5 className="font-medium text-gray-900 dark:text-white">Timing</h5>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatTime(response.time || 0)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Response time</p>
          </div>

          {/* Size */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-2">
              <Database className="h-4 w-4 text-purple-500" />
              <h5 className="font-medium text-gray-900 dark:text-white">Size</h5>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatSize(response.size || 0)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Response size</p>
          </div>

          {/* Timestamp */}
          {response.timestamp && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="h-4 w-4 text-green-500" />
                <h5 className="font-medium text-gray-900 dark:text-white">Timestamp</h5>
              </div>
              <div className="text-sm text-gray-900 dark:text-white">
                {new Date(response.timestamp).toLocaleString()}
              </div>
            </div>
          )}

          {/* Historical Response Indicator */}
          {response.isHistorical && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3 mb-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <h5 className="font-medium text-blue-800 dark:text-blue-200">Historical Response</h5>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This response is from your request history and is read-only.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const cookies = parseCookies()
  
  const tabs = [
    { id: 'body', label: 'Body', icon: FileText },
    { id: 'headers', label: 'Headers', icon: Code, count: Object.keys(response.headers || {}).length },
    { id: 'cookies', label: 'Cookies', icon: Cookie, count: cookies.length },
    { id: 'meta', label: 'Meta', icon: Info }
  ]

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-gray-800 min-w-0">
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
        <div className="flex space-x-1 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200 dark:border-gray-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content - Flexible container that fills available space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'body' && renderBody()}
        {activeTab === 'headers' && renderHeaders()}
        {activeTab === 'cookies' && renderCookies()}
        {activeTab === 'meta' && renderMeta()}
      </div>
    </div>
  )
}