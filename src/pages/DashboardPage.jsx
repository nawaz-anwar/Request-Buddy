import { useEffect } from 'react'
import SimpleDashboard from '../layouts/SimpleDashboard'
import { useAuthStore } from '../stores/authStore'
import { useCollectionStore } from '../stores/collectionStore'
import { useRequestStore } from '../stores/requestStore'
import { useHistoryStore } from '../stores/historyStore'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { loadCollections, loadFolders } = useCollectionStore()
  const { loadRequests } = useRequestStore()
  const { subscribeToHistory } = useHistoryStore()

  useEffect(() => {
    if (!user) return

    console.log('DashboardPage: Loading data for user:', user.uid)
    
    // Use user ID as workspace ID for now (simpler approach)
    const workspaceId = user.uid
    
    // Load data (cache-first, no real-time listeners)
    loadCollections(workspaceId)
    loadFolders(workspaceId)
    loadRequests(workspaceId)
    
    // History still uses real-time listener for live updates
    const unsubscribeHistory = subscribeToHistory(workspaceId)

    return () => {
      if (unsubscribeHistory) unsubscribeHistory()
    }
  }, [user, loadCollections, loadFolders, loadRequests, subscribeToHistory])

  return <SimpleDashboard />
}
