import { useState } from 'react'
import { Plus, Trash2, Eye, EyeOff, Info } from 'lucide-react'

export default function HeadersTab({ headers, onChange }) {
  const [headersList, setHeadersList] = useState(() => {
    // Convert headers object to array format for easier editing
    const entries = Object.entries(headers || {})
    return entries.length > 0 
      ? entries.map(([key, value], index) => ({
          id: index,
          key,
          value: typeof value === 'object' ? value.value || '' : value,
          enabled: typeof value === 'object' ? value.enabled !== false : true,
          description: typeof value === 'object' ? value.description || '' : ''
        }))
      : [{ id: 0, key: '', value: '', enabled: true, description: '' }]
  })

  // Common headers for autocomplete
  const commonHeaders = [
    'Accept',
    'Accept-Encoding',
    'Accept-Language',
    'Authorization',
    'Cache-Control',
    'Content-Type',
    'Content-Length',
    'Cookie',
    'Host',
    'Origin',
    'Referer',
    'User-Agent',
    'X-API-Key',
    'X-Auth-Token',
    'X-Requested-With'
  ]

  const updateHeaders = (newHeadersList) => {
    setHeadersList(newHeadersList)
    
    // Convert back to object format for storage
    const headersObject = {}
    newHeadersList.forEach(header => {
      if (header.key.trim()) {
        headersObject[header.key] = {
          value: header.value,
          enabled: header.enabled,
          description: header.description
        }
      }
    })
    
    onChange(headersObject)
  }

  const addHeader = () => {
    const newHeader = {
      id: Date.now(),
      key: '',
      value: '',
      enabled: true,
      description: ''
    }
    updateHeaders([...headersList, newHeader])
  }

  const removeHeader = (id) => {
    updateHeaders(headersList.filter(header => header.id !== id))
  }

  const updateHeader = (id, field, value) => {
    updateHeaders(
      headersList.map(header =>
        header.id === id ? { ...header, [field]: value } : header
      )
    )
  }

  const toggleHeader = (id) => {
    updateHeaders(
      headersList.map(header =>
        header.id === id ? { ...header, enabled: !header.enabled } : header
      )
    )
  }

  const addCommonHeader = (headerName) => {
    const commonValues = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ',
      'X-API-Key': '',
      'User-Agent': 'Request Buddy/1.0'
    }

    const newHeader = {
      id: Date.now(),
      key: headerName,
      value: commonValues[headerName] || '',
      enabled: true,
      description: ''
    }
    updateHeaders([...headersList, newHeader])
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Headers</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {headersList.filter(h => h.enabled && h.key.trim()).length} enabled
            </span>
          </div>
          <button
            onClick={addHeader}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <Plus className="h-3 w-3" />
            <span>Add</span>
          </button>
        </div>

        {/* Quick Add Common Headers */}
        <div className="flex flex-wrap gap-1">
          {['Content-Type', 'Authorization', 'Accept', 'X-API-Key'].map(header => (
            <button
              key={header}
              onClick={() => addCommonHeader(header)}
              className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
              title={`Add ${header} header`}
            >
              {header}
            </button>
          ))}
        </div>
      </div>

      {/* Headers List */}
      <div className="flex-1 overflow-auto">
        {headersList.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-500 dark:text-gray-400 mb-2">No headers yet</div>
              <button
                onClick={addHeader}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Add your first header
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className="col-span-1"></div>
              <div className="col-span-4">Header</div>
              <div className="col-span-4">Value</div>
              <div className="col-span-2">Description</div>
              <div className="col-span-1"></div>
            </div>

            {/* Header Rows */}
            {headersList.map((header) => (
              <div
                key={header.id}
                className={`grid grid-cols-12 gap-2 items-center py-2 px-2 rounded-md transition-colors ${
                  header.enabled ? 'bg-gray-50 dark:bg-gray-750' : 'bg-gray-100 dark:bg-gray-800 opacity-60'
                }`}
              >
                {/* Enable/Disable Toggle */}
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => toggleHeader(header.id)}
                    className={`p-1 rounded transition-colors ${
                      header.enabled
                        ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300'
                        : 'text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400'
                    }`}
                    title={header.enabled ? 'Disable header' : 'Enable header'}
                  >
                    {header.enabled ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Header Name Input */}
                <div className="col-span-4">
                  <input
                    type="text"
                    placeholder="Header name"
                    value={header.key}
                    onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                    list={`headers-${header.id}`}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <datalist id={`headers-${header.id}`}>
                    {commonHeaders.map(h => (
                      <option key={h} value={h} />
                    ))}
                  </datalist>
                </div>

                {/* Header Value Input */}
                <div className="col-span-4">
                  <input
                    type="text"
                    placeholder="Header value"
                    value={header.value}
                    onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Description Input */}
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Description"
                    value={header.description}
                    onChange={(e) => updateHeader(header.id, 'description', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Delete Button */}
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => removeHeader(header.id)}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    title="Remove header"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add New Row */}
            <div className="pt-2">
              <button
                onClick={addHeader}
                className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-sm"
              >
                Add header
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
        <div className="flex items-start space-x-2">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <div className="mb-1">Common headers are auto-suggested as you type.</div>
            <div>Use the toggle to temporarily disable headers without deleting them.</div>
          </div>
        </div>
      </div>
    </div>
  )
}