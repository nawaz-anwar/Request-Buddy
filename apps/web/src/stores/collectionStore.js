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
import { saveToCache, loadFromCache, clearWorkspaceCache } from '../utils/localCache'

export const useCollectionStore = create((set, get) => ({
  collections: [],
  folders: [],
  loading: false,
  unsubscribeCollections: null,
  unsubscribeFolders: null,

  // Subscribe to collections
  subscribeToCollections: (workspaceId) => {
    if (get().unsubscribeCollections) {
      get().unsubscribeCollections()
    }

    console.log('CollectionStore: Subscribing to collections for workspace:', workspaceId)

    // Try to load from cache first
    const cachedCollections = loadFromCache(workspaceId, 'collections')
    if (cachedCollections) {
      set({ collections: cachedCollections })
    }

    // Simplified query without orderBy to avoid index issues
    const q = query(
      collection(db, 'collections'),
      where('workspaceId', '==', workspaceId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('CollectionStore: Snapshot received, docs count:', snapshot.docs.length)
      const collections = snapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() }
        console.log('CollectionStore: Collection data:', data)
        return data
      })
      console.log('CollectionStore: Collections updated:', collections.length, collections)
      set({ collections })
      
      // Save to cache
      saveToCache(workspaceId, 'collections', collections)
    }, (error) => {
      console.error('CollectionStore: Error subscribing to collections:', error)
      // Don't set empty array on error, keep existing data
    })

    set({ unsubscribeCollections: unsubscribe })
    return unsubscribe
  },

  // Subscribe to folders
  subscribeToFolders: (workspaceId) => {
    if (get().unsubscribeFolders) {
      get().unsubscribeFolders()
    }

    console.log('CollectionStore: Subscribing to folders for workspace:', workspaceId)

    // Try to load from cache first
    const cachedFolders = loadFromCache(workspaceId, 'folders')
    if (cachedFolders) {
      set({ folders: cachedFolders })
    }

    // Simplified query without orderBy to avoid index issues
    const q = query(
      collection(db, 'folders'),
      where('workspaceId', '==', workspaceId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('CollectionStore: Folders snapshot received, docs count:', snapshot.docs.length)
      const folders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      console.log('CollectionStore: Folders updated:', folders.length)
      set({ folders })
      
      // Save to cache
      saveToCache(workspaceId, 'folders', folders)
    }, (error) => {
      console.error('CollectionStore: Error subscribing to folders:', error)
      // Don't set empty array on error, keep existing data
    })

    set({ unsubscribeFolders: unsubscribe })
    return unsubscribe
  },

  // Create collection
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

  // Create folder
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

  // Update collection
  updateCollection: async (id, updates) => {
    try {
      console.log('CollectionStore: Updating collection:', id, updates)
      await updateDoc(doc(db, 'collections', id), {
        ...updates,
        updatedAt: new Date()
      })
      toast.success('Collection updated successfully!')
    } catch (error) {
      console.error('CollectionStore: Failed to update collection:', error)
      toast.error('Failed to update collection: ' + error.message)
      throw error
    }
  },

  // Update folder
  updateFolder: async (id, updates) => {
    try {
      console.log('CollectionStore: Updating folder:', id, updates)
      await updateDoc(doc(db, 'folders', id), {
        ...updates,
        updatedAt: new Date()
      })
      toast.success('Folder updated successfully!')
    } catch (error) {
      console.error('CollectionStore: Failed to update folder:', error)
      toast.error('Failed to update folder: ' + error.message)
      throw error
    }
  },

  // Delete collection
  deleteCollection: async (id) => {
    try {
      console.log('CollectionStore: Deleting collection:', id)
      await deleteDoc(doc(db, 'collections', id))
      toast.success('Collection deleted successfully!')
    } catch (error) {
      console.error('CollectionStore: Failed to delete collection:', error)
      toast.error('Failed to delete collection: ' + error.message)
      throw error
    }
  },

  // Delete folder
  deleteFolder: async (id) => {
    try {
      console.log('CollectionStore: Deleting folder:', id)
      await deleteDoc(doc(db, 'folders', id))
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
      unsubscribeFolders: null 
    })
  }
}))