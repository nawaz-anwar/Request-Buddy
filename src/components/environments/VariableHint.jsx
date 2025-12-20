import React from 'react'
import { Info, Globe } from 'lucide-react'
import { useEnvironmentStore } from '../../stores/environmentStore'
import { findVariables, getMissingVariables } from '../../utils/variableUtils'

export default function VariableHint({ text }) {
  const { currentEnvironment } = useEnvironmentStore()
  
  if (!text || !currentEnvironment) return null
  
  // Find variables in the text
  const variables = findVariables(text)
  
  if (variables.length === 0) return null
  
  const availableVars = Object.keys(currentEnvironment.variables || {})
  const missingVars = getMissingVariables(text, currentEnvironment.variables || {})
  const foundVars = variables.filter(v => availableVars.includes(v))
  
  return (
    <div className="mt-2 p-2 bg-gray-750 rounded-md border border-gray-600">
      <div className="flex items-start space-x-2">
        <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400 mb-1">
            Variables found in {currentEnvironment.name}:
          </div>
          
          {foundVars.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-green-400 mb-1">✓ Available:</div>
              <div className="flex flex-wrap gap-1">
                {foundVars.map(variable => (
                  <span
                    key={variable}
                    className="px-2 py-1 text-xs bg-green-600/20 text-green-400 rounded border border-green-600/30"
                  >
                    {variable}: {currentEnvironment.variables[variable]}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {missingVars.length > 0 && (
            <div>
              <div className="text-xs text-red-400 mb-1">⚠ Missing:</div>
              <div className="flex flex-wrap gap-1">
                {missingVars.map(variable => (
                  <span
                    key={variable}
                    className="px-2 py-1 text-xs bg-red-600/20 text-red-400 rounded border border-red-600/30"
                  >
                    {variable}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <Globe className="h-4 w-4 text-blue-400 flex-shrink-0" />
      </div>
    </div>
  )
}