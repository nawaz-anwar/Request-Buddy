import { useState, useEffect, useCallback } from 'react'
import { Send, Save } from 'lucide-react'
import { useRequestStore } from '../../stores/requestStore'
import ParamsTab from './ParamsTab'
import HeadersTab from './HeadersTab'
import BodyTab from './BodyTab'
import AuthTab from './AuthTab'
import VariableHint from '../environments/VariableHint'
import AIButton from '../ai/AIButton'
import AIResultPanel from '../ai/AIResultPanel'
import DebugAIModal from '../ai/DebugAIModal'
import SimpleAIButton from '../ai/SimpleAIButton'
import CompactAIButton from '../ai/CompactAIButton'

export default function RequestEditor({ 
  request, 
  onSendRequest, 
  onSave, 
  response, 
  showRightSidebar, 
  onToggleRightSidebar 
}) {
  const { updateRequest } = useRequestStore()
  const [activeTab, setActiveTab] = useState('params')
  const [loading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aiResult, setAIResult] = useState(null)
  const [aiAction, setAIAction] = useState(null)
  const [showDebugAI, setShowDebugAI] = useState(false)

  // Auto-save to Firestore on changes
  const autoSave = useCallback(async (updates) => {
    if (request?.id) {
      try {
        await updateRequest(request.id, updates)
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }
  }, [request?.id, updateRequest])

  // Debounced auto-save
  const [saveTimeout, setSaveTimeout] = useState(null)
  const debouncedAutoSave = useCallback((updates) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    const timeout = setTimeout(() => {
      autoSave(updates)
    }, 1000) // Save after 1 second of inactivity
    setSaveTimeout(timeout)
  }, [autoSave, saveTimeout])

  // Handle field changes
  const handleFieldChange = (field, value) => {
    if (request?.onChange) {
      request.onChange({ [field]: value })
    }
    debouncedAutoSave({ [field]: value })
  }

  // Handle save functionality
  const handleSave = async () => {
    if (onSave && request?.id) {
      setSaving(true)
      try {
        await onSave()
      } catch (error) {
        console.error('Save failed:', error)
      } finally {
        setSaving(false)
      }
    }
  }

  // Handle AI result
  const handleAIResult = (result, action) => {
    setAIResult(result)
    setAIAction(action)
  }

  // Close AI result panel
  const closeAIResult = () => {
    setAIResult(null)
    setAIAction(null)
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        if (request?.url && onSendRequest) {
          onSendRequest()
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [request?.url, onSendRequest, onSave])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }
    }
  }, [saveTimeout])

  if (!request) {
    console.log('RequestEditor: No request object provided')
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
            <Send className="h-6 w-6 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Request Selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Select a request from the sidebar or create a new one
          </p>
        </div>
      </div>
    )
  }

  // Debug logging
  console.log('RequestEditor: Rendering with request:', {
    id: request.id,
    name: request.name,
    method: request.method,
    url: request.url,
    hasHeaders: !!request.headers,
    hasParams: !!request.params,
    hasBody: !!request.body,
    hasAuth: !!request.auth
  })

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

  console.log("REQUEST HEADER RENDERED - RequestEditor.jsx")

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 transition-colors duration-300">
      {/* Request Name and Actions */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Request Name"
            value={request.name || ''}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
          />
          
          {/* AI Assistant Button - TEMPORARILY REMOVED FOR DEBUG */}
          
          {/* Save Button */}
          {onSave && (
            <button
              onClick={handleSave}
              disabled={saving || !request.hasUnsavedChanges}
              className="flex items-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-50 dark:disabled:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:text-gray-400 dark:disabled:text-gray-500 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
              title={request.hasUnsavedChanges ? 'Save changes (Cmd+S)' : 'No changes to save'}
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="text-sm">{saving ? 'Saving...' : 'Save'}</span>
              {request.hasUnsavedChanges && (
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Method and URL */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-3">
          <select
            value={request.method || 'GET'}
            onChange={(e) => handleFieldChange('method', e.target.value)}
            className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all duration-200"
          >
            {methods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Enter request URL (e.g., https://api.example.com/users)"
            value={request.url || ''}
            onChange={(e) => handleFieldChange('url', e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
          
          {/* Action Buttons Group */}
          <div className="flex items-center space-x-2">
            {/* Send Button */}
            <button
              onClick={() => {
                console.log('Send button clicked with request:', request)
                if (onSendRequest) {
                  onSendRequest()
                } else {
                  console.error('onSendRequest is not defined')
                }
              }}
              disabled={loading || !request.url}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg transition-all duration-200"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>{loading ? 'Sending...' : 'Send'}</span>
            </button>
            
            {/* AI Assistant Button */}
            <CompactAIButton
              request={request}
              response={response}
              onAIAction={(actionId, req, res) => {
                console.log("AI Action triggered:", actionId)
                // Open right sidebar and show AI content
                if (!showRightSidebar && onToggleRightSidebar) {
                  onToggleRightSidebar()
                }
                setAIResult(`AI Action: ${actionId}\n\nThis would normally call the Gemini API and return results.\n\nRequest: ${req?.method} ${req?.url}\nResponse Status: ${res?.status || 'No response yet'}`)
                setAIAction(actionId)
              }}
            />
            
            {/* Right Sidebar Toggle */}
            <button
              onClick={onToggleRightSidebar}
              className={`p-3 rounded-lg font-medium transition-all duration-200 ${
                showRightSidebar
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Toggle Utilities Panel"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Variable hint for URL */}
        <VariableHint text={request.url} />
        
        {/* Keyboard shortcut hint */}
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-750 px-3 py-2 rounded-lg">
          💡 Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">Cmd+Enter</kbd> (Mac) or <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">Ctrl+Enter</kbd> (Windows) to send
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
        {['params', 'headers', 'body', 'auth'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-sm font-medium capitalize relative transition-all duration-200 ${
              activeTab === tab
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-800'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {tab}
            {/* Show count badges */}
            {tab === 'params' && request.params && Object.keys(request.params).length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                {Object.keys(request.params).length}
              </span>
            )}
            {tab === 'headers' && request.headers && Object.keys(request.headers).length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                {Object.keys(request.headers).length}
              </span>
            )}
            {tab === 'auth' && request.auth && request.auth.type !== 'none' && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-600 text-white rounded-full">
                {request.auth.type}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'params' && (
          <ParamsTab
            params={request.params || {}}
            onChange={(params) => handleFieldChange('params', params)}
          />
        )}
        
        {activeTab === 'headers' && (
          <HeadersTab
            headers={request.headers || {}}
            onChange={(headers) => handleFieldChange('headers', headers)}
          />
        )}
        
        {activeTab === 'body' && (
          <BodyTab
            method={request.method || 'GET'}
            body={request.body || { type: 'none', content: '' }}
            onChange={(body) => handleFieldChange('body', body)}
          />
        )}
        
        {activeTab === 'auth' && (
          <AuthTab
            auth={request.auth || { type: 'none', bearerToken: '', basic: { username: '', password: '' } }}
            onChange={(auth) => handleFieldChange('auth', auth)}
          />
        )}
      </div>

      {/* AI Result Panel */}
      {aiResult && (
        <AIResultPanel
          result={aiResult}
          action={aiAction}
          onClose={closeAIResult}
        />
      )}

      {/* DEBUG AI Modal */}
      <DebugAIModal
        isOpen={showDebugAI}
        onClose={() => setShowDebugAI(false)}
        result="AI button clicked successfully! Modal is working."
      />
    </div>
  )
}