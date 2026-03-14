import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FileText, GripVertical, MoreHorizontal, Edit2, Trash2 } from 'lucide-react'

export default function DraggableRequestItem({ 
  request, 
  onRequestSelect, 
  onContextMenu, 
  editingItem, 
  editingName, 
  setEditingName, 
  handleSaveEdit, 
  handleCancelEdit,
  getMethodColor,
  isDragging = false,
  onMenuAction
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: request.id,
    data: {
      type: 'request',
      request: request
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  const handleMenuClick = (e) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPosition({
      x: rect.right,
      y: rect.top
    })
    setShowMenu(!showMenu)
  }

  const handleMenuItemClick = (action) => {
    setShowMenu(false)
    if (onMenuAction) {
      onMenuAction(action, request, 'request')
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group transition-all duration-200 ${
          isSortableDragging ? 'z-50 shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600' : ''
        }`}
        onClick={() => onRequestSelect(request)}
        onContextMenu={(e) => onContextMenu(e, request, 'request')}
      >
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="opacity-0 group-hover:opacity-100 p-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-3 w-3" />
          </div>
          
          <FileText className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <span className={`text-xs font-mono ${getMethodColor(request.method)} flex-shrink-0`}>
            {request.method}
          </span>
          
          {editingItem?.id === request.id && editingItem?.type === 'request' ? (
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
              {request.name}
            </span>
          )}
        </div>

        {/* Three-dot menu button - shows on hover */}
        <button
          onClick={handleMenuClick}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-opacity"
          title="More options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div
            className="fixed bg-gray-800 border border-gray-600 rounded-md shadow-lg py-1 z-50 min-w-[160px]"
            style={{ left: menuPosition.x, top: menuPosition.y }}
          >
            <button
              onClick={() => handleMenuItemClick('duplicate')}
              className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
            >
              <FileText className="h-3 w-3" />
              <span>Duplicate Request</span>
            </button>
            <button
              onClick={() => handleMenuItemClick('rename')}
              className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
            >
              <Edit2 className="h-3 w-3" />
              <span>Rename</span>
            </button>
            <button
              onClick={() => handleMenuItemClick('delete')}
              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center space-x-2"
            >
              <Trash2 className="h-3 w-3" />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </>
  )
}