import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import RequestTabs from '../components/RequestTabs';
import RequestPanel from '../components/RequestPanel';
import ResponsePanel from '../components/ResponsePanel';
import Header from '../components/Header';
import { useApp } from '../contexts/AppContext';

export default function MainApp() {
  const { activeTab, tabs } = useApp();
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [requestPanelHeight, setRequestPanelHeight] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

  const activeRequest = tabs.find(tab => tab.id === activeTab);

  // Handle sidebar resize
  const handleSidebarResize = (e) => {
    if (!isResizing) return;
    const newWidth = e.clientX;
    if (newWidth >= 250 && newWidth <= 500) {
      setSidebarWidth(newWidth);
    }
  };

  // Handle request panel resize
  const handleRequestPanelResize = (e) => {
    if (!isResizing) return;
    const container = e.currentTarget.parentElement;
    const containerRect = container.getBoundingClientRect();
    const newHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100;
    if (newHeight >= 30 && newHeight <= 70) {
      setRequestPanelHeight(newHeight);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsResizing(false);
    const handleMouseMove = (e) => {
      handleSidebarResize(e);
      handleRequestPanelResize(e);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div 
          className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0"
          style={{ width: sidebarWidth }}
        >
          <Sidebar />
        </div>

        {/* Sidebar Resize Handle */}
        <div
          className="w-1 bg-gray-200 dark:bg-gray-700 cursor-col-resize hover:bg-primary-500 transition-colors resize-handle"
          onMouseDown={() => setIsResizing(true)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Request Tabs */}
          <RequestTabs />

          {activeRequest ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Request Panel */}
              <div 
                className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-hidden"
                style={{ height: `${requestPanelHeight}%` }}
              >
                <RequestPanel request={activeRequest} />
              </div>

              {/* Horizontal Resize Handle */}
              <div
                className="h-1 bg-gray-200 dark:bg-gray-700 cursor-row-resize hover:bg-primary-500 transition-colors resize-handle"
                onMouseDown={() => setIsResizing(true)}
              />

              {/* Response Panel */}
              <div 
                className="bg-white dark:bg-gray-800 overflow-hidden"
                style={{ height: `${100 - requestPanelHeight}%` }}
              >
                <ResponsePanel request={activeRequest} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-primary-600 dark:text-primary-400 font-bold text-xl">RB</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Welcome to Request Buddy
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Create a new request or select one from the sidebar to get started
                </p>
                <button
                  onClick={() => {
                    // This will be handled by the new request functionality
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Create New Request
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}