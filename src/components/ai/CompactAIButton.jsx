import { useState } from 'react'
import { Sparkles, ChevronDown } from 'lucide-react'

export default function CompactAIButton({ request, response, onAIAction }) {
  const [isOpen, setIsOpen] = useState(false)

  const aiActions = [
    { id: 'documentation', label: 'Generate Docs', requiresResponse: true },
    { id: 'explain', label: 'Explain Response', requiresResponse: true },
    { id: 'testcases', label: 'Generate Tests', requiresResponse: true },
    { id: 'codesnippets', label: 'Code Snippets', requiresResponse: false },
    { id: 'chat', label: 'Ask AI', requiresResponse: true }
  ]

  const handleAction = (actionId) => {
    console.log("AI Action clicked:", actionId)
    setIsOpen(false)
    
    if (onAIAction) {
      onAIAction(actionId, request, response)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
        title="AI Assistant"
      >
        <Sparkles className="h-4 w-4" />
        <span>AI</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="text-xs font-medium text-gray-900 dark:text-white">AI Assistant</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Choose an action</div>
          </div>
          
          <div className="py-1">
            {aiActions.map((action) => {
              const isDisabled = action.requiresResponse && !response
              
              return (
                <button
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  disabled={isDisabled}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                    isDisabled
                      ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {action.label}
                  {isDisabled && ' (needs response)'}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}