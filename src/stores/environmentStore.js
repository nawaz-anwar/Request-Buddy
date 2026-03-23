import { create } from 'zustand'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where
} from 'firebase/firestore'
import { db } from '../services/firebase'
import toast from 'react-hot-toast'

export const useEnvironmentStore = create((set, get) => ({
  environments: [],
  currentEnvironment: null,
  loading: false,
  unsubscribe: null,

  // Subscribe to environments
  subscribeToEnvironments: (workspaceId) => {
    if (get().unsubscribe) {
      get().unsubscribe()
    }

    // Simplified query without orderBy to avoid index issues
    const q = query(
      collection(db, 'environments'),
      where('workspaceId', '==', workspaceId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const environments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Sort by createdAt in memory
      .sort((a, b) => (b.createdAt?.toDate() || new Date()) - (a.createdAt?.toDate() || new Date()))
      
      console.log('EnvironmentStore: Environments updated:', environments.length)
      set({ environments })
      
      // Set first environment as current if none selected
      if (!get().currentEnvironment && environments.length > 0) {
        set({ currentEnvironment: environments[0] })
      }
    }, (error) => {
      console.error('EnvironmentStore: Error subscribing to environments:', error)
    })

    set({ unsubscribe })
    return unsubscribe
  },

  // Create environment
  createEnvironment: async (name, variables, workspaceId) => {
    set({ loading: true })
    try {
      const docRef = await addDoc(collection(db, 'environments'), {
        name,
        variables: variables || {},
        workspaceId,
        createdAt: new Date()
      })
      
      toast.success('Environment created successfully!')
      return docRef.id
    } catch (error) {
      toast.error('Failed to create environment')
      console.error(error)
    } finally {
      set({ loading: false })
    }
  },

  // Update environment
  updateEnvironment: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'environments', id), {
        ...updates,
        updatedAt: new Date()
      })
      toast.success('Environment updated successfully!')
    } catch (error) {
      toast.error('Failed to update environment')
      console.error(error)
    }
  },

  // Delete environment
  deleteEnvironment: async (id) => {
    try {
      await deleteDoc(doc(db, 'environments', id))
      
      // Reset current environment if deleted
      if (get().currentEnvironment?.id === id) {
        const remaining = get().environments.filter(env => env.id !== id)
        set({ currentEnvironment: remaining.length > 0 ? remaining[0] : null })
      }
      
      toast.success('Environment deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete environment')
      console.error(error)
    }
  },

  // Set current environment
  setCurrentEnvironment: (environment) => {
    set({ currentEnvironment: environment })
  },

  // Replace variables in text
  replaceVariables: (text) => {
      try {
        const { currentEnvironment } = get()

        if (!text || typeof text !== 'string') {
          return text || ''
        }

        if (!currentEnvironment || !currentEnvironment.variables) {
          console.warn('⚠️ No environment or variables available')
          return text
        }

        console.log('🔄 Replacing variables in:', text)
        console.log('🌍 Environment:', currentEnvironment.name)
        console.log('🔑 Variables:', currentEnvironment.variables)

        let result = text

        // Replace each variable
        Object.entries(currentEnvironment.variables).forEach(([key, value]) => {
          if (!key || !value) return

          // Escape special regex characters in the key
          const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

          // Create regex to match {{key}} with optional spaces
          const regex = new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, 'g')

          const beforeReplace = result
          result = result.replace(regex, value)

          if (beforeReplace !== result) {
            console.log(`✅ Replaced {{${key}}} with: ${value}`)
          }
        })

        console.log('✨ Result:', result)
        return result
      } catch (error) {
        console.error('❌ Error in replaceVariables:', error)
        return text || ''
      }
    },

  // Get variable value
  getVariable: (key) => {
    const { currentEnvironment } = get()
    return currentEnvironment?.variables?.[key] || ''
  },

  // Cleanup
  cleanup: () => {
    if (get().unsubscribe) {
      get().unsubscribe()
    }
    set({ 
      environments: [], 
      currentEnvironment: null, 
      unsubscribe: null 
    })
  }
}))
