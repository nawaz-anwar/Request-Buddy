import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AuthPage from './pages/AuthPage.jsx'
import DashboardPage from './pages/DashboardPage'
import InviteAcceptPage from './pages/InviteAcceptPage'
import { useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'

function App() {
  const { user, loading, initialize } = useAuthStore()
  const { initTheme } = useThemeStore()
  const [timeoutReached, setTimeoutReached] = useState(false)

  useEffect(() => {
    console.log('App mounting, initializing auth and theme...')
    
    // Initialize theme
    initTheme()
    
    const unsubscribe = initialize()
    
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Auth timeout reached, forcing load')
      setTimeoutReached(true)
    }, 10000) // 10 second timeout
    
    return () => {
      clearTimeout(timeout)
      if (unsubscribe) unsubscribe()
    }
  }, [initialize, initTheme])

  // Show loading for max 10 seconds
  if (loading && !timeoutReached) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-4">Loading Request Buddy...</p>
      </div>
    )
  }

  console.log('App render - User:', user ? 'Logged in' : 'Not logged in', 'Loading:', loading)

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/auth" 
            element={user ? (
              <>
                {console.log('User authenticated, redirecting to dashboard')}
                <Navigate to="/" replace />
              </>
            ) : (
              <>
                {console.log('No user, showing auth page')}
                <AuthPage />
              </>
            )} 
          />
          <Route 
            path="/invite/:inviteId" 
            element={<InviteAcceptPage />}
          />
          <Route 
            path="/*" 
            element={user ? (
              <>
                {console.log('User authenticated, showing dashboard')}
                <DashboardPage />
              </>
            ) : (
              <>
                {console.log('No user, redirecting to auth')}
                <Navigate to="/auth" replace />
              </>
            )} 
          />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            className: 'dark:bg-gray-800 dark:text-white bg-white text-gray-900 border dark:border-gray-700 border-gray-200 shadow-lg',
            style: {
              borderRadius: '8px',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App