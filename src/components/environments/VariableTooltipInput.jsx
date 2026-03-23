import { useState, useRef, useEffect } from 'react'
import { Globe, X } from 'lucide-react'
import { useEnvironmentStore } from '../../stores/environmentStore'
import { findVariables } from '../../utils/variableUtils'

/**
 * Input component with variable indicator and popover
 * Replaces the large VariableHint panel with Postman-style compact behavior
 */
export default function VariableTooltipInput({ 
  value, 
  onChange, 
  placeholder,
  className = ''
}) {
  const { currentEnvironment } = useEnvironmentStore()
  const [showPopover, setShowPopover] = useState(false)
  const popoverRef = useRef(null)

  // Detect variables in the value
  const variables = findVariables(value || '')
  const hasVariables = variables.length > 0

  // Get variable info
  const getVariableInfo = () => {
    if (!currentEnvironment || !hasVariables) return []
    
    return variables.map(varName => ({
      name: varName,
      value: currentEnvironment.variables?.[varName],
      found: varName in (currentEnvironment.variables || {})
    }))
  }

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowPopover(false)
      }
    }

    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPopover])

  const variableInfo = getVariableInfo()
  const hasMissingVars = variableInfo.some(v => !v.found)

  // Remove flex-1 from className since the wrapper div already has it
  const inputClassName = className.replace(/\bflex-1\b/g, '').trim()

  return (
    <div className="relative flex-1 min-w-0">
      <input
        type="text"
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${inputClassName} ${hasVariables ? 'pr-10' : ''}`}
        title={hasVariables ? 'Contains environment variables - click the globe icon to view' : ''}
      />
      
      {/* Variable Indicator */}
      {hasVariables && (
        <button
          onClick={() => setShowPopover(!showPopover)}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${
            hasMissingVars
              ? 'text-orange-500 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/20'
              : 'text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20'
          }`}
          title={hasMissingVars ? 'Some variables are missing' : 'View variables'}
        >
          <Globe className="h-4 w-4" />
        </button>
      )}

      {/* Variable Popover */}
      {showPopover && variableInfo.length > 0 && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Variables in {currentEnvironment?.name}
              </span>
            </div>
            <button
              onClick={() => setShowPopover(false)}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Variable List */}
          <div className="p-3 max-h-80 overflow-y-auto">
            <div className="space-y-2">
              {variableInfo.map((varInfo, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md ${
                    varInfo.found
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <code className={`text-xs font-semibold ${
                          varInfo.found
                            ? 'text-green-700 dark:text-green-400'
                            : 'text-orange-700 dark:text-orange-400'
                        }`}>
                          {`{{${varInfo.name}}}`}
                        </code>
                        <span className={`text-xs ${
                          varInfo.found ? 'text-green-600 dark:text-green-500' : 'text-orange-600 dark:text-orange-500'
                        }`}>
                          {varInfo.found ? '✓' : '⚠'}
                        </span>
                      </div>
                      {varInfo.found ? (
                        <div className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all bg-white dark:bg-gray-900/50 px-2 py-1 rounded">
                          {varInfo.value}
                        </div>
                      ) : (
                        <div className="text-xs text-orange-600 dark:text-orange-400">
                          Not defined in current environment
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {variableInfo.filter(v => v.found).length} of {variableInfo.length} variables resolved
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
