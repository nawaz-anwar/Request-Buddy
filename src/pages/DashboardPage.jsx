import { useEffect } from 'react'
import SimpleDashboard from '../layouts/SimpleDashboard'
import { useAuthStore } from '../stores/authStore'
import { useCollectionStore } from '../stores/collectionStore'
import { useRequestStore } from '../stores/requestStore'
import { useHistoryStore } from '../stores/historyStore'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { subscribeToCollections, subscribeToFolders } = useCollectionStore()
  const { subscribeToRequests } = useRequestStore()
  const { subscribeToHistory } = useHistoryStore()

  useEffect(() => {
    if (!user) return

    console.log('DashboardPage: Initializing collections for user:', user.uid)
    
    // Use user ID as workspace ID for now (simpler approach)
    const workspaceId = user.uid
    
    // Subscribe to all data
    const unsubscribeCollections = subscribeToCollections(workspaceId)
    const unsubscribeFolders = subscribeToFolders(workspaceId)
    const unsubscribeRequests = subscribeToRequests(workspaceId)
    const unsubscribeHistory = subscribeToHistory(workspaceId)

    return () => {
      if (unsubscribeCollections) unsubscribeCollections()
      if (unsubscribeFolders) unsubscribeFolders()
      if (unsubscribeRequests) unsubscribeRequests()
      if (unsubscribeHistory) unsubscribeHistory()
    }
  }, [user, subscribeToCollections, subscribeToFolders, subscribeToRequests, subscribeToHistory])

  return <SimpleDashboard />
}