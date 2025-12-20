import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  Folder, 
  FolderOpen, 
  File, 
  MoreHorizontal,
  History,
  Settings,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useCollectionStore } from '../../stores/collectionStore'
import { useRequestStore } from '../../stores/requestStore'
import { useHistoryStore } from '../../stores/historyStore'

export default function Sidebar() {
  const { currentWorkspace } = useWorkspaceStore()
  const { 
    collections, 
    folders, 
    createCollection, 
    createFolder,
    deleteCollection,
    deleteFolder,
    getFoldersForCollection
  } = useCollectionStore()
  const { 
    requests, 
    openTab, 
    createNewTab,
    deleteRequest,
    getRequestsForCollection,
    getRequestsForFolder
  } = useRequestStore()
  const { history } = useHistoryStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCollections, setExpandedCollections] = useState(new Set())
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [activeTab, setActiveTab] = useState('collections')

  const toggleCollection = (collectionId) => {
    const newExpanded = new Set(expandedCollections)
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId)
    } else {
      newExpanded.add(collectionId)
    }
    setExpandedCollections(newExpanded)
  }

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleNewCollection = async () => {
    const name = prompt('Collection name:')
    if (name && currentWorkspace) {
      await createCollection(name, currentWorkspace.id)
    }
  }

  const handleNewFolder = async (collectionId) => {
    const name = prompt('Folder name:')
    if (name && currentWorkspace) {
      await createFolder(name, collectionId, currentWorkspace.id)
    }
  }

  const handleNewRequest = (collectionId = null, folderId = null) => {
    if (currentWorkspace) {
      createNewTab(currentWorkspace.id, collectionId, folderId)
    }
  }

  const getMethodColor = (method) => {
    const colors = {
      GET: 'text-green-400',
      POST: 'text-blue-400',
      PUT: 'text-orange-400',
      PATCH: 'text-yellow-400',
      DELETE: 'text-red-400'
    }
    return colors[method] || 'text-gray-400'
  }

  const filteredRequests = requests.filter(request =>
    request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.url.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredHistory = history.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.url?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Collections</h2>
          <div className="flex space-x-1">
            <button
              onClick={() => handleNewRequest()}
              className="p-1.5 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
              title="New Request"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={handleNewCollection}
              className="p-1.5 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
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
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('collections')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'collections'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Collections
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'history'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
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
                <Folder className="mx-auto h-8 w-8 text-gray-500 mb-2" />
                <p className="text-sm text-gray-400">No collections yet</p>
                <button
                  onClick={handleNewCollection}
                  className="mt-2 text-sm text-blue-400 hover:underline"
                >
                  Create your first collection
                </button>
              </div>
            ) : (
              collections.map(collection => {
                const collectionFolders = getFoldersForCollection(collection.id)
                const collectionRequests = getRequestsForCollection(collection.id).filter(
                  req => !req.folderId
                )
                const isExpanded = expandedCollections.has(collection.id)

                return (
                  <div key={collection.id} className="mb-2">
                    <div
                      className="flex items-center justify-between p-2 rounded-md hover:bg-gray-700 cursor-pointer group"
                      onClick={() => toggleCollection(collection.id)}
                    >
                      <div className="flex items-center space-x-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                        {isExpanded ? (
                          <FolderOpen className="h-4 w-4 text-blue-400" />
                        ) : (
                          <Folder className="h-4 w-4 text-blue-400" />
                        )}
                        <span className="text-sm font-medium text-white">
                          {collection.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleNewRequest(collection.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-blue-400 transition-all"
                          title="New Request"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleNewFolder(collection.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-blue-400 transition-all"
                          title="New Folder"
                        >
                          <Folder className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('Delete this collection?')) {
                              deleteCollection(collection.id)
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-400 transition-all"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="ml-6 space-y-1">
                        {/* Folders */}
                        {collectionFolders.map(folder => {
                          const folderRequests = getRequestsForFolder(folder.id)
                          const isFolderExpanded = expandedFolders.has(folder.id)

                          return (
                            <div key={folder.id}>
                              <div
                                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-700 cursor-pointer group"
                                onClick={() => toggleFolder(folder.id)}
                              >
                                <div className="flex items-center space-x-2">
                                  {isFolderExpanded ? (
                                    <ChevronDown className="h-3 w-3 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3 text-gray-400" />
                                  )}
                                  <Folder className="h-3 w-3 text-yellow-400" />
                                  <span className="text-sm text-gray-300">
                                    {folder.name}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleNewRequest(collection.id, folder.id)
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-blue-400 transition-all"
                                    title="New Request"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (confirm('Delete this folder?')) {
                                        deleteFolder(folder.id)
                                      }
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-400 transition-all"
                                  >
                                    <MoreHorizontal className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>

                              {isFolderExpanded && (
                                <div className="ml-6 space-y-1">
                                  {folderRequests.map(request => (
                                    <div
                                      key={request.id}
                                      className="flex items-center justify-between p-2 rounded-md hover:bg-gray-700 cursor-pointer group"
                                      onClick={() => openTab(request)}
                                    >
                                      <div className="flex items-center space-x-2 min-w-0">
                                        <File className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                        <span className={`text-xs font-mono ${getMethodColor(request.method)}`}>
                                          {request.method}
                                        </span>
                                        <span className="text-sm text-gray-300 truncate">
                                          {request.name}
                                        </span>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          if (confirm('Delete this request?')) {
                                            deleteRequest(request.id)
                                          }
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-400 transition-all"
                                      >
                                        <MoreHorizontal className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}

                        {/* Direct collection requests */}
                        {collectionRequests.map(request => (
                          <div
                            key={request.id}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-700 cursor-pointer group"
                            onClick={() => openTab(request)}
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              <File className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className={`text-xs font-mono ${getMethodColor(request.method)}`}>
                                {request.method}
                              </span>
                              <span className="text-sm text-gray-300 truncate">
                                {request.name}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('Delete this request?')) {
                                  deleteRequest(request.id)
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-400 transition-all"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-2">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="mx-auto h-8 w-8 text-gray-500 mb-2" />
                <p className="text-sm text-gray-400">No history yet</p>
                <p className="text-xs text-gray-500 mt-1">
                  Send a request to see it here
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredHistory.map(item => (
                  <div
                    key={item.id}
                    className="p-2 rounded-md hover:bg-gray-700 cursor-pointer"
                    onClick={() => openTab(item)}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs font-mono ${getMethodColor(item.method)}`}>
                        {item.method}
                      </span>
                      <span className="text-sm text-white truncate">
                        {item.name || 'Untitled'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {item.url}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.createdAt?.toDate?.() || item.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}