import { useState, useEffect } from 'react'
import { 
  Users, 
  X, 
  Plus, 
  Mail, 
  Shield, 
  Edit, 
  Trash2, 
  Crown,
  Eye,
  UserCheck
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useWorkspaceInviteStore } from '../../stores/workspaceInviteStore'
import { useUserStore } from '../../stores/userStore'

const ROLES = {
  admin: {
    label: 'Admin',
    icon: Shield,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    description: 'Can manage members, create/edit/delete content'
  },
  editor: {
    label: 'Editor', 
    icon: Edit,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    description: 'Can create/edit/delete collections and requests'
  },
  viewer: {
    label: 'Viewer',
    icon: Eye,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    description: 'Read-only access to workspace content'
  }
}

export default function MemberManagementModal({ isOpen, workspace, onClose }) {
  const { user } = useAuthStore()
  const { 
    removeUser, 
    changeUserRole, 
    hasPermission,
    getUserRole,
    sendInvitation
  } = useWorkspaceStore()
  const { 
    getPendingInvitesForWorkspace,
    cancelInvitation,
    loading: inviteLoading
  } = useWorkspaceInviteStore()
  const { getUserProfiles } = useUserStore()
  
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('editor')
  const [inviting, setInviting] = useState(false)
  const [members, setMembers] = useState([])
  const [pendingInvites, setPendingInvites] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(false)

  // Load member details with real emails from Firestore
  useEffect(() => {
    const loadMemberDetails = async () => {
      if (!workspace?.members) return

      setLoadingMembers(true)
      try {
        const memberUids = Object.keys(workspace.members)
        console.log('📋 Loading member details for UIDs:', memberUids)
        
        // Fetch all user profiles
        const userProfiles = await getUserProfiles(memberUids)
        console.log('✅ Fetched user profiles:', userProfiles)
        
        // Create member list with real emails
        const memberList = memberUids.map(uid => {
          const profile = userProfiles.find(p => p.uid === uid)
          const role = workspace.members[uid]
          
          // Determine email with proper fallback logic
          let email
          if (profile?.email) {
            // Use profile email if available
            email = profile.email
          } else if (uid === user?.uid) {
            // Use current user's email only for current user
            email = user.email
          } else {
            // Last resort fallback - this should rarely happen
            email = `user-${uid.slice(0, 8)}@example.com`
            console.warn('⚠️ No profile found for UID:', uid, '- using fallback email')
          }
          
          return {
            uid,
            role,
            email,
            displayName: profile?.displayName || null,
            photoURL: profile?.photoURL || null,
            isOwner: uid === workspace.ownerId
          }
        })
        
        console.log('👥 Member list with emails:', memberList)
        
        // Remove duplicates based on UID (should not happen, but safety check)
        const uniqueMembers = memberList.filter((member, index, self) =>
          index === self.findIndex(m => m.uid === member.uid)
        )
        
        if (uniqueMembers.length !== memberList.length) {
          console.warn('⚠️ Removed duplicate members:', memberList.length - uniqueMembers.length)
        }
        
        setMembers(uniqueMembers)
      } catch (error) {
        console.error('❌ Failed to load member details:', error)
        // Fallback to basic member list
        const memberList = Object.entries(workspace.members).map(([uid, role]) => ({
          uid,
          role,
          email: uid === user?.uid ? user.email : `user-${uid.slice(0, 8)}@example.com`,
          isOwner: uid === workspace.ownerId
        }))
        setMembers(memberList)
      } finally {
        setLoadingMembers(false)
      }
    }

    loadMemberDetails()
  }, [workspace, user, getUserProfiles])

  // Load pending invites
  useEffect(() => {
    if (workspace?.id) {
      const invites = getPendingInvitesForWorkspace(workspace.id)
      setPendingInvites(invites)
    }
  }, [workspace?.id, getPendingInvitesForWorkspace])

  const currentUserRole = getUserRole(workspace?.id, user?.uid)
  const canManageMembers = hasPermission(workspace?.id, user?.uid, 'manage_members')

  const handleInviteUser = async (e) => {
    e.preventDefault()
    
    if (!inviteEmail.trim()) return
    
    console.log('🎯 Starting user invitation process:', { email: inviteEmail.trim(), role: inviteRole })
    
    setInviting(true)
    try {
      const inviteStore = useWorkspaceInviteStore.getState()
      await sendInvitation(workspace.id, inviteEmail.trim(), inviteRole, user.uid, inviteStore)
      console.log('✅ Invitation sent successfully')
      setInviteEmail('')
      setInviteRole('editor')
      
      // Refresh pending invites
      const updatedInvites = getPendingInvitesForWorkspace(workspace.id)
      setPendingInvites(updatedInvites)
    } catch (error) {
      console.error('❌ Failed to send invitation:', error)
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveUser = async (userUid) => {
    if (!confirm('Are you sure you want to remove this user from the workspace?')) return
    
    setLoading(true)
    try {
      await removeUser(workspace.id, userUid, user.uid)
    } catch (error) {
      console.error('Failed to remove user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangeRole = async (userUid, newRole) => {
    setLoading(true)
    try {
      await changeUserRole(workspace.id, userUid, newRole, user.uid)
    } catch (error) {
      console.error('Failed to change role:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!inviting && !loading) {
      setInviteEmail('')
      setInviteRole('editor')
      onClose()
    }
  }

  if (!isOpen || !workspace) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Manage Members
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {workspace.name} • {members.length} member{members.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={inviting || loading}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col max-h-[calc(90vh-80px)]">
          {/* Invite Section */}
          {canManageMembers && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Invite New Member
              </h4>
              
              <form onSubmit={handleInviteUser} className="space-y-4">
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Enter email address..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={inviting}
                      />
                    </div>
                  </div>
                  
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={inviting}
                  >
                    {Object.entries(ROLES).map(([key, role]) => (
                      <option key={key} value={key}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    type="submit"
                    disabled={inviting || !inviteEmail.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{inviting ? 'Inviting...' : 'Invite'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Pending Invitations ({pendingInvites.length})
              </h4>
              
              <div className="space-y-3">
                {pendingInvites.map((invite) => {
                  const roleInfo = ROLES[invite.role]
                  const RoleIcon = roleInfo.icon
                  
                  return (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                          <Mail className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {invite.email}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${roleInfo.bgColor} ${roleInfo.color}`}>
                              <RoleIcon className="h-3 w-3" />
                              <span>{roleInfo.label}</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Invited {new Date(invite.createdAt?.toDate?.() || invite.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {canManageMembers && (
                        <button
                          onClick={() => cancelInvitation(invite.id)}
                          disabled={inviteLoading}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                          title="Cancel invitation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Current Members
              </h4>
              
              {loadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">Loading members...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => {
                  const roleInfo = ROLES[member.role]
                  const RoleIcon = roleInfo.icon
                  const canRemove = canManageMembers && !member.isOwner && member.uid !== user.uid
                  const canChangeRole = canManageMembers && !member.isOwner
                  
                  return (
                    <div
                      key={member.uid}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {member.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {member.email}
                            </p>
                            {member.isOwner && (
                              <Crown className="h-4 w-4 text-yellow-500" title="Workspace Owner" />
                            )}
                            {member.uid === user.uid && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">(You)</span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-1">
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${roleInfo.bgColor} ${roleInfo.color}`}>
                              <RoleIcon className="h-3 w-3" />
                              <span>{roleInfo.label}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {canChangeRole && (
                          <select
                            value={member.role}
                            onChange={(e) => handleChangeRole(member.uid, e.target.value)}
                            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={loading}
                          >
                            {Object.entries(ROLES).map(([key, role]) => (
                              <option key={key} value={key}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        )}
                        
                        {canRemove && (
                          <button
                            onClick={() => handleRemoveUser(member.uid)}
                            disabled={loading}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Remove user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              )}
            </div>
          </div>

          {/* Role Descriptions */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Role Permissions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(ROLES).map(([key, role]) => {
                const RoleIcon = role.icon
                return (
                  <div key={key} className="flex items-start space-x-2">
                    <div className={`p-1 rounded ${role.bgColor}`}>
                      <RoleIcon className={`h-3 w-3 ${role.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {role.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {role.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}