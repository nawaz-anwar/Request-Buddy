import { Info, Globe, Key, FileText, Hash, Shield } from 'lucide-react'

export default function RequestInfo({ request, environmentVariables = {} }) {
  if (!request) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Info className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Request Selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Select a request to view its information
          </p>
        </div>
      </div>
    )
  }

  const { method, url, headers = {}, params = {}, body, auth } = request

  // Process URL with environment variables
  let resolvedUrl = url
  Object.entries(environmentVariables).forEach(([key, value]) => {
    resolvedUrl = resolvedUrl.replace(new RegExp(`{{${key}}}`, 'g'), value)
  })

  // Add query parameters to resolved URL
  const enabledParams = Object.entries(params).filter(([key, value]) => {
    return typeof value === 'object' ? value.enabled !== false : true
  })

  if (enabledParams.length > 0) {
    const queryString = enabledParams
      .map(([key, value]) => {
        const paramValue = typeof value === 'object' ? value.value : value
        return `${encodeURIComponent(key)}=${encodeURIComponent(paramValue)}`
      })
      .join('&')
    
    resolvedUrl += (resolvedUrl.includes('?') ? '&' : '?') + queryString
  }

  // Count enabled headers
  const enabledHeaders = Object.entries(headers).filter(([key, value]) => {
    return typeof value === 'object' ? value.enabled !== false : true
  })

  // Get auth type display
  const getAuthDisplay = () => {
    if (!auth || auth.type === 'none') return 'None'
    if (auth.type === 'bearer') return 'Bearer Token'
    if (auth.type === 'basic') return 'Basic Auth'
    return 'Unknown'
  }

  // Get body type display
  const getBodyDisplay = () => {
    if (!body || body.type === 'none') return 'None'
    if (body.type === 'json') return 'JSON'
    if (body.type === 'raw') return 'Raw Text'
    if (body.type === 'form-data') return 'Form Data'
    return 'Unknown'
  }

  // Get environment variables used
  const getUsedVariables = () => {
    const variablePattern = /\{\{([^}]+)\}\}/g
    const usedVars = new Set()
    
    // Check URL
    let match
    while ((match = variablePattern.exec(url)) !== null) {
      usedVars.add(match[1])
    }
    
    // Check headers
    Object.values(headers).forEach(value => {
      const headerValue = typeof value === 'object' ? value.value : value
      if (typeof headerValue === 'string') {
        variablePattern.lastIndex = 0
        while ((match = variablePattern.exec(headerValue)) !== null) {
          usedVars.add(match[1])
        }
      }
    })
    
    // Check auth
    if (auth?.type === 'bearer' && auth.bearerToken) {
      variablePattern.lastIndex = 0
      while ((match = variablePattern.exec(auth.bearerToken)) !== null) {
        usedVars.add(match[1])
      }
    }
    
    // Check body
    if (body?.content) {
      variablePattern.lastIndex = 0
      while ((match = variablePattern.exec(body.content)) !== null) {
        usedVars.add(match[1])
      }
    }
    
    return Array.from(usedVars)
  }

  const usedVariables = getUsedVariables()

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center space-x-2">
          <Info className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">Request Information</h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Method & URL */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <Globe className="h-4 w-4 text-blue-500" />
            <h4 className="font-medium text-gray-900 dark:text-white">Endpoint</h4>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                method === 'GET' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                method === 'POST' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                method === 'PUT' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                method === 'DELETE' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                {method}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Method</span>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Original URL:</div>
              <div className="text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded text-gray-900 dark:text-white break-all">
                {url}
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Resolved URL:</div>
              <div className="text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded text-gray-900 dark:text-white break-all">
                {resolvedUrl}
              </div>
            </div>
          </div>
        </div>

        {/* Headers */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <Hash className="h-4 w-4 text-purple-500" />
            <h4 className="font-medium text-gray-900 dark:text-white">Headers</h4>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {enabledHeaders.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {enabledHeaders.length === 1 ? 'header' : 'headers'} enabled
            </div>
          </div>
          
          {enabledHeaders.length > 0 && (
            <div className="mt-3 space-y-1">
              {enabledHeaders.slice(0, 3).map(([headerKey, headerValue]) => (
                <div key={headerKey} className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                  {headerKey}: {typeof headerValue === 'object' ? headerValue.value : headerValue}
                </div>
              ))}
              {enabledHeaders.length > 3 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  +{enabledHeaders.length - 3} more...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Authentication */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="h-4 w-4 text-green-500" />
            <h4 className="font-medium text-gray-900 dark:text-white">Authentication</h4>
          </div>
          
          <div className="text-sm text-gray-900 dark:text-white">
            {getAuthDisplay()}
          </div>
          
          {auth?.type === 'bearer' && auth.bearerToken && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Token configured
            </div>
          )}
          
          {auth?.type === 'basic' && auth.basic?.username && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Username: {auth.basic.username}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="h-4 w-4 text-orange-500" />
            <h4 className="font-medium text-gray-900 dark:text-white">Request Body</h4>
          </div>
          
          <div className="text-sm text-gray-900 dark:text-white">
            {getBodyDisplay()}
          </div>
          
          {body?.content && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {body.content.length} characters
            </div>
          )}
        </div>

        {/* Environment Variables */}
        {usedVariables.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
              <Key className="h-4 w-4 text-yellow-500" />
              <h4 className="font-medium text-gray-900 dark:text-white">Environment Variables</h4>
            </div>
            
            <div className="space-y-2">
              {usedVariables.map(variableName => (
                <div key={variableName} className="flex items-center justify-between">
                  <span className="text-sm font-mono text-gray-900 dark:text-white">
                    {`{{${variableName}}}`}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {environmentVariables[variableName] || 'Not set'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}