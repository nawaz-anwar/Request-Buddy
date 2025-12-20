import { create } from 'zustand'
import { doc, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../services/firebase'
import { firebaseUserService } from '../services/firebaseUserService'
import toast from 'react-hot-toast'

export const useUserStore = create((set, get) => ({
  // State
  userProfile: null,
  loading: false,
  error: null,
  
  // Real-time subscription
  unsubscribe: null,

  // Initialize user profile listener
  initialize: () => {
    const { unsubscribe } = get()
    
    // Clean up existing listener
    if (unsubscribe) {
      unsubscribe()
    }

    // Listen to auth state changes
    const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, listen to their profile
        get().subscribeToUserProfile(user.uid)
        
        // Ensure user profile exists in Firestore
        try {
          await firebaseUserService.createOrUpdateUserProfile(user)
        } catch (error) {
          console.error('Error ensuring user profile:', error)
        }
      } else {
        // User is signed out, clear profile
        set({ userProfile: null })
        
        // Clean up profile listener
        const { unsubscribe: profileUnsubscribe } = get()
        if (profileUnsubscribe) {
          profileUnsubscribe()
          set({ unsubscribe: null })
        }
      }
    })

    set({ unsubscribe: authUnsubscribe })
    return authUnsubscribe
  },

  // Subscribe to user profile changes
  subscribeToUserProfile: (uid) => {
    const { unsubscribe } = get()
    
    // Clean up existing listener
    if (unsubscribe) {
      unsubscribe()
    }

    // Listen to user profile document
    const userRef = doc(db, 'users', uid)
    const profileUnsubscribe = onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          const profileData = { id: doc.id, ...doc.data() }
          set({ userProfile: profileData, error: null })
        } else {
          set({ userProfile: null })
        }
      },
      (error) => {
        console.error('Error listening to user profile:', error)
        set({ error: error.message })
      }
    )

    set({ unsubscribe: profileUnsubscribe })
  },

  // Update display name
  updateDisplayName: async (displayName) => {
    set({ loading: true, error: null })
    
    try {
      const updatedName = await firebaseUserService.updateDisplayName(displayName)
      toast.success('Display name updated successfully!')
      return updatedName
    } catch (error) {
      const errorMessage = error.message || 'Failed to update display name'
      set({ error: errorMessage })
      toast.error(errorMessage)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // Update avatar
  updateAvatar: async (file) => {
    set({ loading: true, error: null })
    
    try {
      const photoURL = await firebaseUserService.updateAvatar(file)
      toast.success('Profile photo updated successfully!')
      return photoURL
    } catch (error) {
      const errorMessage = error.message || 'Failed to update profile photo'
      set({ error: errorMessage })
      toast.error(errorMessage)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // Remove avatar
  removeAvatar: async () => {
    set({ loading: true, error: null })
    
    try {
      await firebaseUserService.removeAvatar()
      toast.success('Profile photo removed successfully!')
      return null
    } catch (error) {
      const errorMessage = error.message || 'Failed to remove profile photo'
      set({ error: errorMessage })
      toast.error(errorMessage)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // Update password
  updatePassword: async (currentPassword, newPassword) => {
    set({ loading: true, error: null })
    
    try {
      await firebaseUserService.updatePassword(currentPassword, newPassword)
      toast.success('Password updated successfully!')
      return true
    } catch (error) {
      const errorMessage = error.message || 'Failed to update password'
      set({ error: errorMessage })
      toast.error(errorMessage)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // Get user profile
  getUserProfile: async (uid) => {
    set({ loading: true, error: null })
    
    try {
      const profile = await firebaseUserService.getUserProfile(uid)
      return profile
    } catch (error) {
      const errorMessage = error.message || 'Failed to get user profile'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },

  // Cleanup
  cleanup: () => {
    const { unsubscribe } = get()
    if (unsubscribe) {
      unsubscribe()
      set({ unsubscribe: null })
    }
    set({ userProfile: null, loading: false, error: null })
  }
}))