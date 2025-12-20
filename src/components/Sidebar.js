import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Folder, 
  FolderOpen, 
  File, 
  MoreHorizontal,
  History,
  Globe
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export default function Sidebar() {
  const { 
    collections, 
    requests, 
    history,
    createCollection, 
    openTab,
    deleteCollection,
    deleteRequest
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCollections, setExpandedCollections] = useState(new Set());
  const [activeTab, setActiveTab] = useState('collections');

  const toggleCollection = (collectionId) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
    }
    setExpandedCollections(newExpanded);
  };

  const handleNewCollection = async () => {
    const name = prompt('Collection name:');
    if (name) {
      await createCollection(name);
    }
  };

  const handleNewRequest = () => {
    openTab({
      name: 'Untitled Request',
      method: 'GET',
      url: '',
      headers: {},
      params: {},
      body: { type: 'none', content: '' },
      auth: { type: 'none' }
    });
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: 'text-green-600 dark:text-green-400',
      POST: 'text-blue-600 dark:text-blue-400',
      PUT: 'text-orange-600 dark:text-orange-400',
      PATCH: 'text-yellow-600 dark:text-yellow-400',
      DELETE: 'text-red-600 dark:text-red-400'
    };
    return colors[method] || 'text-gray-600 dark:text-gray-400';
  };

  const filteredRequests = requests.filter(request =>
    request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHistory = history.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Workspace</h2>
          <div className="flex space-x-1">
            <button
              onClick={handleNewRequest}
              className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="New Request"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={handleNewCollection}
              className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="New Collection"
            >
              <Folder className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('collections')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'collections'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Collections
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'history'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          History
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'collections' && (
          <div className="p-2">
            {collections.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No collections yet</p>
                <button
                  onClick={handleNewCollection}
                  className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Create your first collection
                </button>
              </div>
            ) : (
              collections.map(collection => {
                const collectionRequests = filteredRequests.filter(
                  req => req.collectionId === collection.id
                );
                const isExpanded = expandedCollections.has(collection.id);

                return (
                  <div key={collection.id} className="mb-2">
                    <div
                      className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group"
                      onClick={() => toggleCollection(collection.id)}
                    >
                      <div className="flex items-center space-x-2">
                        {isExpanded ? (
                          <FolderOpen className="h-4 w-4 text-primary-500" />
                        ) : (
                          <Folder className="h-4 w-4 text-primary-500" />
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {collection.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({collectionRequests.length})
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this collection?')) {
                            deleteCollection(collection.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 transition-all"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="ml-6 space-y-1">
                        {collectionRequests.map(request => (
                          <div
                            key={request.id}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group"
                            onClick={() => openTab(request)}
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              <File className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className={`text-xs font-mono ${getMethodColor(request.method)}`}>
                                {request.method}
                              </span>
                              <span className="text-sm text-gray-900 dark:text-white truncate">
                                {request.name}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Delete this request?')) {
                                  deleteRequest(request.id);
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 transition-all"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {collectionRequests.length === 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 p-2">
                            No requests in this collection
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-2">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No history yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Send a request to see it here
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredHistory.map(item => (
                  <div
                    key={item.id}
                    className="p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => openTab(item)}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs font-mono ${getMethodColor(item.method)}`}>
                        {item.method}
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white truncate">
                        {item.name || 'Untitled'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {item.url}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}