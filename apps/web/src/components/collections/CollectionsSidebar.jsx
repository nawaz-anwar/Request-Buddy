import { useState, useEffect } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { 
  Plus, 
  Search, 
  Folder, 
  FolderOpen, 
  FileText, 
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  Layers,
  Zap,
  Upload,
  Download
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../stores/authStore'
import { useCollectionStore } from '../../stores/collectionStore'
import { useRequestStore } from '../../stores/requestStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import ImportCollectionModal from './ImportCollectionModal'
import CreateCollectionModal from './CreateCollectionModal'
import DeleteCollectionModal from './DeleteCollectionModal'
import DeleteRequestModal from '../request/DeleteRequestModal'
import DroppableCollection from './DroppableCollection'
import { exportPostmanCollection, downloadJsonFile } from '../../utils/postmanImportExport'

export default function CollectionsSidebar({ onRequestSelect }) {
  const { user } = useAuthStore()
  const { currentWorkspace, hasPermission } = useWorkspaceStore()
  const { 
    collections, 
    folders, 
    createCollection, 
    createFolder,
    updateCollection,
    updateFolder,
    deleteCollection,
    deleteFolder,
    subscribeToCollections,
    subscribeToFolders
  } = useCollectionStore()
  const { 
    requests, 
    createRequest,
    updateRequest,
    deleteRequest,
    subscribeToRequests
  } = useRequestStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCollections, setExpandedCollections] = useState(new Set())
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [contextMenu, setContextMenu] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false)
  const [showDeleteCollectionModal, setShowDeleteCollectionModal] = useState(false)
  const [showDeleteRequestModal, setShowDeleteRequestModal] = useState(false)
  const [exporting, setExporting] = useState(null)
  const [activeId, setActiveId] = useState(null)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  )

  // Permission helpers
  const canWrite = hasPermission(currentWorkspace?.id, user?.uid, 'write')
  const canRead = hasPermission(currentWorkspace?.id, user?.uid, 'read')

  // Subscribe to collections, folders, and requests when workspace changes
  useEffect(() => {
    if (currentWorkspace?.id) {
      console.log('CollectionsSidebar: Subscribing to data for workspace:', currentWorkspace.id)
      subscribeToCollections(currentWorkspace.id)
      subscribeToFolders(currentWorkspace.id)
      subscribeToRequests(currentWorkspace.id)
    }
  }, [currentWorkspace?.id, subscribeToCollections, subscribeToFolders, subscribeToRequests])

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        setContextMenu(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [contextMenu])

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

  const handleCreateCollection = () => {
    setShowCreateCollectionModal(true)
  }

  const handleCreateFolder = async (collectionId) => {
    if (!user) {
      alert('Please sign in first')
      return
    }
    
    if (!currentWorkspace) {
      alert('No workspace selected')
      return
    }
    
    const name = prompt('Folder name:')
    if (name) {
      try {
        console.log('Creating folder:', name, 'in collection:', collectionId, 'workspace:', currentWorkspace.id)
        await createFolder(name, collectionId, currentWorkspace.id)
      } catch (error) {
        console.error('Failed to create folder:', error)
        alert('Failed to create folder: ' + error.message)
      }
    }
  }

  const handleCreateRequest = async (collectionId, folderId = null) => {
    if (!user) return
    
    if (!currentWorkspace) {
      alert('No workspace selected')
      return
    }
    
    try {
      const requestData = {
        name: 'New Request',
        method: 'GET',
        url: '',
        headers: {},
        params: {},
        body: { type: 'none', content: '' },
        auth: { type: 'none', bearerToken: '', basic: { username: '', password: '' } },
        collectionId,
        folderId,
        workspaceId: currentWorkspace.id
      }
      
      const requestId = await createRequest(requestData)
      if (requestId) {
        // Auto-open the new request in a tab
        onRequestSelect({ ...requestData, id: requestId })
      }
    } catch (error) {
      console.error('Failed to create request:', error)
    }
  }

  const handleRightClick = (e, item, type) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
      type
    })
  }

  const handleRename = (item, type) => {
    setEditingItem({ ...item, type })
    setEditingName(item.name)
    setContextMenu(null)
  }

  const handleDelete = (item, type) => {
    if (type === 'collection') {
      setShowDeleteCollectionModal(item)
    } else if (type === 'request') {
      setShowDeleteRequestModal(item)
    } else if (type === 'folder') {
      // TODO: Implement folder delete modal
      console.log('Delete folder:', item)
    }
    setContextMenu(null)
  }

  const handleExportCollection = async (collection) => {
    if (!currentWorkspace?.id) {
      toast.error('No workspace selected')
      return
    }
    
    setExporting(collection.id)
    setContextMenu(null)
    
    try {
      console.log('📤 Exporting collection:', collection.name)
      const result = await exportPostmanCollection(collection.id, currentWorkspace.id)
      downloadJsonFile(result.collection, result.filename)
      toast.success(`Exported "${collection.name}" successfully`)
      console.log('✅ Collection exported successfully:', result.filename)
    } catch (error) {
      console.error('❌ Failed to export collection:', error)
      toast.error('Failed to export collection: ' + error.message)
    } finally {
      setExporting(null)
    }
  }

  const handleImportSuccess = (result) => {
    console.log('✅ Import successful:', result)
    // Force refresh to ensure UI is updated
    if (currentWorkspace?.id) {
      console.log('🔄 Forcing collection refresh for workspace:', currentWorkspace.id)
      subscribeToCollections(currentWorkspace.id)
      subscribeToFolders(currentWorkspace.id)
      subscribeToRequests(currentWorkspace.id)
    }
  }

  const handleDuplicateRequest = async (request) => {
    if (!user) return
    
    try {
      const duplicatedRequest = {
        ...request,
        name: `${request.name} copy`,
        id: undefined // Remove ID so a new one is generated
      }
      
      const requestId = await createRequest(duplicatedRequest)
      if (requestId) {
        // Auto-open the duplicated request in a tab
        onRequestSelect({ ...duplicatedRequest, id: requestId })
      }
    } catch (error) {
      console.error('Failed to duplicate request:', error)
    }
    setContextMenu(null)
  }

  // Drag and drop handlers
  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) {
      return
    }

    console.log('Drag ended:', { active: active.id, over: over.id })
    
    // Handle request being dropped
    if (active.data.current?.type === 'request') {
      const request = active.data.current.request
      
      // Dropped on collection
      if (over.data.current?.type === 'collection') {
        const targetCollection = over.data.current.collection
        console.log('Moving request to collection:', targetCollection.name)
        updateRequest(request.id, {
          collectionId: targetCollection.id,
          folderId: null // Remove from folder
        })
        toast.success(`Moved "${request.name}" to "${targetCollection.name}"`)
      }
      
      // Dropped on folder
      if (over.data.current?.type === 'folder') {
        const targetFolder = over.data.current.folder
        console.log('Moving request to folder:', targetFolder.name)
        updateRequest(request.id, {
          collectionId: targetFolder.collectionId,
          folderId: targetFolder.id
        })
        toast.success(`Moved "${request.name}" to "${targetFolder.name}"`)
      }
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const handleSaveEdit = async () => {
    if (!editingItem || !editingName.trim()) return

    try {
      if (editingItem.type === 'collection') {
        await updateCollection(editingItem.id, { name: editingName.trim() })
      } else if (editingItem.type === 'folder') {
        await updateFolder(editingItem.id, { name: editingName.trim() })
      } else if (editingItem.type === 'request') {
        await updateRequest(editingItem.id, { name: editingName.trim() })
      }
    } catch (error) {
      console.error('Failed to update name:', error)
    }
    
    setEditingItem(null)
    setEditingName('')
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setEditingName('')
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

  const getFoldersForCollection = (collectionId) => {
    return folders.filter(folder => folder.collectionId === collectionId)
  }

  const getRequestsForCollection = (collectionId) => {
    return requests.filter(request => request.collectionId === collectionId && !request.folderId)
  }

  const getRequestsForFolder = (folderId) => {
    return requests.filter(request => request.folderId === folderId)
  }

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 transition-colors duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Collections ({collections.length})
            </h2>
          </div>
          <div className="flex space-x-1">
            {canWrite && (
              <button
                onClick={() => setShowImportModal(true)}
                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200"
                title="Import Collection"
              >
                <Upload className="h-4 w-4" />
              </button>
            )}
            {canWrite && (
              <button
                onClick={handleCreateCollection}
                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                title="New Collection"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Collections Tree */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex-1 overflow-y-auto p-2">
          {filteredCollections.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
                <Layers className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">No collections yet</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">User: {user?.email}</p>
              <button
                onClick={handleCreateCollection}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>Create your first collection</span>
              </button>
            </div>
          ) : (
            filteredCollections.map(collection => {
              const collectionFolders = getFoldersForCollection(collection.id)
              const collectionRequests = getRequestsForCollection(collection.id)
              const isExpanded = expandedCollections.has(collection.id)

              return (
                <DroppableCollection
                  key={collection.id}
                  collection={collection}
                  folders={collectionFolders}
                  requests={collectionRequests}
                  isExpanded={isExpanded}
                  expandedFolders={expandedFolders}
                  onToggleCollection={() => toggleCollection(collection.id)}
                  onToggleFolder={toggleFolder}
                  onContextMenu={handleRightClick}
                  onCreateRequest={handleCreateRequest}
                  onCreateFolder={handleCreateFolder}
                  editingItem={editingItem}
                  editingName={editingName}
                  setEditingName={setEditingName}
                  handleSaveEdit={handleSaveEdit}
                  handleCancelEdit={handleCancelEdit}
                  onRequestSelect={onRequestSelect}
                  getMethodColor={getMethodColor}
                  canWrite={canWrite}
                  activeId={activeId}
                  onMenuAction={(action, item, type) => {
                    if (action === 'duplicate') {
                      handleDuplicateRequest(item)
                    } else if (action === 'rename') {
                      handleRename(item, type)
                    } else if (action === 'delete') {
                      handleDelete(item, type)
                    } else if (action === 'export') {
                      // Handle export for request if needed
                      console.log('Export request:', item)
                    }
                  }}
                />
              )
            })
          )}
        </div>
      </DndContext>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-gray-800 border border-gray-600 rounded-md shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.type === 'collection' && (
            <>
              {canWrite && (
                <button
                  onClick={() => {
                    handleCreateRequest(contextMenu.item.id)
                    setContextMenu(null)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Request</span>
                </button>
              )}
              <button
                onClick={() => handleExportCollection(contextMenu.item)}
                disabled={exporting === contextMenu.item.id}
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2 disabled:opacity-50"
              >
                <Download className="h-3 w-3" />
                <span>{exporting === contextMenu.item.id ? 'Exporting...' : 'Export as Postman'}</span>
              </button>
            </>
          )}
          
          {contextMenu.type === 'request' && canWrite && (
            <button
              onClick={() => handleDuplicateRequest(contextMenu.item)}
              className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
            >
              <FileText className="h-3 w-3" />
              <span>Duplicate Request</span>
            </button>
          )}
          
          {canWrite && (
            <button
              onClick={() => handleRename(contextMenu.item, contextMenu.type)}
              className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
            >
              <Edit2 className="h-3 w-3" />
              <span>Rename</span>
            </button>
          )}
          {canWrite && (
            <button
              onClick={() => handleDelete(contextMenu.item, contextMenu.type)}
              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center space-x-2"
            >
              <Trash2 className="h-3 w-3" />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}

      {/* Import Collection Modal */}
      <ImportCollectionModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={handleImportSuccess}
      />

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={showCreateCollectionModal}
        onClose={() => setShowCreateCollectionModal(false)}
      />

      {/* Delete Collection Modal */}
      <DeleteCollectionModal
        isOpen={!!showDeleteCollectionModal}
        collectionData={showDeleteCollectionModal}
        onClose={() => setShowDeleteCollectionModal(false)}
      />

      {/* Delete Request Modal */}
      <DeleteRequestModal
        isOpen={!!showDeleteRequestModal}
        request={showDeleteRequestModal}
        onClose={() => setShowDeleteRequestModal(false)}
      />
    </div>
  )
}