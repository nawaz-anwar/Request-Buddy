import { useState, useRef } from 'react'
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { importPostmanCollection } from '../../utils/postmanImportExport'

export default function ImportCollectionModal({ isOpen, onClose, workspaceId, onSuccess }) {
  const [dragActive, setDragActive] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file) => {
    setError(null)
    setSuccess(null)
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.json')) {
      setError('Please select a JSON file')
      return
    }
    
    setImporting(true)
    
    try {
      // Read file content
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = (e) => reject(new Error('Failed to read file'))
        reader.readAsText(file)
      })
      
      // Parse JSON
      let jsonData
      try {
        jsonData = JSON.parse(fileContent)
      } catch (parseError) {
        throw new Error('Invalid JSON file')
      }
      
      // Import collection
      const result = await importPostmanCollection(jsonData, workspaceId)
      
      setSuccess(`Successfully imported "${result.collectionName}"`)
      
      // Notify parent component
      if (onSuccess) {
        onSuccess(result)
      }
      
      // Auto-close after success
      setTimeout(() => {
        onClose()
      }, 2000)
      
    } catch (error) {
      console.error('Import failed:', error)
      setError(error.message || 'Failed to import collection')
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    if (!importing) {
      setError(null)
      setSuccess(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Import Collection
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Import Postman Collection v2.1
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={importing}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* File Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              dragActive
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            } ${importing ? 'opacity-50 pointer-events-none' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={importing}
            />
            
            <div className="space-y-4">
              <div className="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {importing ? 'Importing...' : 'Drop your Postman collection here'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  or click to browse files
                </p>
                
                {!importing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Choose File</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Import Failed</p>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Import Successful</p>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">{success}</p>
            </div>
          )}

          {/* Requirements */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Requirements:</h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Postman Collection v2.1 format</li>
              <li>• Valid JSON file (.json extension)</li>
              <li>• Collection must have a name</li>
              <li>• Requests without URLs will be skipped</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={importing}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
          >
            {importing ? 'Importing...' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}