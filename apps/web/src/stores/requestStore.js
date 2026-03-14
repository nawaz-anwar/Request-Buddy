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
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'

export const useRequestStore = create((set, get) => ({
  requests: [],
  tabs: [],
  activeTabId: null,
  loading: false,
  unsubscribe: null,

  // Subscribe to requests
  subscribeToRequests: (workspaceId) => {
    if (get().unsubscribe) {
      get().unsubscribe()
    }

    console.log('RequestStore: Subscribing to requests for workspace:', workspaceId)

    // Simplified query without orderBy to avoid index issues
    const q = query(
      collection(db, 'requests'),
      where('workspaceId', '==', workspaceId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('RequestStore: Requests snapshot received, docs count:', snapshot.docs.length)
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      console.log('RequestStore: Requests updated:', requests.length)
      set({ requests })
    }, (error) => {
      console.error('RequestStore: Error subscribing to requests:', error)
      // Don't set empty array on error, keep existing data
    })

    set({ unsubscribe })
    return unsubscribe
  },

  // Create request
  createRequest: async (requestData) => {
    set({ loading: true })
    try {
      console.log('RequestStore: Creating request:', requestData.name)
      const docRef = await addDoc(collection(db, 'requests'), {
        ...requestData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      console.log('RequestStore: Request created with ID:', docRef.id)
      toast.success('Request saved successfully!')
      return docRef.id
    } catch (error) {
      console.error('RequestStore: Failed to save request:', error)
      toast.error('Failed to save request: ' + error.message)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // Update request
  updateRequest: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'requests', id), {
        ...updates,
        updatedAt: new Date()
      })
      toast.success('Request updated successfully!')
    } catch (error) {
      toast.error('Failed to update request')
      console.error(error)
    }
  },

  // Delete request
  deleteRequest: async (id) => {
    try {
      await deleteDoc(doc(db, 'requests', id))
      
      // Remove from tabs if open
      const tabs = get().tabs.filter(tab => tab.id !== id)
      const activeTabId = get().activeTabId === id ? 
        (tabs.length > 0 ? tabs[0].id : null) : get().activeTabId
      
      set({ tabs, activeTabId })
      toast.success('Request deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete request')
      console.error(error)
    }
  },

  // Tab management
  openTab: (request) => {
    const tabs = get().tabs
    const existingTab = tabs.find(tab => tab.id === request.id)
    
    if (existingTab) {
      set({ activeTabId: request.id })
      return existingTab
    }

    const newTab = {
      id: request.id || uuidv4(),
      name: request.name || 'Untitled Request',
      method: request.method || 'GET',
      url: request.url || '',
      headers: request.headers || {},
      params: request.params || {},
      body: request.body || { type: 'none', content: '' },
      auth: request.auth || { type: 'none', bearerToken: '', basic: { username: '', password: '' } },
      workspaceId: request.workspaceId,
      collectionId: request.collectionId,
      folderId: request.folderId,
      saved: !!request.id,
      hasUnsavedChanges: false,
      originalData: { ...request }, // Store original data for comparison
      response: null,
      ...request
    }

    set({ 
      tabs: [...tabs, newTab], 
      activeTabId: newTab.id 
    })
    
    return newTab
  },

  // Close tab
  closeTab: (tabId) => {
    const tabs = get().tabs.filter(tab => tab.id !== tabId)
    const activeTabId = get().activeTabId === tabId ? 
      (tabs.length > 0 ? tabs[0].id : null) : get().activeTabId
    
    set({ tabs, activeTabId })
  },

  // Update tab
  updateTab: (tabId, updates) => {
    const tabs = get().tabs.map(tab => {
      if (tab.id === tabId) {
        const updatedTab = { ...tab, ...updates }
        
        // Check if there are unsaved changes by comparing with original data
        const hasChanges = tab.saved && tab.originalData ? (
          updatedTab.name !== tab.originalData.name ||
          updatedTab.method !== tab.originalData.method ||
          updatedTab.url !== tab.originalData.url ||
          JSON.stringify(updatedTab.headers) !== JSON.stringify(tab.originalData.headers) ||
          JSON.stringify(updatedTab.params) !== JSON.stringify(tab.originalData.params) ||
          JSON.stringify(updatedTab.body) !== JSON.stringify(tab.originalData.body) ||
          JSON.stringify(updatedTab.auth) !== JSON.stringify(tab.originalData.auth)
        ) : !tab.saved
        
        return {
          ...updatedTab,
          hasUnsavedChanges: hasChanges
        }
      }
      return tab
    })
    set({ tabs })
  },

  // Set active tab
  setActiveTab: (tabId) => {
    set({ activeTabId: tabId })
  },

  // Get active tab
  getActiveTab: () => {
    const { tabs, activeTabId } = get()
    return tabs.find(tab => tab.id === activeTabId)
  },

  // Get requests for collection
  getRequestsForCollection: (collectionId) => {
    return get().requests.filter(request => request.collectionId === collectionId)
  },

  // Get requests for folder
  getRequestsForFolder: (folderId) => {
    return get().requests.filter(request => request.folderId === folderId)
  },

  // Create new tab
  createNewTab: (workspaceId, collectionId = null, folderId = null) => {
    const newTab = {
      id: uuidv4(),
      name: 'Untitled Request',
      method: 'GET',
      url: '',
      headers: {},
      params: {},
      body: { type: 'none', content: '' },
      auth: { type: 'none', bearerToken: '', basic: { username: '', password: '' } },
      workspaceId,
      collectionId,
      folderId,
      saved: false,
      hasUnsavedChanges: false,
      originalData: null,
      response: null
    }

    const tabs = [...get().tabs, newTab]
    set({ tabs, activeTabId: newTab.id })
    return newTab
  },

  // Save tab to Firestore
  saveTab: async (tabId) => {
    const tab = get().tabs.find(t => t.id === tabId)
    if (!tab) return

    set({ loading: true })
    try {
      const requestData = {
        name: tab.name,
        method: tab.method,
        url: tab.url,
        headers: tab.headers,
        params: tab.params,
        body: tab.body,
        auth: tab.auth,
        workspaceId: tab.workspaceId,
        collectionId: tab.collectionId,
        folderId: tab.folderId
      }

      let savedId = tab.id
      
      if (tab.saved && tab.originalData) {
        // Update existing request
        await updateDoc(doc(db, 'requests', tab.id), {
          ...requestData,
          updatedAt: new Date()
        })
        toast.success('Request updated successfully!')
      } else {
        // Create new request
        const docRef = await addDoc(collection(db, 'requests'), {
          ...requestData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        savedId = docRef.id
        toast.success('Request saved successfully!')
      }

      // Update tab state
      const tabs = get().tabs.map(t => 
        t.id === tabId ? {
          ...t,
          id: savedId,
          saved: true,
          hasUnsavedChanges: false,
          originalData: { ...requestData }
        } : t
      )
      
      // Update active tab ID if it changed
      const activeTabId = get().activeTabId === tabId ? savedId : get().activeTabId
      
      set({ tabs, activeTabId })
      return savedId
    } catch (error) {
      console.error('Failed to save request:', error)
      toast.error('Failed to save request: ' + error.message)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // Check if tab has unsaved changes
  hasUnsavedChanges: (tabId) => {
    const tab = get().tabs.find(t => t.id === tabId)
    return tab?.hasUnsavedChanges || false
  },

  // Get all tabs with unsaved changes
  getUnsavedTabs: () => {
    return get().tabs.filter(tab => tab.hasUnsavedChanges)
  },

  // Duplicate tab
  duplicateTab: (sourceTab) => {
    const newTab = {
      ...sourceTab,
      id: uuidv4(),
      name: `${sourceTab.name} Copy`,
      saved: false,
      hasUnsavedChanges: true,
      originalData: null,
      response: null
    }

    const tabs = [...get().tabs, newTab]
    set({ tabs, activeTabId: newTab.id })
    return newTab
  },

  // Cleanup
  cleanup: () => {
    if (get().unsubscribe) {
      get().unsubscribe()
    }
    set({ 
      requests: [], 
      tabs: [], 
      activeTabId: null, 
      unsubscribe: null 
    })
  }
}))