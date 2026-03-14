import React from 'react';
import { X, Save, Circle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export default function RequestTabs() {
  const { tabs, activeTab, setActiveTab, closeTab, updateRequest, createRequest } = useApp();

  const handleSaveTab = async (tab) => {
    if (tab.saved && tab.id) {
      // Update existing request
      await updateRequest(tab.id, {
        name: tab.name,
        method: tab.method,
        url: tab.url,
        headers: tab.headers,
        params: tab.params,
        body: tab.body,
        auth: tab.auth
      });
    } else {
      // Create new request
      const requestId = await createRequest({
        name: tab.name,
        method: tab.method,
        url: tab.url,
        headers: tab.headers || {},
        params: tab.params || {},
        body: tab.body || { type: 'none', content: '' },
        auth: tab.auth || { type: 'none' },
        collectionId: tab.collectionId || null
      });
      
      if (requestId) {
        // Update tab to mark as saved
        const updatedTabs = tabs.map(t => 
          t.id === tab.id ? { ...t, id: requestId, saved: true } : t
        );
        // This would need to be handled in the context
      }
    }
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      PUT: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      PATCH: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[method] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`flex items-center space-x-2 px-4 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer min-w-0 max-w-xs group ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${getMethodColor(tab.method)}`}>
              {tab.method}
            </span>
            
            <span className="text-sm truncate flex-1 min-w-0">
              {tab.name || 'Untitled Request'}
            </span>

            <div className="flex items-center space-x-1">
              {!tab.saved && (
                <Circle className="h-2 w-2 fill-current text-orange-500" />
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveTab(tab);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-primary-500 transition-all"
                title="Save"
              >
                <Save className="h-3 w-3" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 transition-all"
                title="Close"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}