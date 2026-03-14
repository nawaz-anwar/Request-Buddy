import { useState, useEffect, useCallback } from 'react'
import { Copy, Check, Code, ChevronDown } from 'lucide-react'
import { codeGenerators, languageOptions } from '../../utils/codeGenerators'

export default function CodeSnippetGenerator({ request, environmentVariables = {} }) {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [generatedCode, setGeneratedCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('requestBuddy_preferredLanguage')
    if (savedLanguage && codeGenerators[savedLanguage]) {
      setSelectedLanguage(savedLanguage)
    }
  }, [])

  // Generate code when request or language changes
  useEffect(() => {
    if (request && codeGenerators[selectedLanguage]) {
      try {
        const code = codeGenerators[selectedLanguage](request, environmentVariables)
        setGeneratedCode(code)
      } catch (error) {
        console.error('Error generating code:', error)
        setGeneratedCode('// Error generating code snippet')
      }
    } else {
      setGeneratedCode('// No request selected')
    }
  }, [request, selectedLanguage, environmentVariables])

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language)
    setDropdownOpen(false)
    localStorage.setItem('requestBuddy_preferredLanguage', language)
  }

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(generatedCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(err => {
      console.error('Failed to copy code:', err)
    })
  }, [generatedCode])

  const selectedOption = languageOptions.find(opt => opt.value === selectedLanguage)

  if (!request) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Code className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Request Selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Select a request to generate code snippets
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Code className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">Code Snippets</h3>
          </div>
          <button
            onClick={copyToClipboard}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
              copied
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            disabled={!generatedCode || generatedCode.startsWith('//')}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{selectedOption?.icon}</span>
              <span>{selectedOption?.label}</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
              {languageOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleLanguageChange(option.value)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                    selectedLanguage === option.value
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Code Display */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-gray-900 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 overflow-auto">
            <pre className="text-sm text-gray-100 font-mono leading-relaxed whitespace-pre-wrap break-all">
              {generatedCode}
            </pre>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <div className="mb-1">💡 <strong>Tip:</strong> Code snippets are generated from your current request</div>
          <div>• Environment variables are resolved automatically</div>
          <div>• Your preferred language is remembered</div>
          <div>• Ready to copy and paste into your project</div>
        </div>
      </div>
    </div>
  )
}