import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Save, Globe, Eye, EyeOff } from 'lucide-react'
import { useEnvironmentStore } from '../../stores/environmentStore'
import { useAuthStore } from '../../stores/authStore'

export default function EnvironmentModal({ environment, onClose }) {
  const { user } = useAuthStore()
  const { 
    environments,
    createEnvironment, 
    updateEnvironment, 
    deleteEnvironment,
    currentEnvironment,
    setCurrentEnvironment
  } = useEnvironmentStore()
  
  const [name, setName] = useState('')
  const [variables, setVariables] = useState([])
  const [loading, setLoading] = useState(false)
  const [showValues, setShowValues] = useState({})

  const isEditing = environment && environment !== 'manage'
  const isManaging = environment === 'manage'

  useEffect(() => {
    if (isEditing) {
      setName(environment.name || '')
      const vars = Object.entries(environment.variables || {}).map(([key, value], index) => ({
        id: index,
        key,
        value,
        enabled: true
      }))
      setVariables(vars.length > 0 ? vars : [{ id: 0, key: '', value: '', enabled: true }])
    } else if (!isManaging) {
      setVariables([{ id: 0, key: '', value: '', enabled: true }])
    }
  }, [environment, isEditing])

  const addVariable = () => {
    const newVar = {
      id: Date.now(),
      key: '',
      value: '',
      enabled: true
    }
    setVariables([...variables, newVar])
  }

  const removeVariable = (id) => {
    setVariables(variables.filter(v => v.id !== id))
  }

  const updateVariable = (id, field, value) => {
    setVariables(variables.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ))
  }

  const toggleShowValue = (id) => {
    setShowValues(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Environment name is required')
      return
    }

    setLoading(true)
    try {
      const variablesObject = {}
      variables.forEach(v => {
        if (v.key.trim() && v.enabled) {
          variablesObject[v.key.trim()] = v.value
        }
      })

      if (isEditing) {
        await updateEnvironment(environment.id, {
          name: name.trim(),
          variables: variablesObject
        })
      } else {
        await createEnvironment(name.trim(), variablesObject, user.uid)
      }
      
      onClose()
    } catch (error) {
      console.error('Failed to save environment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (envId) => {
    if (!confirm('Are you sure you want to delete this environment?')) return
    
    try {
      await deleteEnvironment(envId)
    } catch (error) {
      console.error('Failed to delete environment:', error)
    }
  }

  const handleSetCurrent = (env) => {
    setCurrentEnvironment(env)
  }

  if (isManaging) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Manage Environments</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {environments.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <p className="text-gray-400 mb-4">No environments created yet</p>
                <button
                  onClick={() => {
                    onClose()
                    // Trigger create new environment
                    setTimeout(() => {
                      const event = new CustomEvent('create-environment')
                      window.dispatchEvent(event)
                    }, 100)
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Create First Environment
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {environments.map(env => (
                  <div
                    key={env.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      currentEnvironment?.id === env.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 bg-gray-750'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-blue-400" />
                        <h3 className="font-medium text-white">{env.name}</h3>
                        {currentEnvironment?.id === env.id && (
                          <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {currentEnvironment?.id !== env.id && (
                          <button
                            onClick={() => handleSetCurrent(env)}
                            className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                          >
                            Set Active
                          </button>
                        )}
                        <button
                          onClick={() => {
                            onClose()
                            setTimeout(() => {
                              const event = new CustomEvent('edit-environment', { detail: env })
                              window.dispatchEvent(event)
                            }, 100)
                          }}
                          className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(env.id)}
                          className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {Object.keys(env.variables || {}).length} variables
                    </div>
                    {Object.keys(env.variables || {}).length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        Variables: {Object.keys(env.variables).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {isEditing ? 'Edit Environment' : 'Create Environment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Environment Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Environment Name
            </label>
            <input
              type="text"
              placeholder="e.g., Development, Staging, Production"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Variables */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-white">
                Variables
              </label>
              <button
                onClick={addVariable}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>Add Variable</span>
              </button>
            </div>

            {variables.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
                <p className="text-gray-400 mb-2">No variables yet</p>
                <button
                  onClick={addVariable}
                  className="text-sm text-blue-400 hover:underline"
                >
                  Add your first variable
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Header */}
                <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-400 pb-2 border-b border-gray-700">
                  <div className="col-span-1"></div>
                  <div className="col-span-4">Variable Name</div>
                  <div className="col-span-6">Value</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Variables */}
                {variables.map((variable) => (
                  <div key={variable.id} className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-1 flex justify-center">
                      <input
                        type="checkbox"
                        checked={variable.enabled}
                        onChange={(e) => updateVariable(variable.id, 'enabled', e.target.checked)}
                        className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Variable name"
                        value={variable.key}
                        onChange={(e) => updateVariable(variable.id, 'key', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="col-span-6 relative">
                      <input
                        type={showValues[variable.id] ? 'text' : 'password'}
                        placeholder="Variable value"
                        value={variable.value}
                        onChange={(e) => updateVariable(variable.id, 'value', e.target.value)}
                        className="w-full px-3 py-2 pr-10 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowValue(variable.id)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                      >
                        {showValues[variable.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => removeVariable(variable.id)}
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                        title="Remove variable"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Variable Button */}
                <button
                  onClick={addVariable}
                  className="w-full py-3 border-2 border-dashed border-gray-600 rounded-md text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors text-sm"
                >
                  Add variable
                </button>
              </div>
            )}
          </div>

          {/* Usage Info */}
          <div className="bg-gray-750 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">Usage</h4>
            <p className="text-xs text-gray-400 mb-2">
              Use variables in your requests with double curly braces:
            </p>
            <div className="space-y-1 text-xs font-mono">
              <div className="text-gray-300">URL: <span className="text-blue-400">{'{{baseUrl}}'}/api/users</span></div>
              <div className="text-gray-300">Header: <span className="text-blue-400">Authorization: Bearer {'{{token}}'}</span></div>
              <div className="text-gray-300">Body: <span className="text-blue-400">{'{"apiKey": "{{apiKey}}"}'}</span></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !name.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md transition-colors disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{loading ? 'Saving...' : 'Save Environment'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}