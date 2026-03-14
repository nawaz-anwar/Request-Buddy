import { create } from 'zustand'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
    
    // Check for redirect result (Google sign-in redirect)
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          console.log('✅ Redirect result received:', result.user.email)
          await get().createUserProfile(result.user)
          set({ user: result.user, loading: false })
          toast.success('Signed in with Google!')
        }
      })
      .catch((error) => {
        console.error('❌ Redirect result error:', error)
        if (error.code !== 'auth/popup-closed-by-user') {
          toast.error(error.message)
        }
      })
    
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
      
      const { displayName, email, photoURL } = user
      const now = new Date()
      
      if (!userSnap.exists()) {
        // Create new user profile
        await setDoc(userRef, {
          uid: user.uid,
          displayName: displayName || '',
          email,
          photoURL: photoURL || null,
          createdAt: now,
          updatedAt: now,
          ...additionalData
        })
        console.log('✅ User profile created successfully for:', email)
      } else {
        // Update existing profile with latest auth data
        await updateDoc(userRef, {
          email, // Always update email in case it changed
          displayName: displayName || userSnap.data().displayName || '',
          photoURL: photoURL || userSnap.data().photoURL || null,
          updatedAt: now
        })
        console.log('✅ User profile updated successfully for:', email)
      }
      
      return userRef
    } catch (error) {
      console.error('❌ Error creating/updating user profile:', error)
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
      console.log('🔵 Starting Google sign-in with popup...')
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      console.log('✅ Google sign-in successful:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      })
      
      // Create/update user profile
      await get().createUserProfile(user)
      
      // Manually update the store state to ensure immediate redirect
      set({ user, loading: false })
      toast.success('Signed in with Google!')
      return user
    } catch (error) {
      console.error('❌ Google sign in error:', error)
      
      // Handle specific error codes
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in cancelled')
      } else if (error.code === 'auth/popup-blocked') {
        // Fallback to redirect if popup is blocked
        console.log('🔄 Popup blocked, trying redirect method...')
        toast.info('Redirecting to Google sign-in...')
        try {
          await signInWithRedirect(auth, googleProvider)
          // The redirect will happen, and result will be handled in initialize()
          return null
        } catch (redirectError) {
          console.error('❌ Redirect also failed:', redirectError)
          toast.error('Failed to sign in with Google')
          throw redirectError
        }
      } else if (error.code === 'auth/cancelled-popup-request') {
        toast.error('Sign-in cancelled')
      } else if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname
        toast.error(`Domain "${currentDomain}" is not authorized. Check console for fix.`, { duration: 5000 })
        console.error('⚠️ UNAUTHORIZED DOMAIN ERROR')
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error(`Current domain: ${currentDomain}`)
        console.error('')
        console.error('🔧 HOW TO FIX:')
        console.error('1. Go to: https://console.firebase.google.com/project/teamapi-96507/authentication/settings')
        console.error('2. Scroll to "Authorized domains"')
        console.error(`3. Click "Add domain" and enter: ${currentDomain}`)
        console.error('4. Click "Add" and refresh this page')
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      } else {
        toast.error(error.message || 'Failed to sign in with Google')
      }
      
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