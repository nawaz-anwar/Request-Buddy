import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuthStore } from '../stores/authStore'
import { useWorkspaceStore } from '../stores/workspaceStore'
import { 
  Mail, 
  Check, 
  X, 
  AlertCircle, 
  Clock, 
  Building2,
  UserPlus,
  Loader
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function InviteAcceptPage() {
  const { inviteId } = useParams()
  const navigate = useNavigate()
  const { user, signIn } = useAuthStore()
  const { subscribeToWorkspaces } = useWorkspaceStore()
  
  const [invite, setInvite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  // Load invite data
  useEffect(() => {
    const loadInvite = async () => {
      if (!inviteId) {
        setError('Invalid invitation link')
        setLoading(false)
        return
      }

      try {
        console.log('Loading invite:', inviteId)
        const inviteDoc = await getDoc(doc(db, 'workspaceInvites', inviteId))
        
        if (!inviteDoc.exists()) {
          setError('Invitation not found or has expired')
          setLoading(false)
          return
        }

        const inviteData = { id: inviteDoc.id, ...inviteDoc.data() }
        console.log('Invite loaded:', inviteData)

        // Check if invite is valid
        if (inviteData.status !== 'pending') {
          setError(`This invitation has already been ${inviteData.status}`)
          setLoading(false)
          return
        }

        // Check if expired
        const expiresAt = inviteData.expiresAt?.toDate?.() || new Date(inviteData.expiresAt)
        if (expiresAt < new Date()) {
          setError('This invitation has expired')
          setLoading(false)
          return
        }

        setInvite(inviteData)
      } catch (error) {
        console.error('Failed to load invite:', error)
        setError('Failed to load invitation')
      } finally {
        setLoading(false)
      }
    }

    loadInvite()
  }, [inviteId])

  // Check if user email matches invite email
  const emailMatches = user?.email?.toLowerCase() === invite?.email?.toLowerCase()

  const handleAcceptInvite = async () => {
    if (!user || !invite || !emailMatches) return

    setProcessing(true)
    try {
      console.log('Accepting invitation:', invite.id)

      // Use transaction to ensure atomicity
      await runTransaction(db, async (transaction) => {
        // Get workspace document
        const workspaceRef = doc(db, 'workspaces', invite.workspaceId)
        const workspaceDoc = await transaction.get(workspaceRef)
        
        if (!workspaceDoc.exists()) {
          throw new Error('Workspace not found')
        }

        const workspaceData = workspaceDoc.data()
        
        // Check if user is already a member
        if (workspaceData.members?.[user.uid]) {
          throw new Error('You are already a member of this workspace')
        }

        // Add user to workspace members
        const newMembers = { ...workspaceData.members, [user.uid]: invite.role }
        const newMemberIds = [...(workspaceData.memberIds || []), user.uid]

        // Update workspace
        transaction.update(workspaceRef, {
          members: newMembers,
          memberIds: newMemberIds,
          updatedAt: serverTimestamp()
        })

        // Update invitation status
        const inviteRef = doc(db, 'workspaceInvites', invite.id)
        transaction.update(inviteRef, {
          status: 'accepted',
          acceptedAt: serverTimestamp(),
          acceptedByUserId: user.uid
        })
      })

      console.log('Invitation accepted successfully')
      toast.success(`Welcome to ${invite.workspaceName}!`)
      
      // Refresh workspace data
      if (user.uid) {
        subscribeToWorkspaces(user.uid)
      }

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/')
      }, 2000)

    } catch (error) {
      console.error('Failed to accept invitation:', error)
      toast.error(error.message || 'Failed to accept invitation')
    } finally {
      setProcessing(false)
    }
  }

  const handleDeclineInvite = async () => {
    if (!invite) return

    setProcessing(true)
    try {
      console.log('Declining invitation:', invite.id)

      const inviteRef = doc(db, 'workspaceInvites', invite.id)
      await updateDoc(inviteRef, {
        status: 'declined',
        declinedAt: serverTimestamp()
      })

      console.log('Invitation declined successfully')
      toast.success('Invitation declined')
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/')
      }, 2000)

    } catch (error) {
      console.error('Failed to decline invitation:', error)
      toast.error(error.message || 'Failed to decline invitation')
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="mx-auto h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Invalid Invitation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="mx-auto h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
            <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sign In Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to accept this workspace invitation.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (!emailMatches) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="mx-auto h-16 w-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Email Mismatch
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            This invitation was sent to:
          </p>
          <p className="font-medium text-gray-900 dark:text-white mb-2">
            {invite.email}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            But you're signed in as: {user.email}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/auth')}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Sign In with Correct Email
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-lg mx-auto p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Workspace Invitation
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You've been invited to collaborate
            </p>
          </div>

          {/* Invitation Details */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {invite.workspaceName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Invited by {invite.inviterEmail}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Role</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {invite.role}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Invited</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(invite.createdAt)}
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-blue-800 dark:text-blue-200">
                <Clock className="h-4 w-4" />
                <span>
                  Expires on {formatDate(invite.expiresAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={handleDeclineInvite}
              disabled={processing}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>{processing ? 'Processing...' : 'Decline'}</span>
            </button>
            <button
              onClick={handleAcceptInvite}
              disabled={processing}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>{processing ? 'Joining...' : 'Accept Invitation'}</span>
            </button>
          </div>

          {/* Role Description */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)} Permissions
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {invite.role === 'admin' && 'Full access to manage workspace, members, and all content'}
              {invite.role === 'editor' && 'Can create, edit, and delete collections and requests'}
              {invite.role === 'viewer' && 'Read-only access to workspace content'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}