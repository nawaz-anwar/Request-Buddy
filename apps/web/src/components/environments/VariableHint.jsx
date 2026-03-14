import React, { useState } from 'react'
import { Info, Globe, X, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { useEnvironmentStore } from '../../stores/environmentStore'
import { findVariables, getMissingVariables, resolveVariables } from '../../utils/resolveVariables'

export default function VariableHint({ text, onResolve }) {
  const { currentEnvironment } = useEnvironmentStore()
  const [isVisible, setIsVisible] = useState(() => {
    // Check localStorage for visibility preference
    const saved = localStorage.getItem('requestBuddy_showVariableHints')
    return saved !== 'false' // Default to true
  })
  const [isDismissed, setIsDismissed] = useState(false)
  
  if (!text || !currentEnvironment || !isVisible || isDismissed) return null
  
  // Find variables in the text
  const variables = findVariables(text)
  
  if (variables.length === 0) return null
  
  const envVars = currentEnvironment.variables || {}
  const missingVars = getMissingVariables(text, envVars)
  const foundVars = variables.filter(v => v in envVars)
  const resolvedText = resolveVariables(text, envVars)
  
  const handleToggleVisibility = () => {
    const newValue = !isVisible
    setIsVisible(newValue)
    localStorage.setItem('requestBuddy_showVariableHints', String(newValue))
  }
  
  const handleDismiss = () => {
    setIsDismissed(true)
  }
  
  const handleApplyResolved = () => {
    if (onResolve && missingVars.length === 0) {
      onResolve(resolvedText)
    }
  }
  
  const hasAllVariables = missingVars.length === 0
  
  return (
    <div className={`mt-2 p-3 rounded-lg border ${
      hasAllVariables 
        ? 'bg-green-900/20 border-green-600/30' 
        : 'bg-yellow-900/20 border-yellow-600/30'
    }`}>
      <div className="flex items-start space-x-2">
        {hasAllVariables ? (
          <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
        ) : (
          <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-gray-300">
              Environment: {currentEnvironment.name}
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 text-gray-400 hover:text-gray-300 rounded transition-colors"
              title="Dismiss hint"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          
          {foundVars.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-green-400 mb-1.5 font-medium">✓ Available Variables:</div>
              <div className="flex flex-wrap gap-1.5">
                {foundVars.map(variable => (
                  <div
                    key={variable}
                    className="group relative"
                  >
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-green-600/20 text-green-300 rounded border border-green-600/30 cursor-help">
                      <span className="font-mono">{variable}</span>
                      <span className="mx-1 text-green-500">→</span>
                      <span className="font-medium">{envVars[variable]}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {missingVars.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-red-400 mb-1.5 font-medium">⚠ Missing Variables:</div>
              <div className="flex flex-wrap gap-1.5">
                {missingVars.map(variable => (
                  <span
                    key={variable}
                    className="inline-flex items-center px-2 py-1 text-xs bg-red-600/20 text-red-300 rounded border border-red-600/30"
                  >
                    <span className="font-mono">{variable}</span>
                    <span className="ml-1 text-red-500">✗</span>
                  </span>
                ))}
              </div>
              <div className="mt-2 text-xs text-red-300">
                Add these variables to the "{currentEnvironment.name}" environment to resolve them.
              </div>
            </div>
          )}
          
          {hasAllVariables && resolvedText !== text && (
            <div className="mt-2 pt-2 border-t border-green-600/20">
              <div className="text-xs text-gray-400 mb-1">Resolved URL:</div>
              <div className="flex items-center space-x-2">
                <code className="flex-1 px-2 py-1 text-xs bg-gray-800 text-green-300 rounded border border-green-600/30 font-mono overflow-x-auto">
                  {resolvedText}
                </code>
                {onResolve && (
                  <button
                    onClick={handleApplyResolved}
                    className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors whitespace-nowrap"
                    title="Apply resolved URL"
                  >
                    Apply
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}