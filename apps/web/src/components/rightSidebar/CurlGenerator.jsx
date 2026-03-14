import { useState, useEffect, useCallback } from 'react'
import { Copy, Check, Terminal } from 'lucide-react'
import { generateCurl } from '../../utils/codeGenerators'

export default function CurlGenerator({ request, environmentVariables = {} }) {
  const [curlCommand, setCurlCommand] = useState('')
  const [copied, setCopied] = useState(false)

  // Generate cURL command when request changes
  useEffect(() => {
    if (request) {
      try {
        const curl = generateCurl(request, environmentVariables)
        setCurlCommand(curl)
      } catch (error) {
        console.error('Error generating cURL:', error)
        setCurlCommand('# Error generating cURL command')
      }
    } else {
      setCurlCommand('# No request selected')
    }
  }, [request, environmentVariables])

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(curlCommand).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(err => {
      console.error('Failed to copy cURL command:', err)
    })
  }, [curlCommand])

  if (!request) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Terminal className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Request Selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Select a request to generate cURL command
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">cURL Command</h3>
          </div>
          <button
            onClick={copyToClipboard}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
              copied
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            disabled={!curlCommand || curlCommand.startsWith('#')}
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
      </div>

      {/* cURL Command Display */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-gray-900 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 overflow-auto">
            <pre className="text-sm text-green-400 font-mono leading-relaxed whitespace-pre-wrap break-all">
              {curlCommand}
            </pre>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <div className="mb-1">💡 <strong>Tip:</strong> This cURL command includes all your request settings</div>
          <div>• Environment variables are automatically resolved</div>
          <div>• Headers, auth, and body are included</div>
          <div>• Ready to run in your terminal</div>
        </div>
      </div>
    </div>
  )
}