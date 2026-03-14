import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import SidebarToggle from './SidebarToggle'
import CurlGenerator from './CurlGenerator'
import RequestInfo from './RequestInfo'
import CopyTools from './CopyTools'

export default function RightSidebar({ 
  request, 
  environmentVariables = {}, 
  isOpen = false, 
  onToggle 
}) {
  const [activeTab, setActiveTab] = useState('curl')

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.metaKey && !e.ctrlKey) return

      switch (e.key) {
        case 'U':
          if (e.shiftKey) {
            e.preventDefault()
            setActiveTab('curl')
            if (!isOpen) onToggle()
          }
          break
        case 'I':
          if (e.shiftKey) {
            e.preventDefault()
            setActiveTab('info')
            if (!isOpen) onToggle()
          }
          break
        case 'E':
          if (e.shiftKey) {
            e.preventDefault()
            setActiveTab('copy')
            if (!isOpen) onToggle()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onToggle])

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('requestBuddy_rightSidebarOpen', isOpen.toString())
  }, [isOpen])

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem('requestBuddy_rightSidebarTab', activeTab)
  }, [activeTab])

  // Load saved state on mount
  useEffect(() => {
    const savedTab = localStorage.getItem('requestBuddy_rightSidebarTab')
    if (savedTab && ['curl', 'info', 'copy'].includes(savedTab)) {
      setActiveTab(savedTab)
    } else {
      // Default to curl if saved tab was 'code' or invalid
      setActiveTab('curl')
    }
  }, [])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'curl':
        return (
          <CurlGenerator 
            request={request} 
            environmentVariables={environmentVariables} 
          />
        )
      case 'info':
        return (
          <RequestInfo 
            request={request} 
            environmentVariables={environmentVariables} 
          />
        )
      case 'copy':
        return (
          <CopyTools 
            request={request} 
            environmentVariables={environmentVariables} 
          />
        )
      default:
        return (
          <CurlGenerator 
            request={request} 
            environmentVariables={environmentVariables} 
          />
        )
    }
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-2">
        <div className="flex space-x-1 flex-1">
          {[
            { id: 'curl', label: 'cURL', shortcut: 'Cmd+Shift+U' },
            { id: 'info', label: 'Info', shortcut: 'Cmd+Shift+I' },
            { id: 'copy', label: 'Export', shortcut: 'Cmd+Shift+E' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title={`${tab.label} (${tab.shortcut})`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <button
          onClick={onToggle}
          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors ml-2"
          title="Close Sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  )
}