import { create } from 'zustand'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../services/firebase'
import toast from 'react-hot-toast'

export const useWorkspaceInviteStore = create((set, get) => ({
  pendingInvites: [],
  sentInvites: [],
  loading: false,
  unsubscribePending: null,
  unsubscribeSent: null,

  // Subscribe to pending invites for current user's email
  subscribeToPendingInvites: (userEmail) => {
    if (get().unsubscribePending) {
      get().unsubscribePending()
    }

    console.log('InviteStore: Subscribing to pending invites for:', userEmail)

    const q = query(
      collection(db, 'workspaceInvites'),
      where('email', '==', userEmail),
      where('status', '==', 'pending')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invites = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      console.log('InviteStore: Pending invites updated:', invites.length)
      set({ pendingInvites: invites })
    }, (error) => {
      console.error('InviteStore: Error subscribing to pending invites:', error)
    })

    set({ unsubscribePending: unsubscribe })
    return unsubscribe
  },

  // Subscribe to sent invites for workspaces where user is admin
  subscribeToSentInvites: (workspaceIds) => {
    if (get().unsubscribeSent) {
      get().unsubscribeSent()
    }

    if (!workspaceIds || workspaceIds.length === 0) {
      set({ sentInvites: [] })
      return
    }

    console.log('InviteStore: Subscribing to sent invites for workspaces:', workspaceIds)

    const q = query(
      collection(db, 'workspaceInvites'),
      where('workspaceId', 'in', workspaceIds)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invites = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      console.log('InviteStore: Sent invites updated:', invites.length)
      set({ sentInvites: invites })
    }, (error) => {
      console.error('InviteStore: Error subscribing to sent invites:', error)
    })

    set({ unsubscribeSent: unsubscribe })
    return unsubscribe
  },

  // Send workspace invitation
  sendInvitation: async (workspaceId, workspaceName, inviteeEmail, role, inviterUserId, inviterEmail) => {
    set({ loading: true })
    try {
      console.log('InviteStore: Sending invitation:', { workspaceId, inviteeEmail, role })

      // Check if invitation already exists
      const existingInvites = get().sentInvites.filter(
        invite => invite.workspaceId === workspaceId && 
                 invite.email === inviteeEmail.toLowerCase().trim() && 
                 invite.status === 'pending'
      )

      if (existingInvites.length > 0) {
        throw new Error('An invitation has already been sent to this email address')
      }

      const inviteData = {
        workspaceId,
        workspaceName,
        email: inviteeEmail.toLowerCase().trim(), // Use 'email' field as specified
        role,
        invitedBy: inviterUserId, // Use 'invitedBy' field as specified
        inviterEmail,
        status: 'pending',
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }

      const docRef = await addDoc(collection(db, 'workspaceInvites'), inviteData)
      
      console.log('InviteStore: Invitation sent with ID:', docRef.id)
      toast.success(`Invitation sent to ${inviteeEmail}`)
      return docRef.id
    } catch (error) {
      console.error('InviteStore: Failed to send invitation:', error)
      toast.error(error.message || 'Failed to send invitation')
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // Accept workspace invitation
  acceptInvitation: async (inviteId, userId, workspaceStore) => {
    set({ loading: true })
    try {
      console.log('InviteStore: Accepting invitation:', inviteId, 'for user:', userId)

      const invite = get().pendingInvites.find(inv => inv.id === inviteId)
      if (!invite) {
        throw new Error('Invitation not found')
      }

      // Use transaction to ensure atomicity
      await runTransaction(db, async (transaction) => {
        // Get workspace document
        const workspaceRef = doc(db, 'workspaces', invite.workspaceId)
        const workspaceDoc = await transaction.get(workspaceRef)
        
        if (!workspaceDoc.exists()) {
          throw new Error('Workspace not found')
        }

        const workspaceData = workspaceDoc.data()
        
        // Add user to workspace members
        const newMembers = { ...workspaceData.members, [userId]: invite.role }
        const newMemberIds = [...(workspaceData.memberIds || []), userId]

        // Update workspace
        transaction.update(workspaceRef, {
          members: newMembers,
          memberIds: newMemberIds,
          updatedAt: serverTimestamp()
        })

        // Update invitation status
        const inviteRef = doc(db, 'workspaceInvites', inviteId)
        transaction.update(inviteRef, {
          status: 'accepted',
          acceptedAt: serverTimestamp(),
          acceptedByUserId: userId
        })
      })

      console.log('InviteStore: Invitation accepted successfully')
      toast.success(`Joined workspace: ${invite.workspaceName}`)
      
      // Refresh workspace data
      if (workspaceStore?.subscribeToWorkspaces) {
        workspaceStore.subscribeToWorkspaces(userId)
      }

      return true
    } catch (error) {
      console.error('InviteStore: Failed to accept invitation:', error)
      toast.error(error.message || 'Failed to accept invitation')
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // Decline workspace invitation
  declineInvitation: async (inviteId) => {
    set({ loading: true })
    try {
      console.log('InviteStore: Declining invitation:', inviteId)

      const inviteRef = doc(db, 'workspaceInvites', inviteId)
      await updateDoc(inviteRef, {
        status: 'declined',
        declinedAt: serverTimestamp()
      })

      console.log('InviteStore: Invitation declined successfully')
      toast.success('Invitation declined')
      return true
    } catch (error) {
      console.error('InviteStore: Failed to decline invitation:', error)
      toast.error(error.message || 'Failed to decline invitation')
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // Delete workspace invitation (FEATURE 3)
  deleteInvitation: async (inviteId) => {
    set({ loading: true })
    try {
      console.log('InviteStore: Deleting invitation:', inviteId)

      const inviteRef = doc(db, 'workspaceInvites', inviteId)
      await updateDoc(inviteRef, {
        status: 'deleted',
        deletedAt: serverTimestamp()
      })

      console.log('InviteStore: Invitation deleted successfully')
      toast.success('Invitation deleted')
      return true
    } catch (error) {
      console.error('InviteStore: Failed to delete invitation:', error)
      toast.error(error.message || 'Failed to delete invitation')
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // Cancel/revoke invitation (admin only)
  cancelInvitation: async (inviteId) => {
    set({ loading: true })
    try {
      console.log('InviteStore: Canceling invitation:', inviteId)

      const inviteRef = doc(db, 'workspaceInvites', inviteId)
      await updateDoc(inviteRef, {
        status: 'cancelled',
        cancelledAt: serverTimestamp()
      })

      console.log('InviteStore: Invitation cancelled successfully')
      toast.success('Invitation cancelled')
      return true
    } catch (error) {
      console.error('InviteStore: Failed to cancel invitation:', error)
      toast.error(error.message || 'Failed to cancel invitation')
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // Get pending invites for a workspace (admin view)
  getPendingInvitesForWorkspace: (workspaceId) => {
    return get().sentInvites.filter(
      invite => invite.workspaceId === workspaceId && invite.status === 'pending'
    )
  },

  // Cleanup
  cleanup: () => {
    if (get().unsubscribePending) {
      get().unsubscribePending()
    }
    if (get().unsubscribeSent) {
      get().unsubscribeSent()
    }
    set({ 
      pendingInvites: [], 
      sentInvites: [],
      unsubscribePending: null, 
      unsubscribeSent: null 
    })
  }
}))