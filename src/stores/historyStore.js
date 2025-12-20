import { create } from 'zustand'
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where
} from 'firebase/firestore'
import { db } from '../services/firebase'

export const useHistoryStore = create((set, get) => ({
  history: [],
  loading: false,
  unsubscribe: null,

  // Subscribe to history
  subscribeToHistory: (workspaceId) => {
    if (get().unsubscribe) {
      get().unsubscribe()
    }

    console.log('HistoryStore: Subscribing to history for workspace:', workspaceId)

    // Simplified query without orderBy to avoid index issues
    const q = query(
      collection(db, 'history'),
      where('workspaceId', '==', workspaceId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('HistoryStore: History snapshot received, docs count:', snapshot.docs.length)
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Sort by createdAt in memory (most recent first)
      .sort((a, b) => (b.createdAt?.toDate() || new Date()) - (a.createdAt?.toDate() || new Date()))
      // Limit to last 100 requests
      .slice(0, 100)
      
      console.log('HistoryStore: History updated:', history.length)
      set({ history })
    }, (error) => {
      console.error('HistoryStore: Error subscribing to history:', error)
    })

    set({ unsubscribe })
    return unsubscribe
  },

  // Add to history
  addToHistory: async (historyData) => {
    set({ loading: true })
    try {
      console.log('HistoryStore: Adding to history:', historyData.method, historyData.url)
      await addDoc(collection(db, 'history'), {
        ...historyData,
        createdAt: new Date()
      })
      console.log('HistoryStore: Successfully added to history')
    } catch (error) {
      console.error('HistoryStore: Failed to add to history:', error)
    } finally {
      set({ loading: false })
    }
  },

  // Get history for request
  getHistoryForRequest: (requestId) => {
    return get().history.filter(item => item.requestId === requestId)
  },

  // Cleanup
  cleanup: () => {
    if (get().unsubscribe) {
      get().unsubscribe()
    }
    set({ history: [], unsubscribe: null })
  }
}))