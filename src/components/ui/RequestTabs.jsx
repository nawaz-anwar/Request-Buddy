import React, { useState, useEffect } from 'react'
import { X, Plus, FileText, Circle, Copy, Save, Trash2 } from 'lucide-react'

export default function RequestTabs({ 
  tabs, 
  activeTabId, 
  onTabSelect, 
  onTabClose, 
  onNewTab,
  onTabSave,
  onTabDuplicate
}) {
  const [draggedTab, setDraggedTab] = useState(null)
  const [dragOverTab, setDragOverTab] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)

  const getMethodColor = (method) => {
    const colors = {
      GET: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      POST: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
      PUT: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
      PATCH: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
      DELETE: 'text-red-500 bg-red-100 dark:bg-red-900/30',
      HEAD: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
      OPTIONS: 'text-gray-500 bg-gray-100 dark:bg-gray-900/30'
    }
    return colors[method] || colors.GET
  }

  const handleTabClose = (e, tab) => {
    e.stopPropagation()
    
    // Check for unsaved changes
    if (tab.hasUnsavedChanges) {
      const confirmed = window.confirm(
        `You have unsaved changes in "${tab.name}". Are you sure you want to close this tab?`
      )
      if (!confirmed) return
    }
    
    onTabClose(tab.id)
  }

  const handleDragStart = (e, tab) => {
    setDraggedTab(tab)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, tab) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverTab(tab.id)
  }

  const handleDragLeave = () => {
    setDragOverTab(null)
  }

  const handleDrop = (e, targetTab) => {
    e.preventDefault()
    setDragOverTab(null)
    
    if (draggedTab && draggedTab.id !== targetTab.id) {
      // Handle tab reordering logic here if needed
      console.log('Reorder tabs:', draggedTab.id, 'to', targetTab.id)
    }
    
    setDraggedTab(null)
  }

  const handleRightClick = (e, tab) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      tab
    })
  }

  const handleContextMenuAction = (action, tab) => {
    switch (action) {
      case 'save':
        if (onTabSave) onTabSave(tab.id)
        break
      case 'duplicate':
        if (onTabDuplicate) onTabDuplicate(tab)
        break
      case 'close':
        handleTabClose({ stopPropagation: () => {} }, tab)
        break
      case 'closeOthers':
        tabs.forEach(t => {
          if (t.id !== tab.id) {
            handleTabClose({ stopPropagation: () => {} }, t)
          }
        })
        break
      case 'closeAll':
        tabs.forEach(t => {
          handleTabClose({ stopPropagation: () => {} }, t)
        })
        break
    }
    setContextMenu(null)
  }

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  if (tabs.length === 0) {
    return (
      <div className="h-12 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
        <button
          onClick={onNewTab}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>New Request</span>
        </button>
      </div>
    )
  }

  return (
    <div className="h-12 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center overflow-x-auto">
      <div className="flex items-center min-w-0 flex-1">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            draggable
            onDragStart={(e) => handleDragStart(e, tab)}
            onDragOver={(e) => handleDragOver(e, tab)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, tab)}
            className={`group relative flex items-center space-x-2 px-4 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-200 min-w-0 max-w-xs ${
              activeTabId === tab.id
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-b-2 border-blue-500'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
            } ${
              dragOverTab === tab.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
            onClick={() => onTabSelect(tab.id)}
            onContextMenu={(e) => handleRightClick(e, tab)}
          >
            {/* Method Badge */}
            <div className={`px-1.5 py-0.5 rounded text-xs font-mono font-medium ${getMethodColor(tab.method)}`}>
              {tab.method}
            </div>

            {/* Request Icon */}
            <FileText className="h-3.5 w-3.5 flex-shrink-0" />

            {/* Request Name */}
            <span className="text-sm font-medium truncate min-w-0 flex-1">
              {tab.name || 'Untitled Request'}
            </span>

            {/* Unsaved Changes Indicator */}
            {tab.hasUnsavedChanges && (
              <Circle className="h-2 w-2 fill-current text-orange-500 flex-shrink-0" />
            )}

            {/* Close Button */}
            <button
              onClick={(e) => handleTabClose(e, tab)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all duration-200 flex-shrink-0"
              title={tab.hasUnsavedChanges ? 'Unsaved changes - click to close' : 'Close tab'}
            >
              <X className="h-3 w-3" />
            </button>

            {/* Active Tab Indicator */}
            {activeTabId === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </div>
        ))}

        {/* New Tab Button */}
        <button
          onClick={onNewTab}
          className="flex items-center justify-center w-10 h-10 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 flex-shrink-0"
          title="New Request"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-soft-lg py-1 z-50 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {contextMenu.tab.hasUnsavedChanges && onTabSave && (
              <button
                onClick={() => handleContextMenuAction('save', contextMenu.tab)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
            )}
            
            {onTabDuplicate && (
              <button
                onClick={() => handleContextMenuAction('duplicate', contextMenu.tab)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Duplicate</span>
              </button>
            )}
            
            <div className="border-t border-gray-200 dark:border-gray-600 my-1" />
            
            <button
              onClick={() => handleContextMenuAction('close', contextMenu.tab)}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Close</span>
            </button>
            
            {tabs.length > 1 && (
              <>
                <button
                  onClick={() => handleContextMenuAction('closeOthers', contextMenu.tab)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Close Others</span>
                </button>
                
                <button
                  onClick={() => handleContextMenuAction('closeAll', contextMenu.tab)}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Close All</span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}