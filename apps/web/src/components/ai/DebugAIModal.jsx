import { X } from 'lucide-react'

export default function DebugAIModal({ isOpen, onClose, result }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            🧪 DEBUG AI Modal
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">
              ✅ SUCCESS: AI Modal is Visible!
            </h3>
            <p className="text-green-700 dark:text-green-300">
              This proves the AI modal can render and display properly.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Debug Information:
            </h4>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Modal renders correctly</li>
              <li>• Click events work</li>
              <li>• Styling is applied</li>
              <li>• Theme support works</li>
              <li>• Ready for real AI integration</li>
            </ul>
          </div>

          {result && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-800 dark:text-gray-200 font-mono text-sm">
                {result}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Close Debug Modal
          </button>
        </div>
      </div>
    </div>
  )
}