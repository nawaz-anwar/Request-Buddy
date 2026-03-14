import { useEffect, useState } from 'react'
import SimpleDashboard from '../layouts/SimpleDashboard'
import { useAuthStore } from '../stores/authStore'
import { useWorkspaceStore } from '../stores/workspaceStore'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { workspaces, currentWorkspace, subscribeToWorkspaces } = useWorkspaceStore()
  const [initError, setInitError] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    if (!user?.uid) {
      setIsInitializing(false)
      return
    }

    console.log('DashboardPage: Initializing for user:', user.email)
    
    setIsInitializing(true)
    setInitError(null)
    
    try {
      const unsubscribe = subscribeToWorkspaces(user.uid)
      
      return () => {
        if (unsubscribe) unsubscribe()
      }
    } catch (error) {
      console.error('❌ DashboardPage: Error initializing workspaces:', error)
      setInitError(error.message)
      setIsInitializing(false)
    }
  }, [user?.uid, subscribeToWorkspaces])

  // Mark initialization as complete when we have workspaces
  useEffect(() => {
    if (workspaces.length > 0 || currentWorkspace) {
      console.log('✅ DashboardPage: Workspaces loaded, rendering dashboard')
      setIsInitializing(false)
      setInitError(null)
    }
  }, [workspaces, currentWorkspace])

  // Show error state
  if (initError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Initialization Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {initError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Setting up your workspace...</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          {user?.email}
        </p>
      </div>
    )
  }

  return <SimpleDashboard />
}