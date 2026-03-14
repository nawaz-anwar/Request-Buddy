import React, { useState } from 'react'
import { ChevronDown, Settings, Plus, Globe, Check } from 'lucide-react'
import { useEnvironmentStore } from '../../stores/environmentStore'
import EnvironmentModal from './EnvironmentModal'

export default function EnvironmentSelector() {
  const { 
    environments, 
    currentEnvironment, 
    setCurrentEnvironment 
  } = useEnvironmentStore()
  
  const [isOpen, setIsOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingEnvironment, setEditingEnvironment] = useState(null)

  const handleEnvironmentSelect = (environment) => {
    setCurrentEnvironment(environment)
    setIsOpen(false)
  }

  const handleCreateNew = () => {
    setEditingEnvironment(null)
    setShowModal(true)
    setIsOpen(false)
  }

  const handleEdit = (environment, e) => {
    e.stopPropagation()
    setEditingEnvironment(environment)
    setShowModal(true)
    setIsOpen(false)
  }

  const handleManageEnvironments = () => {
    setEditingEnvironment('manage')
    setShowModal(true)
    setIsOpen(false)
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white transition-all duration-200 min-w-[160px] shadow-sm"
        >
          <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium truncate">
            {currentEnvironment ? currentEnvironment.name : 'No Environment'}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 ml-auto" />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-soft-lg z-20 animate-fade-in">
              <div className="py-1">
                {/* No Environment Option */}
                <button
                  onClick={() => handleEnvironmentSelect(null)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center justify-between"
                >
                  <span>No Environment</span>
                  {!currentEnvironment && (
                    <Check className="h-4 w-4 text-green-400" />
                  )}
                </button>

                {environments.length > 0 && (
                  <div className="border-t border-gray-600 my-1" />
                )}

                {/* Environment List */}
                {environments.map(environment => (
                  <button
                    key={environment.id}
                    onClick={() => handleEnvironmentSelect(environment)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <Globe className="h-3 w-3 text-blue-400 flex-shrink-0" />
                      <span className="truncate">{environment.name}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        ({Object.keys(environment.variables || {}).length} vars)
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {currentEnvironment?.id === environment.id && (
                        <Check className="h-4 w-4 text-green-400" />
                      )}
                      <button
                        onClick={(e) => handleEdit(environment, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded transition-all"
                        title="Edit environment"
                      >
                        <Settings className="h-3 w-3" />
                      </button>
                    </div>
                  </button>
                ))}

                <div className="border-t border-gray-600 my-1" />

                {/* Actions */}
                <button
                  onClick={handleCreateNew}
                  className="w-full px-4 py-2 text-left text-sm text-blue-400 hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Environment</span>
                </button>

                <button
                  onClick={handleManageEnvironments}
                  className="w-full px-4 py-2 text-left text-sm text-gray-400 hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Manage Environments</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Environment Modal */}
      {showModal && (
        <EnvironmentModal
          environment={editingEnvironment}
          onClose={() => {
            setShowModal(false)
            setEditingEnvironment(null)
          }}
        />
      )}
    </>
  )
}