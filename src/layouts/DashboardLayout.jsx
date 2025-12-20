import React, { useState } from 'react'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'
import RequestEditor from '../components/layout/RequestEditor'
import ResponseViewer from '../components/layout/ResponseViewer'
import { useRequestStore } from '../stores/requestStore'
import { useWorkspaceStore } from '../stores/workspaceStore'

export default function DashboardLayout() {
  const [sidebarWidth, setSidebarWidth] = useState(300)
  const [requestPanelHeight, setRequestPanelHeight] = useState(50)
  const [isResizing, setIsResizing] = useState(false)

  const { getActiveTab } = useRequestStore()
  const { currentWorkspace } = useWorkspaceStore()
  const activeTab = getActiveTab()

  // Handle sidebar resize
  const handleSidebarResize = (e) => {
    if (!isResizing) return
    const newWidth = e.clientX
    if (newWidth >= 250 && newWidth <= 500) {
      setSidebarWidth(newWidth)
    }
  }

  // Handle request panel resize
  const handleRequestPanelResize = (e) => {
    if (!isResizing) return
    const container = e.currentTarget.parentElement
    const containerRect = container.getBoundingClientRect()
    const newHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100
    if (newHeight >= 30 && newHeight <= 70) {
      setRequestPanelHeight(newHeight)
    }
  }

  React.useEffect(() => {
    const handleMouseUp = () => setIsResizing(false)
    const handleMouseMove = (e) => {
      handleSidebarResize(e)
      handleRequestPanelResize(e)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div 
          className="bg-gray-800 border-r border-gray-700 flex-shrink-0"
          style={{ width: sidebarWidth }}
        >
          <Sidebar />
        </div>

        {/* Sidebar Resize Handle */}
        <div
          className="w-1 bg-gray-700 cursor-col-resize hover:bg-blue-500 transition-colors"
          onMouseDown={() => setIsResizing(true)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Request Panel */}
              <div 
                className="bg-gray-800 border-b border-gray-700 overflow-hidden"
                style={{ height: `${requestPanelHeight}%` }}
              >
                <RequestEditor />
              </div>

              {/* Horizontal Resize Handle */}
              <div
                className="h-1 bg-gray-700 cursor-row-resize hover:bg-blue-500 transition-colors"
                onMouseDown={() => setIsResizing(true)}
              />

              {/* Response Panel */}
              <div 
                className="bg-gray-800 overflow-hidden"
                style={{ height: `${100 - requestPanelHeight}%` }}
              >
                <ResponseViewer />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">RB</span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  Welcome to Request Buddy
                </h3>
                <p className="text-gray-400 mb-4">
                  Create a new request or select one from the sidebar to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}