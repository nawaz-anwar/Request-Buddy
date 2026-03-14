import { create } from 'zustand'
import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useUserStore = create((set, get) => ({
  userProfiles: {}, // Cache of user profiles by UID
  loading: false,

  // Fetch a single user profile by UID
  getUserProfile: async (uid) => {
    if (!uid) return null

    // Check cache first
    const cached = get().userProfiles[uid]
    if (cached) {
      return cached
    }

    try {
      const userRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        const profile = {
          uid,
          ...userSnap.data()
        }
        
        // Update cache
        set(state => ({
          userProfiles: {
            ...state.userProfiles,
            [uid]: profile
          }
        }))
        
        return profile
      }
      
      return null
    } catch (error) {
      console.error('Failed to fetch user profile:', uid, error)
      return null
    }
  },

  // Fetch multiple user profiles by UIDs
  getUserProfiles: async (uids) => {
    if (!uids || uids.length === 0) return []

    const profiles = []
    const uncachedUids = []

    // Check cache first
    for (const uid of uids) {
      const cached = get().userProfiles[uid]
      if (cached) {
        profiles.push(cached)
      } else {
        uncachedUids.push(uid)
      }
    }

    // Fetch uncached profiles
    if (uncachedUids.length > 0) {
      try {
        set({ loading: true })
        
        // Fetch all uncached profiles
        const fetchedProfiles = await Promise.all(
          uncachedUids.map(uid => get().getUserProfile(uid))
        )
        
        profiles.push(...fetchedProfiles.filter(Boolean))
      } catch (error) {
        console.error('Failed to fetch user profiles:', error)
      } finally {
        set({ loading: false })
      }
    }

    return profiles
  },

  // Get user email by UID (convenience method)
  getUserEmail: async (uid) => {
    const profile = await get().getUserProfile(uid)
    return profile?.email || null
  },

  // Clear cache
  clearCache: () => {
    set({ userProfiles: {} })
  }
}))
