import { useState, useEffect } from 'react'
import { 
  Mail, 
  X, 
  Check, 
  Clock, 
  UserPlus,
  AlertCircle,
  Trash2
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useWorkspaceInviteStore } from '../../stores/workspaceInviteStore'

export default function WorkspaceInvitationsModal({ isOpen, onClose }) {
  const { user } = useAuthStore()
  const { 
    pendingInvites, 
    acceptInvitation, 
    declineInvitation,
    loading 
  } = useWorkspaceInviteStore()

  const [processingInvite, setProcessingInvite] = useState(null)

  const handleAcceptInvite = async (invite) => {
    if (!user?.uid) return
    
    setProcessingInvite(invite.id)
    try {
      // We need to pass the workspace store to update workspace data
      const { useWorkspaceStore } = await import('../../stores/workspaceStore')
      await acceptInvitation(invite.id, user.uid, useWorkspaceStore.getState())
    } catch (error) {
      console.error('Failed to accept invitation:', error)
    } finally {
      setProcessingInvite(null)
    }
  }

  const handleDeclineInvite = async (invite) => {
    setProcessingInvite(invite.id)
    try {
      await declineInvitation(invite.id)
    } catch (error) {
      console.error('Failed to decline invitation:', error)
    } finally {
      setProcessingInvite(null)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString()
  }

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false
    const expiry = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt)
    return expiry < new Date()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Workspace Invitations
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {pendingInvites.length} pending invitation{pendingInvites.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col max-h-[calc(90vh-80px)]">
          {pendingInvites.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Pending Invitations
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  You don't have any workspace invitations at the moment.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {pendingInvites.map((invite) => {
                  const expired = isExpired(invite.expiresAt)
                  const processing = processingInvite === invite.id

                  return (
                    <div
                      key={invite.id}
                      className={`p-4 border rounded-lg transition-all ${
                        expired 
                          ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10' 
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <UserPlus className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {invite.workspaceName}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Invited by {invite.inviterEmail}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>Invited {formatDate(invite.createdAt)}</span>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              invite.role === 'admin' 
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                : invite.role === 'editor'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}>
                              {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                            </div>
                            {expired && (
                              <div className="flex items-center space-x-1 text-red-500">
                                <AlertCircle className="h-3 w-3" />
                                <span>Expired</span>
                              </div>
                            )}
                          </div>

                          {expired && (
                            <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                              This invitation has expired. Please ask the workspace admin to send a new invitation.
                            </p>
                          )}
                        </div>

                        {!expired && (
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleDeclineInvite(invite)}
                              disabled={processing}
                              className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 border border-gray-300 dark:border-gray-600 rounded-md hover:border-red-300 dark:hover:border-red-600 transition-colors disabled:opacity-50"
                            >
                              {processing ? 'Processing...' : 'Decline'}
                            </button>
                            <button
                              onClick={() => handleAcceptInvite(invite)}
                              disabled={processing}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center space-x-1"
                            >
                              <Check className="h-3 w-3" />
                              <span>{processing ? 'Joining...' : 'Accept'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}