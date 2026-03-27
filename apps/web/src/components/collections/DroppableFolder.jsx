import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Folder, ChevronRight, ChevronDown, Plus } from 'lucide-react'
import DraggableRequestItem from './DraggableRequestItem'

export default function DroppableFolder({
  folder,
  requests,
  isExpanded,
  onToggle,
  onContextMenu,
  onCreateRequest,
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
    id: `folder-${folder.id}`,
    data: {
      type: 'folder',
      folder: folder
    }
  })

  const requestIds = requests.map(request => request.id)

  return (
    <div>
      <div
        ref={setNodeRef}
        className={`flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group transition-all duration-200 ${
          isOver ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600' : ''
        }`}
        onClick={onToggle}
        onContextMenu={(e) => onContextMenu(e, folder, 'folder')}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          )}
          <Folder className="h-3 w-3 text-yellow-400 flex-shrink-0" />
          
          {editingItem?.id === folder.id && editingItem?.type === 'folder' ? (
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
            <span className="text-sm text-gray-900 dark:text-gray-300 truncate">
              {folder.name}
            </span>
          )}
        </div>
        
        {canWrite && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCreateRequest(folder.collectionId, folder.id)
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-blue-400 transition-all"
            title="New Request"
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="ml-6 space-y-1">
          <SortableContext items={requestIds} strategy={verticalListSortingStrategy}>
            {requests.map(request => (
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
