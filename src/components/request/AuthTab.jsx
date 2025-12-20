import { useState, useEffect } from 'react'
import { Key, User, Eye, EyeOff, Info } from 'lucide-react'

export default function AuthTab({ auth, onChange }) {
  const [showPassword, setShowPassword] = useState(false)
  
  // Initialize auth object if not provided
  const currentAuth = auth || {
    type: 'none',
    bearerToken: '',
    basic: { username: '', password: '' }
  }

  const authTypes = [
    { value: 'none', label: 'No Auth', icon: null },
    { value: 'bearer', label: 'Bearer Token', icon: Key },
    { value: 'basic', label: 'Basic Auth', icon: User }
  ]

  const handleAuthTypeChange = (type) => {
    const newAuth = {
      type,
      bearerToken: type === 'bearer' ? currentAuth.bearerToken : '',
      basic: type === 'basic' ? currentAuth.basic : { username: '', password: '' }
    }
    onChange(newAuth)
  }

  const handleBearerTokenChange = (token) => {
    onChange({
      ...currentAuth,
      bearerToken: token
    })
  }

  const handleBasicAuthChange = (field, value) => {
    onChange({
      ...currentAuth,
      basic: {
        ...currentAuth.basic,
        [field]: value
      }
    })
  }

  // Generate preview of what will be sent in headers
  const getAuthPreview = () => {
    if (currentAuth.type === 'bearer' && currentAuth.bearerToken) {
      return `Authorization: Bearer ${currentAuth.bearerToken}`
    } else if (currentAuth.type === 'basic' && currentAuth.basic.username) {
      const credentials = `${currentAuth.basic.username}:${currentAuth.basic.password || ''}`
      const encoded = btoa(credentials)
      return `Authorization: Basic ${encoded}`
    }
    return null
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Auth Type Selector */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Authentication Type</h3>
          <div className="flex flex-col space-y-2">
            {authTypes.map(type => {
              const Icon = type.icon
              return (
                <label
                  key={type.value}
                  className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer transition-colors ${
                    currentAuth.type === type.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="authType"
                    value={type.value}
                    checked={currentAuth.type === type.value}
                    onChange={(e) => handleAuthTypeChange(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-2">
                    {Icon && <Icon className="h-4 w-4" />}
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      </div>

      {/* Auth Configuration */}
      <div className="flex-1 overflow-auto">
        {currentAuth.type === 'none' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <Info className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Authentication
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This request will be sent without authentication headers
              </p>
            </div>
          </div>
        )}

        {currentAuth.type === 'bearer' && (
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Bearer Token
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your bearer token"
                  value={currentAuth.bearerToken}
                  onChange={(e) => handleBearerTokenChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Key className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                The token will be sent as: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">Authorization: Bearer &lt;token&gt;</code>
              </p>
            </div>

            {/* Token Info */}
            <div className="bg-gray-100 dark:bg-gray-750 p-3 rounded-md">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <div className="mb-1">Bearer tokens are commonly used for:</div>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>JWT (JSON Web Tokens)</li>
                    <li>OAuth 2.0 access tokens</li>
                    <li>API keys that require Bearer prefix</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentAuth.type === 'basic' && (
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={currentAuth.basic.username}
                    onChange={(e) => handleBasicAuthChange('username', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={currentAuth.basic.password}
                    onChange={(e) => handleBasicAuthChange('password', e.target.value)}
                    className="w-full px-3 py-2 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400">
                Credentials will be base64 encoded and sent as: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">Authorization: Basic &lt;encoded&gt;</code>
              </p>
            </div>

            {/* Basic Auth Info */}
            <div className="mt-4 bg-gray-100 dark:bg-gray-750 p-3 rounded-md">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <div className="mb-1">Basic Authentication:</div>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Username and password are combined as "username:password"</li>
                    <li>The string is then base64 encoded</li>
                    <li>Sent in the Authorization header with "Basic " prefix</li>
                    <li>Commonly used for simple API authentication</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth Preview */}
      {getAuthPreview() && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Header Preview:</div>
          <div className="text-sm text-gray-800 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600 break-all">
            {getAuthPreview()}
          </div>
        </div>
      )}
    </div>
  )
}