import React, { useState } from 'react'
import { Send, Save, Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { useRequestStore } from '../../stores/requestStore'
import { useEnvironmentStore } from '../../stores/environmentStore'
import { useHistoryStore } from '../../stores/historyStore'
import RequestTabs from '../ui/RequestTabs'

export default function RequestEditor() {
  const { 
    tabs, 
    activeTabId, 
    updateTab, 
    getActiveTab,
    createRequest,
    updateRequest
  } = useRequestStore()
  const { replaceVariables } = useEnvironmentStore()
  const { addToHistory } = useHistoryStore()
  
  const [activeSection, setActiveSection] = useState('params')
  const [loading, setLoading] = useState(false)
  const [showAuthPassword, setShowAuthPassword] = useState(false)

  const activeTab = getActiveTab()

  if (!activeTab) {
    return null
  }

  const handleInputChange = (field, value) => {
    updateTab(activeTabId, { [field]: value })
  }

  const handleKeyValueChange = (type, index, field, value) => {
    const items = { ...activeTab[type] }
    const keys = Object.keys(items)
    const key = keys[index]
    
    if (field === 'key') {
      if (key !== value) {
        delete items[key]
        items[value] = items[key] || ''
      }
    } else {
      items[key] = value
    }
    
    handleInputChange(type, items)
  }

  const addKeyValue = (type) => {
    const items = { ...activeTab[type], '': '' }
    handleInputChange(type, items)
  }

  const removeKeyValue = (type, key) => {
    const items = { ...activeTab[type] }
    delete items[key]
    handleInputChange(type, items)
  }

  const handleSave = async () => {
    if (activeTab.saved && activeTab.id) {
      // Update existing request
      await updateRequest(activeTab.id, {
        name: activeTab.name,
        method: activeTab.method,
        url: activeTab.url,
        headers: activeTab.headers,
        params: activeTab.params,
        body: activeTab.body,
        auth: activeTab.auth
      })
    } else {
      // Create new request
      const requestId = await createRequest({
        name: activeTab.name,
        method: activeTab.method,
        url: activeTab.url,
        headers: activeTab.headers || {},
        params: activeTab.params || {},
        body: activeTab.body || { type: 'none', content: '' },
        auth: activeTab.auth || { type: 'none' },
        workspaceId: activeTab.workspaceId,
        collectionId: activeTab.collectionId,
        folderId: activeTab.folderId
      })
      
      if (requestId) {
        updateTab(activeTabId, { id: requestId, saved: true })
      }
    }
  }

  const handleSendRequest = async () => {
    setLoading(true)
    
    try {
      // Replace environment variables
      const processedUrl = replaceVariables(activeTab.url)
      const processedHeaders = {}
      Object.entries(activeTab.headers || {}).forEach(([key, value]) => {
        processedHeaders[replaceVariables(key)] = replaceVariables(value)
      })
      
      const processedParams = {}
      Object.entries(activeTab.params || {}).forEach(([key, value]) => {
        processedParams[replaceVariables(key)] = replaceVariables(value)
      })

      const config = {
        method: activeTab.method,
        url: processedUrl,
        headers: processedHeaders,
        params: processedParams,
        auth: activeTab.auth,
        body: activeTab.body
      }

      const response = await window.electronAPI.httpRequest(config)

      // Update tab with response
      updateTab(activeTabId, { response })

      // Add to history
      await addToHistory({
        requestId: activeTab.id,
        workspaceId: activeTab.workspaceId,
        name: activeTab.name,
        method: activeTab.method,
        url: processedUrl,
        responseStatus: response.status,
        responseTime: response.time,
        responseSize: response.size,
        responseBody: response.data
      })

    } catch (error) {
      console.error('Request failed:', error)
      updateTab(activeTabId, { 
        response: {
          status: 0,
          statusText: 'Request Failed',
          data: { error: error.message },
          time: 0,
          size: 0,
          error: true
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

  return (
    <div className="h-full flex flex-col">
      {/* Request Tabs */}
      <RequestTabs />

      {/* Request Line */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2 mb-3">
          <input
            type="text"
            placeholder="Request Name"
            value={activeTab.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="px-3 py-1 text-sm bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSave}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-md border border-gray-600 flex items-center space-x-1"
          >
            <Save className="h-3 w-3" />
            <span>Save</span>
          </button>
        </div>

        <div className="flex space-x-2">
          <select
            value={activeTab.method}
            onChange={(e) => handleInputChange('method', e.target.value)}
            className="px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {methods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Enter request URL"
            value={activeTab.url || ''}
            onChange={(e) => handleInputChange('url', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            onClick={handleSendRequest}
            disabled={loading || !activeTab.url}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>{loading ? 'Sending...' : 'Send'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {['params', 'headers', 'body', 'auth'].map(section => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              activeSection === section
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeSection === 'params' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-white">Query Parameters</h3>
              <button
                onClick={() => addKeyValue('params')}
                className="flex items-center space-x-1 text-sm text-blue-400 hover:underline"
              >
                <Plus className="h-3 w-3" />
                <span>Add</span>
              </button>
            </div>
            
            {Object.entries(activeTab.params || {}).map(([key, value], index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Key"
                  value={key}
                  onChange={(e) => handleKeyValueChange('params', index, 'key', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={value}
                  onChange={(e) => handleKeyValueChange('params', index, 'value', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeKeyValue('params', key)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {Object.keys(activeTab.params || {}).length === 0 && (
              <p className="text-sm text-gray-400">No parameters added yet</p>
            )}
          </div>
        )}

        {activeSection === 'headers' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-white">Headers</h3>
              <button
                onClick={() => addKeyValue('headers')}
                className="flex items-center space-x-1 text-sm text-blue-400 hover:underline"
              >
                <Plus className="h-3 w-3" />
                <span>Add</span>
              </button>
            </div>
            
            {Object.entries(activeTab.headers || {}).map(([key, value], index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Header"
                  value={key}
                  onChange={(e) => handleKeyValueChange('headers', index, 'key', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={value}
                  onChange={(e) => handleKeyValueChange('headers', index, 'value', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeKeyValue('headers', key)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {Object.keys(activeTab.headers || {}).length === 0 && (
              <p className="text-sm text-gray-400">No headers added yet</p>
            )}
          </div>
        )}

        {activeSection === 'body' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Request Body</h3>
              <select
                value={activeTab.body?.type || 'none'}
                onChange={(e) => handleInputChange('body', { ...activeTab.body, type: e.target.value })}
                className="px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="json">JSON</option>
                <option value="form">Form Data</option>
                <option value="raw">Raw</option>
              </select>
            </div>
            
            {activeTab.body?.type !== 'none' && (
              <textarea
                placeholder={`Enter ${activeTab.body?.type} data...`}
                value={activeTab.body?.content || ''}
                onChange={(e) => handleInputChange('body', { ...activeTab.body, content: e.target.value })}
                rows={10}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            )}
          </div>
        )}

        {activeSection === 'auth' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Authorization</h3>
              <select
                value={activeTab.auth?.type || 'none'}
                onChange={(e) => handleInputChange('auth', { ...activeTab.auth, type: e.target.value })}
                className="px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
              </select>
            </div>
            
            {activeTab.auth?.type === 'bearer' && (
              <input
                type="text"
                placeholder="Token"
                value={activeTab.auth?.token || ''}
                onChange={(e) => handleInputChange('auth', { ...activeTab.auth, token: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            
            {activeTab.auth?.type === 'basic' && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Username"
                  value={activeTab.auth?.username || ''}
                  onChange={(e) => handleInputChange('auth', { ...activeTab.auth, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="relative">
                  <input
                    type={showAuthPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={activeTab.auth?.password || ''}
                    onChange={(e) => handleInputChange('auth', { ...activeTab.auth, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthPassword(!showAuthPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showAuthPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}