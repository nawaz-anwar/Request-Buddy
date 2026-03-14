import { useState } from 'react'
import { Clock, Search, FileText, Calendar, Filter } from 'lucide-react'
import { useHistoryStore } from '../../stores/historyStore'
import { formatDistanceToNow } from 'date-fns'

export default function HistorySidebar({ onHistorySelect }) {
  const { history } = useHistoryStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const getMethodColor = (method) => {
    const colors = {
      GET: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      POST: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
      PUT: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
      PATCH: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
      DELETE: 'text-red-500 bg-red-100 dark:bg-red-900/30',
      HEAD: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
      OPTIONS: 'text-gray-500 bg-gray-100 dark:bg-gray-900/30'
    }
    return colors[method] || colors.GET
  }



  const getStatusBadgeColor = (status) => {
    if (status >= 200 && status < 300) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    if (status >= 300 && status < 400) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
    if (status >= 400 && status < 500) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
    if (status >= 500) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  }

  const filteredHistory = history.filter(item => {
    const matchesSearch = !searchTerm || 
      item.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.method?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'success' && item.status >= 200 && item.status < 300) ||
      (statusFilter === 'error' && item.status >= 400)
    
    return matchesSearch && matchesStatus
  })

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return formatDistanceToNow(date, { addSuffix: true })
  }

  const formatUrl = (url) => {
    if (!url) return 'Unknown URL'
    try {
      const urlObj = new URL(url)
      return urlObj.pathname + urlObj.search
    } catch {
      return url
    }
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 transition-colors duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              History ({history.length})
            </h2>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="success">Success (2xx)</option>
            <option value="error">Error (4xx, 5xx)</option>
          </select>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">
              {searchTerm || statusFilter !== 'all' ? 'No matching history' : 'No history yet'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter'
                : 'Send some requests to see them here'
              }
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => onHistorySelect(item)}
                className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    {/* Method Badge */}
                    <div className={`px-2 py-1 rounded text-xs font-mono font-medium ${getMethodColor(item.method)}`}>
                      {item.method}
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                      {item.status}
                    </div>
                  </div>
                  
                  {/* Time */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {item.time}ms
                  </div>
                </div>

                {/* URL */}
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {formatUrl(item.url)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {item.url}
                  </p>
                </div>

                {/* Timestamp */}
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3 w-3" />
                  <span>{formatTime(item.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {history.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <FileText className="h-3 w-3" />
            <span>Showing {filteredHistory.length} of {history.length} requests</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            History is automatically saved and cannot be edited
          </p>
        </div>
      )}
    </div>
  )
}