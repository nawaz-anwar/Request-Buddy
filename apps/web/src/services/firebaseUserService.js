import { 
  updateProfile, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from 'firebase/auth'
import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'
import { storageService } from './storageService'

export const firebaseUserService = {
  // Get user profile from Firestore
  getUserProfile: async (uid) => {
    try {
      const userRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() }
      }
      
      return null
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw new Error('Failed to get user profile')
    }
  },

  // Update user display name
  updateDisplayName: async (displayName) => {
    if (!auth.currentUser) {
      throw new Error('User not authenticated')
    }

    if (!displayName || displayName.trim().length === 0) {
      throw new Error('Display name cannot be empty')
    }

    const trimmedName = displayName.trim()
    
    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: trimmedName
      })

      // Update Firestore document
      const userRef = doc(db, 'users', auth.currentUser.uid)
      await updateDoc(userRef, {
        displayName: trimmedName,
        updatedAt: serverTimestamp()
      })

      return trimmedName
    } catch (error) {
      console.error('Error updating display name:', error)
      throw new Error('Failed to update display name')
    }
  },

  // Update user avatar
  updateAvatar: async (file) => {
    if (!auth.currentUser) {
      throw new Error('User not authenticated')
    }

    try {
      // Delete old avatar if exists
      const currentUser = auth.currentUser
      if (currentUser.photoURL) {
        await storageService.deleteAvatar(currentUser.photoURL)
      }

      // Upload new avatar
      const photoURL = await storageService.uploadAvatar(file)

      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        photoURL
      })

      // Update Firestore document
      const userRef = doc(db, 'users', currentUser.uid)
      await updateDoc(userRef, {
        photoURL,
        updatedAt: serverTimestamp()
      })

      return photoURL
    } catch (error) {
      console.error('Error updating avatar:', error)
      throw error
    }
  },

  // Remove user avatar
  removeAvatar: async () => {
    if (!auth.currentUser) {
      throw new Error('User not authenticated')
    }

    try {
      const currentUser = auth.currentUser
      
      // Delete avatar from storage
      if (currentUser.photoURL) {
        await storageService.deleteAvatar(currentUser.photoURL)
      }

      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        photoURL: null
      })

      // Update Firestore document
      const userRef = doc(db, 'users', currentUser.uid)
      await updateDoc(userRef, {
        photoURL: null,
        updatedAt: serverTimestamp()
      })

      return null
    } catch (error) {
      console.error('Error removing avatar:', error)
      throw new Error('Failed to remove avatar')
    }
  },

  // Update user password
  updatePassword: async (currentPassword, newPassword) => {
    if (!auth.currentUser) {
      throw new Error('User not authenticated')
    }

    if (!currentPassword || !newPassword) {
      throw new Error('Current password and new password are required')
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long')
    }

    try {
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      )
      
      await reauthenticateWithCredential(auth.currentUser, credential)

      // Update password
      await updatePassword(auth.currentUser, newPassword)

      // Update Firestore document
      const userRef = doc(db, 'users', auth.currentUser.uid)
      await updateDoc(userRef, {
        updatedAt: serverTimestamp()
      })

      return true
    } catch (error) {
      console.error('Error updating password:', error)
      
      if (error.code === 'auth/wrong-password') {
        throw new Error('Current password is incorrect')
      } else if (error.code === 'auth/weak-password') {
        throw new Error('New password is too weak')
      } else if (error.code === 'auth/requires-recent-login') {
        throw new Error('Please log out and log back in before changing your password')
      }
      
      throw new Error('Failed to update password')
    }
  },

  // Create or update user profile in Firestore
  createOrUpdateUserProfile: async (user, additionalData = {}) => {
    if (!user) return null

    try {
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || null,
        updatedAt: serverTimestamp(),
        ...additionalData
      }

      if (!userSnap.exists()) {
        // Create new user profile
        userData.createdAt = serverTimestamp()
      }

      if (!userSnap.exists()) {
        await setDoc(userRef, userData)
      } else {
        await updateDoc(userRef, userData)
      }
      return userData
    } catch (error) {
      console.error('Error creating/updating user profile:', error)
      throw new Error('Failed to update user profile')
    }
  }
}