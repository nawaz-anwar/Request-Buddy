import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AuthPage from './pages/AuthPage.jsx'

function App() {
  console.log('Test App rendering...')

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/*" element={<AuthPage />} />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App