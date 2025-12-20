import { useState } from 'react'
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react'

export default function ParamsTab({ params, onChange }) {
  const [paramsList, setParamsList] = useState(() => {
    // Convert params object to array format for easier editing
    const entries = Object.entries(params || {})
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

  const updateParams = (newParamsList) => {
    setParamsList(newParamsList)
    
    // Convert back to object format for storage
    const paramsObject = {}
    newParamsList.forEach(param => {
      if (param.key.trim()) {
        paramsObject[param.key] = {
          value: param.value,
          enabled: param.enabled,
          description: param.description
        }
      }
    })
    
    onChange(paramsObject)
  }

  const addParam = () => {
    const newParam = {
      id: Date.now(),
      key: '',
      value: '',
      enabled: true,
      description: ''
    }
    updateParams([...paramsList, newParam])
  }

  const removeParam = (id) => {
    updateParams(paramsList.filter(param => param.id !== id))
  }

  const updateParam = (id, field, value) => {
    updateParams(
      paramsList.map(param =>
        param.id === id ? { ...param, [field]: value } : param
      )
    )
  }

  const toggleParam = (id) => {
    updateParams(
      paramsList.map(param =>
        param.id === id ? { ...param, enabled: !param.enabled } : param
      )
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Query Parameters</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {paramsList.filter(p => p.enabled && p.key.trim()).length} enabled
          </span>
        </div>
        <button
          onClick={addParam}
          className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          <Plus className="h-3 w-3" />
          <span>Add</span>
        </button>
      </div>

      {/* Parameters List */}
      <div className="flex-1 overflow-auto">
        {paramsList.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-500 dark:text-gray-400 mb-2">No parameters yet</div>
              <button
                onClick={addParam}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Add your first parameter
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className="col-span-1"></div>
              <div className="col-span-4">Key</div>
              <div className="col-span-4">Value</div>
              <div className="col-span-2">Description</div>
              <div className="col-span-1"></div>
            </div>

            {/* Parameter Rows */}
            {paramsList.map((param) => (
              <div
                key={param.id}
                className={`grid grid-cols-12 gap-2 items-center py-2 px-2 rounded-md transition-colors ${
                  param.enabled ? 'bg-gray-50 dark:bg-gray-750' : 'bg-gray-100 dark:bg-gray-800 opacity-60'
                }`}
              >
                {/* Enable/Disable Toggle */}
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => toggleParam(param.id)}
                    className={`p-1 rounded transition-colors ${
                      param.enabled
                        ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300'
                        : 'text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400'
                    }`}
                    title={param.enabled ? 'Disable parameter' : 'Enable parameter'}
                  >
                    {param.enabled ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Key Input */}
                <div className="col-span-4">
                  <input
                    type="text"
                    placeholder="Parameter name"
                    value={param.key}
                    onChange={(e) => updateParam(param.id, 'key', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Value Input */}
                <div className="col-span-4">
                  <input
                    type="text"
                    placeholder="Parameter value"
                    value={param.value}
                    onChange={(e) => updateParam(param.id, 'value', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Description Input */}
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Description"
                    value={param.description}
                    onChange={(e) => updateParam(param.id, 'description', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Delete Button */}
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => removeParam(param.id)}
                    className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                    title="Remove parameter"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add New Row */}
            <div className="pt-2">
              <button
                onClick={addParam}
                className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-sm"
              >
                Add parameter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* URL Preview */}
      {paramsList.some(p => p.enabled && p.key.trim()) && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">URL Preview:</div>
          <div className="text-sm text-gray-800 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600">
            ?{paramsList
              .filter(p => p.enabled && p.key.trim())
              .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
              .join('&')
            }
          </div>
        </div>
      )}
    </div>
  )
}