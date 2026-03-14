import React, { useState } from 'react'
import { Copy, Download, Eye, Code } from 'lucide-react'
import { useRequestStore } from '../../stores/requestStore'

export default function ResponseViewer() {
  const { getActiveTab } = useRequestStore()
  const [activeTab, setActiveTab] = useState('body')
  const [viewMode, setViewMode] = useState('formatted')

  const activeRequest = getActiveTab()
  const response = activeRequest?.response

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-green-400'
    if (status >= 300 && status < 400) return 'text-yellow-400'
    if (status >= 400 && status < 500) return 'text-orange-400'
    if (status >= 500) return 'text-red-400'
    return 'text-gray-400'
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatJson = (data) => {
    try {
      if (typeof data === 'string') {
        return JSON.stringify(JSON.parse(data), null, 2)
      }
      return JSON.stringify(data, null, 2)
    } catch {
      return String(data)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const downloadResponse = () => {
    if (!response) return
    
    const blob = new Blob([formatJson(response.data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'response.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!response) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-800">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
            <Code className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            No Response Yet
          </h3>
          <p className="text-gray-400">
            Send a request to see the response here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Response Status */}
      <div className="p-4 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Status:</span>
              <span className={`font-medium ${getStatusColor(response.status)}`}>
                {response.status} {response.statusText}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Time:</span>
              <span className="font-medium text-white">
                {response.time}ms
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Size:</span>
              <span className="font-medium text-white">
                {formatBytes(response.size)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'formatted' ? 'raw' : 'formatted')}
              className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-600 rounded-md hover:bg-gray-700 transition-colors text-gray-300"
            >
              <Eye className="h-3 w-3" />
              <span>{viewMode === 'formatted' ? 'Raw' : 'Formatted'}</span>
            </button>
            
            <button
              onClick={() => copyToClipboard(formatJson(response.data))}
              className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-600 rounded-md hover:bg-gray-700 transition-colors text-gray-300"
            >
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </button>
            
            <button
              onClick={downloadResponse}
              className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-600 rounded-md hover:bg-gray-700 transition-colors text-gray-300"
            >
              <Download className="h-3 w-3" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Response Tabs */}
      <div className="flex border-b border-gray-700">
        {['body', 'headers'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Response Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'body' && (
          <div className="p-4">
            <pre className="bg-gray-900 p-4 rounded-md overflow-auto text-sm font-mono whitespace-pre-wrap text-gray-300">
              {viewMode === 'formatted' 
                ? formatJson(response.data)
                : JSON.stringify(response.data)
              }
            </pre>
          </div>
        )}

        {activeTab === 'headers' && (
          <div className="p-4">
            <div className="space-y-2">
              {Object.entries(response.headers || {}).map(([key, value]) => (
                <div key={key} className="flex">
                  <div className="w-1/3 font-medium text-white pr-4">
                    {key}:
                  </div>
                  <div className="w-2/3 text-gray-400 font-mono text-sm">
                    {String(value)}
                  </div>
                </div>
              ))}
              
              {Object.keys(response.headers || {}).length === 0 && (
                <p className="text-sm text-gray-400">No headers received</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}