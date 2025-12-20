import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useRequestStore } from '../../stores/requestStore'
import toast from 'react-hot-toast'

export default function DeleteRequestModal({ isOpen, request, onClose }) {
  const { deleteRequest, closeTab, tabs } = useRequestStore()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!request) return

    setDeleting(true)
    
    try {
      // Close tab if request is open
      const openTab = tabs.find(tab => tab.id === request.id)
      if (openTab) {
        closeTab(request.id)
      }

      // Delete the request
      await deleteRequest(request.id)
      
      toast.success('Request deleted successfully')
      onClose()
    } catch (error) {
      console.error('Failed to delete request:', error)
      toast.error('Failed to delete request: ' + error.message)
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    if (!deleting) {
      onClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !deleting) {
      handleClose()
    } else if (e.key === 'Enter') {
      handleDelete()
    }
  }

  if (!isOpen || !request) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Request
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={deleting}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete the request:
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-mono rounded">
                  {request.method || 'GET'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {request.name}
                </span>
              </div>
              {request.url && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 truncate">
                  {request.url}
                </p>
              )}
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                This will permanently delete the request and close any open tabs.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={deleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
              onKeyDown={handleKeyDown}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              autoFocus
            >
              {deleting ? 'Deleting...' : 'Delete Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}