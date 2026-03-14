import { useState, useRef } from 'react'
import { Upload, FileText, Code, Type, Info } from 'lucide-react'

export default function BodyTab({ method, body, onChange }) {
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState(() => {
    if (body?.type === 'form-data' && body.data) {
      return Object.entries(body.data).map(([key, value], index) => ({
        id: index,
        key,
        value: value.value || '',
        type: value.type || 'text',
        enabled: value.enabled !== false,
        file: value.file || null
      }))
    }
    return [{ id: 0, key: '', value: '', type: 'text', enabled: true, file: null }]
  })

  // Disable body for GET requests
  const isBodyDisabled = method === 'GET' || method === 'HEAD'

  const bodyTypes = [
    { value: 'none', label: 'None', icon: null },
    { value: 'json', label: 'JSON', icon: Code },
    { value: 'raw', label: 'Raw Text', icon: Type },
    { value: 'form-data', label: 'Form Data', icon: FileText }
  ]

  const handleBodyTypeChange = (type) => {
    let newBody = { type, content: '' }
    
    if (type === 'json') {
      newBody.content = body?.content || '{\n  \n}'
    } else if (type === 'form-data') {
      newBody.data = {}
      formData.forEach(item => {
        if (item.key.trim()) {
          newBody.data[item.key] = {
            value: item.value,
            type: item.type,
            enabled: item.enabled,
            file: item.file
          }
        }
      })
    } else {
      newBody.content = body?.content || ''
    }
    
    onChange(newBody)
  }

  const handleContentChange = (content) => {
    onChange({ ...body, content })
  }

  const handleFormDataChange = (newFormData) => {
    setFormData(newFormData)
    
    const data = {}
    newFormData.forEach(item => {
      if (item.key.trim()) {
        data[item.key] = {
          value: item.value,
          type: item.type,
          enabled: item.enabled,
          file: item.file
        }
      }
    })
    
    onChange({ ...body, data })
  }

  const addFormDataItem = () => {
    const newItem = {
      id: Date.now(),
      key: '',
      value: '',
      type: 'text',
      enabled: true,
      file: null
    }
    handleFormDataChange([...formData, newItem])
  }

  const removeFormDataItem = (id) => {
    handleFormDataChange(formData.filter(item => item.id !== id))
  }

  const updateFormDataItem = (id, field, value) => {
    handleFormDataChange(
      formData.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const handleFileSelect = (id, file) => {
    updateFormDataItem(id, 'file', file)
    updateFormDataItem(id, 'value', file ? file.name : '')
  }

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(body.content || '{}')
      const formatted = JSON.stringify(parsed, null, 2)
      handleContentChange(formatted)
    } catch (error) {
      // Invalid JSON, don't format
    }
  }

  if (isBodyDisabled) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
            <Info className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Body Not Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {method} requests cannot have a request body
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Body Type Selector */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-1">
          {bodyTypes.map(type => {
            const Icon = type.icon
            return (
              <button
                key={type.value}
                onClick={() => handleBodyTypeChange(type.value)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors ${
                  body?.type === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{type.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-hidden">
        {body?.type === 'none' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-500 dark:text-gray-400 mb-2">No body content</div>
              <p className="text-xs text-gray-600 dark:text-gray-500">
                Select a body type above to add content
              </p>
            </div>
          </div>
        )}

        {body?.type === 'json' && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">JSON Content</div>
              <button
                onClick={formatJSON}
                className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
              >
                Format JSON
              </button>
            </div>
            <div className="flex-1 p-4">
              <textarea
                value={body.content || ''}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder='{\n  "key": "value"\n}'
                className="w-full h-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
              />
            </div>
          </div>
        )}

        {body?.type === 'raw' && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">Raw Text Content</div>
            </div>
            <div className="flex-1 p-4">
              <textarea
                value={body.content || ''}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Enter raw text content..."
                className="w-full h-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
              />
            </div>
          </div>
        )}

        {body?.type === 'form-data' && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">Form Data</div>
              <button
                onClick={addFormDataItem}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <Upload className="h-3 w-3" />
                <span>Add Field</span>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {formData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-gray-500 dark:text-gray-400 mb-2">No form fields yet</div>
                    <button
                      onClick={addFormDataItem}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Add your first field
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Header Row */}
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="col-span-1"></div>
                    <div className="col-span-3">Key</div>
                    <div className="col-span-1">Type</div>
                    <div className="col-span-6">Value</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Form Data Rows */}
                  {formData.map((item) => (
                    <div
                      key={item.id}
                      className={`grid grid-cols-12 gap-2 items-center py-2 px-2 rounded-md transition-colors ${
                        item.enabled ? 'bg-gray-50 dark:bg-gray-750' : 'bg-gray-100 dark:bg-gray-800 opacity-60'
                      }`}
                    >
                      {/* Enable/Disable Toggle */}
                      <div className="col-span-1 flex justify-center">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={(e) => updateFormDataItem(item.id, 'enabled', e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      {/* Key Input */}
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Field name"
                          value={item.key}
                          onChange={(e) => updateFormDataItem(item.id, 'key', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Type Selector */}
                      <div className="col-span-1">
                        <select
                          value={item.type}
                          onChange={(e) => updateFormDataItem(item.id, 'type', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="text">Text</option>
                          <option value="file">File</option>
                        </select>
                      </div>

                      {/* Value Input */}
                      <div className="col-span-6">
                        {item.type === 'file' ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={(e) => handleFileSelect(item.id, e.target.files[0])}
                              className="hidden"
                            />
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-white transition-colors"
                            >
                              <Upload className="h-4 w-4" />
                              <span>Choose File</span>
                            </button>
                            {item.file && (
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                {item.file.name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <input
                            type="text"
                            placeholder="Field value"
                            value={item.value}
                            onChange={(e) => updateFormDataItem(item.id, 'value', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        )}
                      </div>

                      {/* Delete Button */}
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => removeFormDataItem(item.id)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          title="Remove field"
                        >
                          <Upload className="h-4 w-4 rotate-180" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add New Row */}
                  <div className="pt-2">
                    <button
                      onClick={addFormDataItem}
                      className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-sm"
                    >
                      Add form field
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}