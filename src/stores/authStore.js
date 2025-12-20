import { create } from 'zustand'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '../services/firebase'
import toast from 'react-hot-toast'

// Initialize auth listener outside of the store to prevent re-initialization
let authInitialized = false
let authUnsubscribe = null

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  
  // Initialize auth listener
  initialize: () => {
    if (authInitialized) {
      return authUnsubscribe || (() => {})
    }
    
    authInitialized = true
    console.log('Initializing Firebase Auth...')
    
    authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out')
      try {
        if (user) {
          await get().createUserProfile(user)
        }
        set({ user, loading: false })
      } catch (error) {
        console.error('Auth state change error:', error)
        set({ user: null, loading: false })
      }
    }, (error) => {
      console.error('Auth listener error:', error)
      set({ user: null, loading: false })
    })
    
    return authUnsubscribe
  },

  // Create user profile in Firestore
  createUserProfile: async (user, additionalData = {}) => {
    if (!user) return
    
    try {
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      
      if (!userSnap.exists()) {
        const { displayName, email, photoURL } = user
        const createdAt = new Date()
        
        await setDoc(userRef, {
          uid: user.uid,
          displayName: displayName || '',
          email,
          photoURL: photoURL || null,
          createdAt,
          updatedAt: createdAt,
          ...additionalData
        })
        console.log('User profile created successfully')
      } else {
        // Update existing profile with latest auth data
        await updateDoc(userRef, {
          displayName: user.displayName || userSnap.data().displayName || '',
          photoURL: user.photoURL || userSnap.data().photoURL || null,
          updatedAt: new Date()
        })
      }
      
      return userRef
    } catch (error) {
      console.error('Error creating user profile:', error)
      // Don't throw error, just log it
    }
  },

  // Sign up with email and password
  signUp: async (email, password, displayName) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(user, { displayName })
      await get().createUserProfile(user)
      console.log('Sign up successful, user:', user)
      // Manually update the store state to ensure immediate redirect
      set({ user, loading: false })
      toast.success('Account created successfully!')
      return user
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error(error.message)
      throw error
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      console.log('Sign in successful, user:', user)
      // Manually update the store state to ensure immediate redirect
      set({ user, loading: false })
      toast.success('Signed in successfully!')
      return user
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error(error.message)
      throw error
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      const { user } = await signInWithPopup(auth, googleProvider)
      await get().createUserProfile(user)
      console.log('Google sign in successful, user:', user)
      // Manually update the store state to ensure immediate redirect
      set({ user, loading: false })
      toast.success('Signed in with Google!')
      return user
    } catch (error) {
      console.error('Google sign in error:', error)
      toast.error(error.message)
      throw error
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth)
      set({ user: null })
      toast.success('Signed out successfully!')
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }
}))