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
import toast from 'react-hot-toast'
import { saveToCache, loadFromCache, clearCache } from '../utils/localCache'

export const useCollectionStore = create((set, get) => ({
  collections: [],
  folders: [],
  loading: false,
  syncing: false,
  lastSync: null,
  unsubscribeCollections: null,
  unsubscribeFolders: null,

  // Load collections (cache-first, no real-time listener)
  loadCollections: async (workspaceId) => {
    console.log('CollectionStore: Loading collections for workspace:', workspaceId)

    // Clear existing collections first
    set({ collections: [] })

    // Try to load from cache first
    const cachedCollections = loadFromCache(workspaceId, 'collections')
    if (cachedCollections) {
      console.log('📦 Using cached collections:', cachedCollections.length)
      set({ collections: cachedCollections })
      return cachedCollections
    }

    // If no cache, fetch from Firestore once
    try {
      set({ loading: true })
      const q = query(
        collection(db, 'collections'),
        where('workspaceId', '==', workspaceId)
      )

      const snapshot = await getDocs(q)
      console.log('🔥 Fetched collections from Firestore:', snapshot.docs.length)
      
      const collections = snapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() }
        console.log('CollectionStore: Collection data:', data)
        return data
      })
      
      set({ collections, lastSync: Date.now() })
      
      // Save to cache
      saveToCache(workspaceId, 'collections', collections)
      
      return collections
    } catch (error) {
      console.error('CollectionStore: Error loading collections:', error)
      return []
    } finally {
      set({ loading: false })
    }
  },

  // Load folders (cache-first, no real-time listener)
  loadFolders: async (workspaceId) => {
    console.log('CollectionStore: Loading folders for workspace:', workspaceId)

    // Clear existing folders first
    set({ folders: [] })

    // Try to load from cache first
    const cachedFolders = loadFromCache(workspaceId, 'folders')
    if (cachedFolders) {
      console.log('📦 Using cached folders:', cachedFolders.length)
      set({ folders: cachedFolders })
      return cachedFolders
    }

    // If no cache, fetch from Firestore once
    try {
      set({ loading: true })
      const q = query(
        collection(db, 'folders'),
        where('workspaceId', '==', workspaceId)
      )

      const snapshot = await getDocs(q)
      console.log('🔥 Fetched folders from Firestore:', snapshot.docs.length)
      
      const folders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      set({ folders, lastSync: Date.now() })
      
      // Save to cache
      saveToCache(workspaceId, 'folders', folders)
      
      return folders
    } catch (error) {
      console.error('CollectionStore: Error loading folders:', error)
      return []
    } finally {
      set({ loading: false })
    }
  },

  // Sync data from Firestore (manual refresh)
  syncCollections: async (workspaceId) => {
    console.log('🔄 Manually syncing collections from Firestore')
    set({ syncing: true })
    
    try {
      // Clear cache first
      clearCache(workspaceId, 'collections')
      clearCache(workspaceId, 'folders')
      
      // Fetch fresh data
      await get().loadCollections(workspaceId)
      await get().loadFolders(workspaceId)
      
      toast.success('Data synced successfully!')
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error('Failed to sync data')
    } finally {
      set({ syncing: false })
    }
  },

  // Legacy method for backward compatibility (now uses loadCollections)
  subscribeToCollections: (workspaceId) => {
    console.log('⚠️ subscribeToCollections is deprecated, using loadCollections instead')
    return get().loadCollections(workspaceId)
  },

  // Legacy method for backward compatibility (now uses loadFolders)
  subscribeToFolders: (workspaceId) => {
    console.log('⚠️ subscribeToFolders is deprecated, using loadFolders instead')
    return get().loadFolders(workspaceId)
  },

  // Create collection (with local cache update)
  createCollection: async (collectionData) => {
    set({ loading: true })
    try {
      console.log('CollectionStore: Creating collection:', collectionData)
      
      // Handle both object and separate parameters for backward compatibility
      let name, workspaceId, description
      if (typeof collectionData === 'object' && collectionData.name) {
        ({ name, workspaceId, description } = collectionData)
      } else {
        // Legacy: first param is name, second is workspaceId
        name = collectionData
        workspaceId = arguments[1]
      }
      
      if (!workspaceId) {
        throw new Error('Workspace ID is required')
      }
      
      const docRef = await addDoc(collection(db, 'collections'), {
        name,
        workspaceId,
        description: description || '',
        createdAt: new Date()
      })
      
      // Update local state immediately
      const newCollection = {
        id: docRef.id,
        name,
        workspaceId,
        description: description || '',
        createdAt: new Date()
      }
      
      const currentCollections = get().collections
      const updatedCollections = [...currentCollections, newCollection]
      set({ collections: updatedCollections })
      
      // Update cache
      saveToCache(workspaceId, 'collections', updatedCollections)
      
      console.log('CollectionStore: Collection created with ID:', docRef.id)
      toast.success('Collection created successfully!')
      return docRef.id
    } catch (error) {
      console.error('CollectionStore: Failed to create collection:', error)
      toast.error('Failed to create collection: ' + error.message)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // Create folder (with local cache update)
  createFolder: async (name, collectionId, workspaceId) => {
    set({ loading: true })
    try {
      console.log('CollectionStore: Creating folder:', name, 'in collection:', collectionId)
      const docRef = await addDoc(collection(db, 'folders'), {
        name,
        collectionId,
        workspaceId,
        createdAt: new Date()
      })
      
      // Update local state immediately
      const newFolder = {
        id: docRef.id,
        name,
        collectionId,
        workspaceId,
        createdAt: new Date()
      }
      
      const currentFolders = get().folders
      const updatedFolders = [...currentFolders, newFolder]
      set({ folders: updatedFolders })
      
      // Update cache
      saveToCache(workspaceId, 'folders', updatedFolders)
      
      console.log('CollectionStore: Folder created with ID:', docRef.id)
      toast.success('Folder created successfully!')
      return docRef.id
    } catch (error) {
      console.error('CollectionStore: Failed to create folder:', error)
      toast.error('Failed to create folder: ' + error.message)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // Update collection (with local cache update)
  updateCollection: async (id, updates) => {
    try {
      console.log('CollectionStore: Updating collection:', id, updates)
      await updateDoc(doc(db, 'collections', id), {
        ...updates,
        updatedAt: new Date()
      })
      
      // Update local state immediately
      const currentCollections = get().collections
      const updatedCollections = currentCollections.map(collection => 
        collection.id === id 
          ? { ...collection, ...updates, updatedAt: new Date() }
          : collection
      )
      set({ collections: updatedCollections })
      
      // Update cache (get workspaceId from the collection)
      const collection = currentCollections.find(c => c.id === id)
      if (collection) {
        saveToCache(collection.workspaceId, 'collections', updatedCollections)
      }
      
      toast.success('Collection updated successfully!')
    } catch (error) {
      console.error('CollectionStore: Failed to update collection:', error)
      toast.error('Failed to update collection: ' + error.message)
      throw error
    }
  },

  // Update folder (with local cache update)
  updateFolder: async (id, updates) => {
    try {
      console.log('CollectionStore: Updating folder:', id, updates)
      await updateDoc(doc(db, 'folders', id), {
        ...updates,
        updatedAt: new Date()
      })
      
      // Update local state immediately
      const currentFolders = get().folders
      const updatedFolders = currentFolders.map(folder => 
        folder.id === id 
          ? { ...folder, ...updates, updatedAt: new Date() }
          : folder
      )
      set({ folders: updatedFolders })
      
      // Update cache (get workspaceId from the folder)
      const folder = currentFolders.find(f => f.id === id)
      if (folder) {
        saveToCache(folder.workspaceId, 'folders', updatedFolders)
      }
      
      toast.success('Folder updated successfully!')
    } catch (error) {
      console.error('CollectionStore: Failed to update folder:', error)
      toast.error('Failed to update folder: ' + error.message)
      throw error
    }
  },

  // Delete collection (with local cache update)
  deleteCollection: async (id) => {
    try {
      console.log('CollectionStore: Deleting collection:', id)
      await deleteDoc(doc(db, 'collections', id))
      
      // Update local state immediately
      const currentCollections = get().collections
      const collection = currentCollections.find(c => c.id === id)
      const updatedCollections = currentCollections.filter(c => c.id !== id)
      set({ collections: updatedCollections })
      
      // Update cache
      if (collection) {
        saveToCache(collection.workspaceId, 'collections', updatedCollections)
      }
      
      toast.success('Collection deleted successfully!')
    } catch (error) {
      console.error('CollectionStore: Failed to delete collection:', error)
      toast.error('Failed to delete collection: ' + error.message)
      throw error
    }
  },

  // Delete folder (with local cache update)
  deleteFolder: async (id) => {
    try {
      console.log('CollectionStore: Deleting folder:', id)
      await deleteDoc(doc(db, 'folders', id))
      
      // Update local state immediately
      const currentFolders = get().folders
      const folder = currentFolders.find(f => f.id === id)
      const updatedFolders = currentFolders.filter(f => f.id !== id)
      set({ folders: updatedFolders })
      
      // Update cache
      if (folder) {
        saveToCache(folder.workspaceId, 'folders', updatedFolders)
      }
      
      toast.success('Folder deleted successfully!')
    } catch (error) {
      console.error('CollectionStore: Failed to delete folder:', error)
      toast.error('Failed to delete folder: ' + error.message)
      throw error
    }
  },

  // Get folders for collection
  getFoldersForCollection: (collectionId) => {
    return get().folders.filter(folder => folder.collectionId === collectionId)
  },

  // Cleanup
  cleanup: () => {
    if (get().unsubscribeCollections) {
      get().unsubscribeCollections()
    }
    if (get().unsubscribeFolders) {
      get().unsubscribeFolders()
    }
    set({ 
      collections: [], 
      folders: [], 
      unsubscribeCollections: null, 
      unsubscribeFolders: null,
      lastSync: null
    })
  }
}))