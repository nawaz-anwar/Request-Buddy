import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  Zap 
} from 'lucide-react'
import DroppableFolder from './DroppableFolder'
import DraggableRequestItem from './DraggableRequestItem'

export default function DroppableCollection({
  collection,
  folders,
  requests,
  isExpanded,
  expandedFolders,
  onToggleCollection,
  onToggleFolder,
  onContextMenu,
  onCreateRequest,
  onCreateFolder,
  editingItem,
  editingName,
  setEditingName,
  handleSaveEdit,
  handleCancelEdit,
  onRequestSelect,
  getMethodColor,
  canWrite,
  activeId,
  onMenuAction
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `collection-${collection.id}`,
    data: {
      type: 'collection',
      collection: collection
    }
  })

  const requestIds = requests.map(request => request.id)

  return (
    <div className="mb-1">
      <div
        ref={setNodeRef}
        className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group transition-all duration-200 ${
          isOver ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600' : ''
        }`}
        onClick={onToggleCollection}
        onContextMenu={(e) => onContextMenu(e, collection, 'collection')}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0 transition-transform duration-200" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0 transition-transform duration-200" />
          )}
          {isExpanded ? (
            <FolderOpen className="h-5 w-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
          ) : (
            <Folder className="h-5 w-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
          )}
          
          {editingItem?.id === collection.id && editingItem?.type === 'collection' ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit()
                if (e.key === 'Escape') handleCancelEdit()
              }}
              className="flex-1 px-2 py-1 text-sm bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {collection.name}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canWrite && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCreateRequest(collection.id)
              }}
              className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
              title="New Request"
            >
              <Zap className="h-3.5 w-3.5" />
            </button>
          )}
          {canWrite && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCreateFolder(collection.id)
              }}
              className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
              title="New Folder"
            >
              <Folder className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="ml-6 space-y-1">
          {/* Folders */}
          {folders.map(folder => {
            const folderRequests = requests.filter(request => request.folderId === folder.id)
            const isFolderExpanded = expandedFolders.has(folder.id)

            return (
              <DroppableFolder
                key={folder.id}
                folder={folder}
                requests={folderRequests}
                isExpanded={isFolderExpanded}
                onToggle={() => onToggleFolder(folder.id)}
                onContextMenu={onContextMenu}
                onCreateRequest={onCreateRequest}
                editingItem={editingItem}
                editingName={editingName}
                setEditingName={setEditingName}
                handleSaveEdit={handleSaveEdit}
                handleCancelEdit={handleCancelEdit}
                onRequestSelect={onRequestSelect}
                getMethodColor={getMethodColor}
                canWrite={canWrite}
                activeId={activeId}
                onMenuAction={onMenuAction}
              />
            )
          })}

          {/* Direct collection requests (no folder) */}
          <SortableContext items={requestIds} strategy={verticalListSortingStrategy}>
            {requests.filter(request => !request.folderId).map(request => (
              <DraggableRequestItem
                key={request.id}
                request={request}
                onRequestSelect={onRequestSelect}
                onContextMenu={onContextMenu}
                editingItem={editingItem}
                editingName={editingName}
                setEditingName={setEditingName}
                handleSaveEdit={handleSaveEdit}
                handleCancelEdit={handleCancelEdit}
                getMethodColor={getMethodColor}
                isDragging={activeId === request.id}
                onMenuAction={onMenuAction}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  )
}