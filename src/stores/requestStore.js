import { create } from 'zustand'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  query, 
  where, 
  orderBy 
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'
import { saveToCache, loadFromCache, clearCache } from '../utils/localCache'

export const useRequestStore = create((set, get) => ({
  requests: [],
  tabs: [],
  activeTabId: null,
  loading: false,
  syncing: false,
  lastSync: null,
  unsubscribe: null,

  // Load requests (cache-first, no real-time listener)
  loadRequests: async (workspaceId) => {
    console.log('RequestStore: Loading requests for workspace:', workspaceId)

    // Clear existing requests first
    set({ requests: [] })

    // Try to load from cache first
    const cachedRequests = loadFromCache(workspaceId, 'requests')
    if (cachedRequests) {
      console.log('📦 Using cached requests:', cachedRequests.length)
      set({ requests: cachedRequests })
      return cachedRequests
    }

    // If no cache, fetch from Firestore once
    try {
      set({ loading: true })
      const q = query(
        collection(db, 'requests'),
        where('workspaceId', '==', workspaceId)
      )

      const snapshot = await getDocs(q)
      console.log('🔥 Fetched requests from Firestore:', snapshot.docs.length)
      
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      set({ requests, lastSync: Date.now() })
      
      // Save to cache
      saveToCache(workspaceId, 'requests', requests)
      
      return requests
    } catch (error) {
      console.error('RequestStore: Error loading requests:', error)
      return []
    } finally {
      set({ loading: false })
    }
  },

  // Sync data from Firestore (manual refresh)
  syncRequests: async (workspaceId) => {
    console.log('🔄 Manually syncing requests from Firestore')
    set({ syncing: true })
    
    try {
      // Clear cache first
      clearCache(workspaceId, 'requests')
      
      // Fetch fresh data
      await get().loadRequests(workspaceId)
      
      toast.success('Requests synced successfully!')
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error('Failed to sync requests')
    } finally {
      set({ syncing: false })
    }
  },

  // Legacy method for backward compatibility (now uses loadRequests)
  subscribeToRequests: (workspaceId) => {
    console.log('⚠️ subscribeToRequests is deprecated, using loadRequests instead')
    return get().loadRequests(workspaceId)
  },

  // Create request (with local cache update)
  createRequest: async (requestData) => {
    set({ loading: true })
    try {
      console.log('RequestStore: Creating request:', requestData.name)
      const docRef = await addDoc(collection(db, 'requests'), {
        ...requestData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      // Update local state immediately
      const newRequest = {
        id: docRef.id,
        ...requestData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const currentRequests = get().requests
      const updatedRequests = [...currentRequests, newRequest]
      set({ requests: updatedRequests })
      
      // Update cache
      saveToCache(requestData.workspaceId, 'requests', updatedRequests)
      
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

  // Update request (with local cache update)
  updateRequest: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'requests', id), {
        ...updates,
        updatedAt: new Date()
      })
      
      // Update local state immediately
      const currentRequests = get().requests
      const updatedRequests = currentRequests.map(request => 
        request.id === id 
          ? { ...request, ...updates, updatedAt: new Date() }
          : request
      )
      set({ requests: updatedRequests })
      
      // Update cache (get workspaceId from the request)
      const request = currentRequests.find(r => r.id === id)
      if (request) {
        saveToCache(request.workspaceId, 'requests', updatedRequests)
      }
      
      toast.success('Request updated successfully!')
    } catch (error) {
      toast.error('Failed to update request')
      console.error(error)
    }
  },

  // Move/reorder request (for drag and drop)
  moveRequest: async (requestId, newCollectionId, newFolderId = null, newOrder = null) => {
    try {
      const updates = {
        collectionId: newCollectionId,
        folderId: newFolderId,
        updatedAt: new Date()
      }
      
      // Add order if provided
      if (newOrder !== null) {
        updates.order = newOrder
      }
      
      await updateDoc(doc(db, 'requests', requestId), updates)
      
      // Update local state immediately for better UX
      const currentRequests = get().requests
      const updatedRequests = currentRequests.map(request => 
        request.id === requestId 
          ? { ...request, ...updates }
          : request
      )
      set({ requests: updatedRequests })
      
      // Update cache
      const request = currentRequests.find(r => r.id === requestId)
      if (request) {
        saveToCache(request.workspaceId, 'requests', updatedRequests)
      }
      
      console.log('Request moved successfully:', requestId, 'to collection:', newCollectionId, 'folder:', newFolderId)
    } catch (error) {
      console.error('Failed to move request:', error)
      toast.error('Failed to move request')
    }
  },

  // Reorder requests within the same container
  reorderRequests: async (requestIds, containerId, containerType) => {
    try {
      // Update order for each request
      const updatePromises = requestIds.map((requestId, index) => 
        updateDoc(doc(db, 'requests', requestId), {
          order: index,
          updatedAt: new Date()
        })
      )
      
      await Promise.all(updatePromises)
      
      // Update local state
      const currentRequests = get().requests
      const updatedRequests = currentRequests.map(request => {
        const newIndex = requestIds.indexOf(request.id)
        return newIndex !== -1 
          ? { ...request, order: newIndex, updatedAt: new Date() }
          : request
      })
      set({ requests: updatedRequests })
      
      // Update cache (get workspaceId from first request)
      const firstRequest = currentRequests.find(r => requestIds.includes(r.id))
      if (firstRequest) {
        saveToCache(firstRequest.workspaceId, 'requests', updatedRequests)
      }
      
      console.log('Requests reordered successfully in', containerType, containerId)
    } catch (error) {
      console.error('Failed to reorder requests:', error)
      toast.error('Failed to reorder requests')
    }
  },

  // Delete request (with local cache update)
  deleteRequest: async (id) => {
    try {
      await deleteDoc(doc(db, 'requests', id))
      
      // Update local state immediately
      const currentRequests = get().requests
      const request = currentRequests.find(r => r.id === id)
      const updatedRequests = currentRequests.filter(r => r.id !== id)
      set({ requests: updatedRequests })
      
      // Update cache
      if (request) {
        saveToCache(request.workspaceId, 'requests', updatedRequests)
      }
      
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

  // Update tab (LOCAL ONLY - no auto-save)
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
    
    // NO AUTO-SAVE - changes are only local until explicit save
    console.log('💾 Tab updated locally (no auto-save)')
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

  // Get all requests for collection (including those in folders)
  getAllRequestsForCollection: (collectionId) => {
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

  // Save tab to Firestore (EXPLICIT SAVE ONLY)
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
        
        // Update local requests array
        const currentRequests = get().requests
        const updatedRequests = currentRequests.map(request => 
          request.id === tab.id 
            ? { ...request, ...requestData, updatedAt: new Date() }
            : request
        )
        set({ requests: updatedRequests })
        
        // Update cache
        saveToCache(tab.workspaceId, 'requests', updatedRequests)
        
        toast.success('Request updated successfully!')
      } else {
        // Create new request
        const docRef = await addDoc(collection(db, 'requests'), {
          ...requestData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        savedId = docRef.id
        
        // Add to local requests array
        const newRequest = {
          id: savedId,
          ...requestData,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        const currentRequests = get().requests
        const updatedRequests = [...currentRequests, newRequest]
        set({ requests: updatedRequests })
        
        // Update cache
        saveToCache(tab.workspaceId, 'requests', updatedRequests)
        
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
      unsubscribe: null,
      lastSync: null
    })
  }
}))