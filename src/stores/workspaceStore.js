import { create } from 'zustand'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy
} from 'firebase/firestore'
import { db } from '../services/firebase'
import toast from 'react-hot-toast'

export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  loading: false,
  unsubscribe: null,
  migrationComplete: false,

  // Listen to workspaces for current user
  subscribeToWorkspaces: (userId) => {
    if (get().unsubscribe) {
      get().unsubscribe()
    }

    // First, try to get all workspaces for the user (simplified query)
    const q = query(
      collection(db, 'workspaces'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // Filter workspaces where user is a member
      const allWorkspaces = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      const userWorkspaces = allWorkspaces.filter(workspace => 
        workspace.ownerId === userId || 
        workspace.memberIds?.includes(userId) ||
        workspace.members?.[userId]
      )
      
      console.log('📊 Found', userWorkspaces.length, 'workspaces for user')
      
      // Auto-migrate workspaces missing proper member structure
      if (!get().migrationComplete) {
        console.log('🔄 Starting workspace migration check...')
        await get().migrateWorkspaces(userId, userWorkspaces)
        set({ migrationComplete: true })
      }
      
      // If no workspaces exist, create a default one
      if (userWorkspaces.length === 0 && get().migrationComplete) {
        console.log('🏗️ No workspaces found, creating default workspace...')
        try {
          await get().createWorkspace('My Workspace', userId)
          return // The creation will trigger another snapshot
        } catch (error) {
          console.error('❌ Failed to create default workspace:', error)
        }
      }
      
      set({ workspaces: userWorkspaces })
      
      // Try to restore last workspace from localStorage
      const lastWorkspaceId = localStorage.getItem('lastWorkspaceId')
      const lastWorkspace = lastWorkspaceId 
        ? userWorkspaces.find(w => w.id === lastWorkspaceId)
        : null
      
      // Set current workspace
      if (!get().currentWorkspace && userWorkspaces.length > 0) {
        if (lastWorkspace) {
          console.log('🔄 Restoring last workspace from localStorage:', lastWorkspace.name)
          set({ currentWorkspace: lastWorkspace })
        } else {
          console.log('🎯 Setting current workspace to:', userWorkspaces[0].name)
          set({ currentWorkspace: userWorkspaces[0] })
        }
      }
    })

    set({ unsubscribe })
    return unsubscribe
  },

  // Migrate existing workspaces to have proper member structure
  migrateWorkspaces: async (userId, workspaces) => {
    console.log('🔍 Checking', workspaces.length, 'workspaces for migration...')
    
    for (const workspace of workspaces) {
      let needsUpdate = false
      const updates = {}

      // Check if members object exists and has current user
      if (!workspace.members || !workspace.members[userId]) {
        console.log('📝 Migrating workspace:', workspace.name, '- adding members object')
        updates.members = { [userId]: 'admin' }
        needsUpdate = true
      }

      // Check if memberIds array exists and contains current user
      if (!workspace.memberIds || !workspace.memberIds.includes(userId)) {
        console.log('📝 Migrating workspace:', workspace.name, '- adding memberIds array')
        updates.memberIds = [userId]
        needsUpdate = true
      }

      // Check if ownerId exists
      if (!workspace.ownerId) {
        console.log('📝 Migrating workspace:', workspace.name, '- adding ownerId')
        updates.ownerId = userId
        needsUpdate = true
      }

      // Apply updates if needed
      if (needsUpdate) {
        try {
          console.log('💾 Updating workspace:', workspace.name, 'with:', updates)
          await updateDoc(doc(db, 'workspaces', workspace.id), {
            ...updates,
            updatedAt: new Date()
          })
          console.log('✅ Successfully migrated workspace:', workspace.name)
        } catch (error) {
          console.error('❌ Failed to migrate workspace:', workspace.name, error)
        }
      }
    }
    
    console.log('🎉 Workspace migration complete!')
  },

  // Create new workspace
  createWorkspace: async (name, userId) => {
    set({ loading: true })
    try {
      console.log('WorkspaceStore: Creating workspace:', name, 'for user:', userId)
      const docRef = await addDoc(collection(db, 'workspaces'), {
        name,
        ownerId: userId,
        createdAt: new Date(),
        members: { [userId]: 'admin' },
        memberIds: [userId]
      })
      
      console.log('WorkspaceStore: Workspace created with ID:', docRef.id)
      toast.success('Workspace created successfully!')
      return docRef.id
    } catch (error) {
      console.error('WorkspaceStore: Failed to create workspace:', error)
      toast.error('Failed to create workspace: ' + error.message)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // Update workspace
  updateWorkspace: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'workspaces', id), {
        ...updates,
        updatedAt: new Date()
      })
      toast.success('Workspace updated successfully!')
    } catch (error) {
      toast.error('Failed to update workspace')
      console.error(error)
    }
  },

  // Delete workspace
  deleteWorkspace: async (id) => {
    try {
      await deleteDoc(doc(db, 'workspaces', id))
      toast.success('Workspace deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete workspace')
      console.error(error)
    }
  },

  // Set current workspace
  setCurrentWorkspace: (workspace) => {
    set({ currentWorkspace: workspace })
    // Save to localStorage for persistence
    if (workspace?.id) {
      localStorage.setItem('lastWorkspaceId', workspace.id)
      console.log('💾 Saved last workspace to localStorage:', workspace.id)
    }
  },

  // Get user role in workspace
  getUserRole: (workspaceId, userId) => {
    const workspace = get().workspaces.find(w => w.id === workspaceId)
    return workspace?.members?.[userId] || null
  },

  // Check if user has permission
  hasPermission: (workspaceId, userId, action) => {
    const role = get().getUserRole(workspaceId, userId)
    if (!role) return false

    switch (action) {
      case 'read':
        return ['admin', 'editor', 'viewer'].includes(role)
      case 'write':
        return ['admin', 'editor'].includes(role)
      case 'manage_members':
        return role === 'admin'
      case 'delete_workspace':
        return role === 'admin'
      default:
        return false
    }
  },

  // Send workspace invitation (replaces direct user addition)
  sendInvitation: async (workspaceId, email, role, currentUserId, inviteStore) => {
    console.log('🚀 Sending workspace invitation:', { workspaceId, email, role, currentUserId })
    
    try {
      // Check if current user has permission
      if (!get().hasPermission(workspaceId, currentUserId, 'manage_members')) {
        throw new Error('You do not have permission to invite users')
      }

      const workspace = get().workspaces.find(w => w.id === workspaceId)
      if (!workspace) {
        throw new Error('Workspace not found')
      }

      // Get current user info
      const currentUser = get().getCurrentUser?.() || { email: 'unknown@example.com' }

      // Use the invite store to send invitation
      const inviteId = await inviteStore.sendInvitation(
        workspaceId,
        workspace.name,
        email,
        role,
        currentUserId,
        currentUser.email
      )

      console.log('✅ Invitation sent successfully:', inviteId)
      return inviteId
    } catch (error) {
      console.error('❌ Failed to send invitation:', error)
      throw error
    }
  },

  // Remove user from workspace
  removeUser: async (workspaceId, userIdToRemove, currentUserId) => {
    try {
      const workspace = get().workspaces.find(w => w.id === workspaceId)
      if (!workspace) {
        throw new Error('Workspace not found')
      }

      // Check permissions
      if (!get().hasPermission(workspaceId, currentUserId, 'manage_members')) {
        throw new Error('You do not have permission to remove users')
      }

      // Prevent removing the owner
      if (workspace.ownerId === userIdToRemove) {
        throw new Error('Cannot remove the workspace owner')
      }

      // Prevent removing self if you are the only admin
      const adminCount = Object.values(workspace.members).filter(role => role === 'admin').length
      if (userIdToRemove === currentUserId && adminCount <= 1) {
        throw new Error('Cannot remove yourself as the last admin')
      }

      // Remove user from workspace
      const newMembers = { ...workspace.members }
      delete newMembers[userIdToRemove]
      const newMemberIds = workspace.memberIds.filter(id => id !== userIdToRemove)

      await updateDoc(doc(db, 'workspaces', workspaceId), {
        members: newMembers,
        memberIds: newMemberIds,
        updatedAt: new Date()
      })

      toast.success('User removed from workspace')
    } catch (error) {
      console.error('Failed to remove user:', error)
      toast.error(error.message || 'Failed to remove user')
      throw error
    }
  },

  // Change user role
  changeUserRole: async (workspaceId, userIdToChange, newRole, currentUserId) => {
    try {
      const workspace = get().workspaces.find(w => w.id === workspaceId)
      if (!workspace) {
        throw new Error('Workspace not found')
      }

      // Check permissions
      if (!get().hasPermission(workspaceId, currentUserId, 'manage_members')) {
        throw new Error('You do not have permission to change user roles')
      }

      // Prevent changing owner role
      if (workspace.ownerId === userIdToChange && newRole !== 'admin') {
        throw new Error('Cannot change the owner role from admin')
      }

      // Update user role
      const newMembers = { ...workspace.members, [userIdToChange]: newRole }

      await updateDoc(doc(db, 'workspaces', workspaceId), {
        members: newMembers,
        updatedAt: new Date()
      })

      toast.success('User role updated successfully')
    } catch (error) {
      console.error('Failed to change user role:', error)
      toast.error(error.message || 'Failed to change user role')
      throw error
    }
  },

  // Cleanup
  cleanup: () => {
    if (get().unsubscribe) {
      get().unsubscribe()
    }
    // Clear localStorage on logout
    localStorage.removeItem('lastWorkspaceId')
    console.log('🧹 Cleared last workspace from localStorage')
    set({ workspaces: [], currentWorkspace: null, unsubscribe: null, migrationComplete: false })
  }
}))