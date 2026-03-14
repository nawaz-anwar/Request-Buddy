import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { auth } from './firebase'

const storage = getStorage()

export const storageService = {
  // Upload user avatar
  uploadAvatar: async (file) => {
    if (!auth.currentUser) {
      throw new Error('User not authenticated')
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB')
    }

    const userId = auth.currentUser.uid
    const fileExtension = file.name.split('.').pop()
    const fileName = `avatar.${fileExtension}`
    const avatarRef = ref(storage, `users/${userId}/${fileName}`)

    try {
      // Upload file
      const snapshot = await uploadBytes(avatarRef, file)
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      return downloadURL
    } catch (error) {
      console.error('Error uploading avatar:', error)
      throw new Error('Failed to upload avatar')
    }
  },

  // Delete user avatar
  deleteAvatar: async (photoURL) => {
    if (!auth.currentUser || !photoURL) {
      return
    }

    try {
      // Extract path from URL
      const url = new URL(photoURL)
      const pathMatch = url.pathname.match(/\/o\/(.+)\?/)
      if (pathMatch) {
        const path = decodeURIComponent(pathMatch[1])
        const avatarRef = ref(storage, path)
        await deleteObject(avatarRef)
      }
    } catch (error) {
      console.error('Error deleting avatar:', error)
      // Don't throw error for delete operations
    }
  }
}