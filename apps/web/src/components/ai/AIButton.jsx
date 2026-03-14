import { useState, useEffect } from 'react'
import { Sparkles, ChevronDown, FileText, Brain, TestTube, Code, MessageCircle } from 'lucide-react'
import { useAIStore } from '../../stores/aiStore'
import { useAuthStore } from '../../stores/authStore'

export default function AIButton({ request, response, onAIResult }) {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuthStore()
  const { 
    isAvailable, 
    isLoading, 
    dailyUsage, 
    maxDailyUsage,
    checkAvailability, 
    checkDailyUsage,
    generateDocumentation,
    explainResponse,
    generateTestCases,
    generateCodeSnippets,
    askQuestion
  } = useAIStore()

  useEffect(() => {
    checkAvailability()
    if (user?.uid) {
      checkDailyUsage(user.uid)
    }
  }, [user?.uid, checkAvailability, checkDailyUsage])

  const handleAIAction = async (action) => {
    if (!user?.uid) {
      alert('Please sign in to use AI features')
      return
    }

    setIsOpen(false)

    try {
      let result = null
      
      switch (action) {
        case 'documentation':
          if (!request || !response) {
            alert('Please send a request first to generate documentation')
            return
          }
          result = await generateDocumentation(request, response, user.uid)
          break
          
        case 'explain':
          if (!response) {
            alert('Please send a request first to explain the response')
            return
          }
          result = await explainResponse(response, user.uid)
          break
          
        case 'testcases':
          if (!request || !response) {
            alert('Please send a request first to generate test cases')
            return
          }
          result = await generateTestCases(request, response, user.uid)
          break
          
        case 'codesnippets':
          if (!request) {
            alert('Please configure a request first to generate code snippets')
            return
          }
          result = await generateCodeSnippets(request, user.uid)
          break
          
        case 'chat':
          const question = prompt('What would you like to know about this API?')
          if (!question) return
          
          if (!request || !response) {
            alert('Please send a request first to ask questions about it')
            return
          }
          result = await askQuestion(request, response, question, user.uid)
          break
          
        default:
          console.error('Unknown AI action:', action)
          return
      }

      if (result && onAIResult) {
        onAIResult(result, action)
      }
    } catch (error) {
      console.error('AI Action Error:', error)
      alert(error.message || 'AI request failed. Please try again.')
    }
  }

  const aiActions = [
    {
      id: 'documentation',
      label: 'Generate API Documentation',
      icon: FileText,
      description: 'Create professional API docs',
      requiresResponse: true
    },
    {
      id: 'explain',
      label: 'Explain API Response',
      icon: Brain,
      description: 'Understand what this API does',
      requiresResponse: true
    },
    {
      id: 'testcases',
      label: 'Generate Test Cases',
      icon: TestTube,
      description: 'Create comprehensive test scenarios',
      requiresResponse: true
    },
    {
      id: 'codesnippets',
      label: 'Generate Code Snippets',
      icon: Code,
      description: 'Get code examples in multiple languages',
      requiresResponse: false
    },
    {
      id: 'chat',
      label: 'Ask AI',
      icon: MessageCircle,
      description: 'Ask questions about this API',
      requiresResponse: true
    }
  ]

  if (!isAvailable) {
    return null // Don't show AI button if not available
  }

  const usagePercentage = (dailyUsage / maxDailyUsage) * 100
  const isNearLimit = usagePercentage >= 80
  const isAtLimit = dailyUsage >= maxDailyUsage

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading || isAtLimit}
        className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          isLoading
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : isAtLimit
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
        }`}
        title={isAtLimit ? 'Daily AI limit reached' : `AI Assistant (${dailyUsage}/${maxDailyUsage} used today)`}
      >
        <Sparkles className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span>{isLoading ? 'AI Working...' : isAtLimit ? 'AI Limit Reached' : 'AI Assistant'}</span>
        {!isLoading && !isAtLimit && <ChevronDown className="h-4 w-4" />}
      </button>

      {/* Usage indicator */}
      {!isAtLimit && (
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              isNearLimit ? 'bg-orange-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && !isLoading && !isAtLimit && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-white">AI Assistant</h3>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {dailyUsage}/{maxDailyUsage} used today
              </div>
            </div>
          </div>
          
          <div className="py-2">
            {aiActions.map((action) => {
              const Icon = action.icon
              const isDisabled = action.requiresResponse && !response
              
              return (
                <button
                  key={action.id}
                  onClick={() => handleAIAction(action.id)}
                  disabled={isDisabled}
                  className={`w-full flex items-start space-x-3 px-4 py-3 text-left transition-colors ${
                    isDisabled
                      ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {action.description}
                      {isDisabled && ' (requires response)'}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              💡 AI responses are generated by Gemini and may not always be accurate
            </div>
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