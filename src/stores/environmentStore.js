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
    const { currentEnvironment } = get()
    if (!currentEnvironment || !text) return text

    let result = text
    Object.entries(currentEnvironment.variables || {}).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, value)
    })
    
    return result
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