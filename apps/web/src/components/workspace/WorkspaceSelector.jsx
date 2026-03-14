import { useState, useRef, useEffect } from 'react'
import { 
  ChevronDown, 
  Plus, 
  Edit2, 
  Trash2, 
  Building2,
  Check,
  X,
  Users,
  MoreVertical,
  LogOut
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import CreateWorkspaceModal from './CreateWorkspaceModal'
import DeleteWorkspaceModal from './DeleteWorkspaceModal'
import MemberManagementModal from './MemberManagementModal'

export default function WorkspaceSelector() {
  const { user } = useAuthStore()
  const { 
    workspaces, 
    currentWorkspace, 
    setCurrentWorkspace, 
    updateWorkspace,
    subscribeToWorkspaces,
    hasPermission,
    migrationComplete
  } = useWorkspaceStore()

  
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [editingWorkspace, setEditingWorkspace] = useState(null)
  const [editName, setEditName] = useState('')
  const [contextMenu, setContextMenu] = useState(null)
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false)
  
  const dropdownRef = useRef(null)
  const editInputRef = useRef(null)

  // Subscribe to workspaces on mount
  useEffect(() => {
    if (user?.uid) {
      subscribeToWorkspaces(user.uid)
    }
  }, [user?.uid, subscribeToWorkspaces])



  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setContextMenu(null)
        setShowWorkspaceMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingWorkspace && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingWorkspace])

  const handleWorkspaceSelect = (workspace) => {
    setCurrentWorkspace(workspace)
    setIsOpen(false)
  }

  const handleRightClick = (e, workspace) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      workspace
    })
  }

  const handleRename = (workspace) => {
    setEditingWorkspace(workspace)
    setEditName(workspace.name)
    setContextMenu(null)
    setIsOpen(false)
  }

  const handleSaveRename = async () => {
    if (!editName.trim() || !editingWorkspace) return

    try {
      await updateWorkspace(editingWorkspace.id, { name: editName.trim() })
      setEditingWorkspace(null)
      setEditName('')
    } catch (error) {
      console.error('Failed to rename workspace:', error)
    }
  }

  const handleCancelRename = () => {
    setEditingWorkspace(null)
    setEditName('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveRename()
    } else if (e.key === 'Escape') {
      handleCancelRename()
    }
  }

  const handleDelete = (workspace) => {
    setShowDeleteModal(workspace)
    setContextMenu(null)
  }

  const handleManageMembers = (workspace) => {
    setShowMembersModal(workspace)
    setContextMenu(null)
  }

  // Always show the workspace selector, even when loading
  const isLoading = !migrationComplete || (!currentWorkspace && workspaces.length === 0)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Workspace Selector Button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
            <Building2 className="h-3 w-3 text-white" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-gray-900 dark:text-white max-w-32 truncate">
              {isLoading ? (
                'Loading...'
              ) : currentWorkspace?.name || 'Select Workspace'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isLoading ? (
                'Initializing...'
              ) : !migrationComplete ? (
                'Syncing...'
              ) : currentWorkspace?.memberIds?.length ? (
                `${currentWorkspace.memberIds.length} member${currentWorkspace.memberIds.length !== 1 ? 's' : ''}`
              ) : (
                '1 member'
              )}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Workspace Menu Button */}
        {currentWorkspace && (
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Workspace Options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Workspaces</h3>
              <button
                onClick={() => {
                  setShowCreateModal(true)
                  setIsOpen(false)
                }}
                className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                title="Create Workspace"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Workspace List */}
          <div className="max-h-64 overflow-y-auto">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="relative group"
              >
                {editingWorkspace?.id === workspace.id ? (
                  /* Editing Mode */
                  <div className="flex items-center space-x-2 p-3">
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
                    />
                    <button
                      onClick={handleSaveRename}
                      className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      onClick={handleCancelRename}
                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  /* Normal Mode */
                  <button
                    onClick={() => handleWorkspaceSelect(workspace)}
                    onContextMenu={(e) => handleRightClick(e, workspace)}
                    className={`w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      currentWorkspace?.id === workspace.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {workspace.name}
                      </span>
                    </div>
                    {currentWorkspace?.id === workspace.id && (
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          {workspaces.length === 0 && !isLoading && (
            <div className="p-8 text-center">
              <div className="mx-auto h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-3">
                <Building2 className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No workspaces yet</p>
              <button
                onClick={() => {
                  setShowCreateModal(true)
                  setIsOpen(false)
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Create your first workspace
              </button>
            </div>
          )}
          
          {isLoading && (
            <div className="p-8 text-center">
              <div className="mx-auto h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-3 animate-pulse">
                <Building2 className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Setting up workspace...</p>
            </div>
          )}
        </div>
      )}

      {/* Workspace Menu */}
      {showWorkspaceMenu && currentWorkspace && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50">
          {hasPermission(currentWorkspace.id, user?.uid, 'manage_members') && (
            <button
              onClick={() => {
                setShowMembersModal(currentWorkspace)
                setShowWorkspaceMenu(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <Users className="h-3 w-3" />
              <span>Manage Members</span>
            </button>
          )}
          {hasPermission(currentWorkspace.id, user?.uid, 'manage_members') && (
            <button
              onClick={() => {
                handleRename(currentWorkspace)
                setShowWorkspaceMenu(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <Edit2 className="h-3 w-3" />
              <span>Rename Workspace</span>
            </button>
          )}
          <button
            onClick={() => {
              // TODO: Implement leave workspace
              setShowWorkspaceMenu(false)
            }}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
          >
            <LogOut className="h-3 w-3" />
            <span>Leave Workspace</span>
          </button>
          {hasPermission(currentWorkspace.id, user?.uid, 'delete_workspace') && (
            <button
              onClick={() => {
                handleDelete(currentWorkspace)
                setShowWorkspaceMenu(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <Trash2 className="h-3 w-3" />
              <span>Delete Workspace</span>
            </button>
          )}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => handleManageMembers(contextMenu.workspace)}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
          >
            <Users className="h-3 w-3" />
            <span>Manage Members</span>
          </button>
          <button
            onClick={() => handleRename(contextMenu.workspace)}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
          >
            <Edit2 className="h-3 w-3" />
            <span>Rename Workspace</span>
          </button>
          <button
            onClick={() => handleDelete(contextMenu.workspace)}
            className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
          >
            <Trash2 className="h-3 w-3" />
            <span>Delete Workspace</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <DeleteWorkspaceModal
        isOpen={!!showDeleteModal}
        workspace={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />

      <MemberManagementModal
        isOpen={!!showMembersModal}
        workspace={showMembersModal}
        onClose={() => setShowMembersModal(false)}
      />
    </div>
  )
}