import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useCollectionStore } from '../../stores/collectionStore'
import { useRequestStore } from '../../stores/requestStore'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc 
} from 'firebase/firestore'
import { db } from '../../services/firebase'
import toast from 'react-hot-toast'

export default function DeleteCollectionModal({ isOpen, collectionData, onClose }) {
  const { deleteCollection } = useCollectionStore()
  const [deleting, setDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleDelete = async () => {
    if (!collectionData || confirmText !== collectionData.name) return

    setDeleting(true)
    
    try {
      console.log('Deleting collection and all related data:', collectionData.id)
      
      // Delete all requests in this collection
      const requestsQuery = query(
        collection(db, 'requests'),
        where('collectionId', '==', collectionData.id)
      )
      const requestsSnapshot = await getDocs(requestsQuery)
      const requestDeletePromises = requestsSnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(requestDeletePromises)
      console.log(`Deleted ${requestsSnapshot.docs.length} requests`)

      // Delete all folders in this collection
      const foldersQuery = query(
        collection(db, 'folders'),
        where('collectionId', '==', collectionData.id)
      )
      const foldersSnapshot = await getDocs(foldersQuery)
      const folderDeletePromises = foldersSnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(folderDeletePromises)
      console.log(`Deleted ${foldersSnapshot.docs.length} folders`)

      // Delete the collection itself
      await deleteCollection(collectionData.id)

      toast.success('Collection deleted successfully')
      onClose()
    } catch (error) {
      console.error('Failed to delete collection:', error)
      toast.error('Failed to delete collection: ' + error.message)
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    if (!deleting) {
      setConfirmText('')
      onClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !deleting) {
      handleClose()
    } else if (e.key === 'Enter' && confirmText === collectionData?.name) {
      handleDelete()
    }
  }

  if (!isOpen || !collectionData) return null

  const isConfirmValid = confirmText === collectionData.name

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Collection
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={deleting}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                Warning: This will permanently delete:
              </h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>• The collection "{collectionData.name}"</li>
                <li>• All folders in this collection</li>
                <li>• All requests in this collection</li>
                <li>• All associated data</li>
              </ul>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              To confirm deletion, type the collection name below:
            </p>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Collection name: <span className="font-semibold">{collectionData.name}</span>
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type collection name to confirm"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                disabled={deleting}
                autoFocus
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={deleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting || !isConfirmValid}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Collection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}