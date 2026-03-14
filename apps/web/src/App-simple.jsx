import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
          <span className="text-white font-bold text-xl">RB</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Request Buddy</h1>
        <p className="text-gray-400">Modern API Development & Testing Tool</p>
        <div className="mt-8">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}

export default App