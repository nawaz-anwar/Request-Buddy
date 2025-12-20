import React from 'react'
import { LogOut, Settings, Globe } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useEnvironmentStore } from '../../stores/environmentStore'

export default function Header() {
  const { user, signOut } = useAuthStore()
  const { currentWorkspace, workspaces, setCurrentWorkspace } = useWorkspaceStore()
  const { currentEnvironment, environments, setCurrentEnvironment } = useEnvironmentStore()

  return (
    <header className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">RB</span>
          </div>
          <span className="font-semibold text-white">Request Buddy</span>
        </div>

        {/* Workspace Selector */}
        {workspaces.length > 0 && (
          <select
            value={currentWorkspace?.id || ''}
            onChange={(e) => {
              const workspace = workspaces.find(w => w.id === e.target.value)
              if (workspace) setCurrentWorkspace(workspace)
            }}
            className="px-3 py-1 text-sm bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {workspaces.map(workspace => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Environment Selector */}
        {environments.length > 0 && (
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-gray-400" />
            <select
              value={currentEnvironment?.id || ''}
              onChange={(e) => {
                const env = environments.find(env => env.id === e.target.value)
                setCurrentEnvironment(env || null)
              }}
              className="px-3 py-1 text-sm bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No Environment</option>
              {environments.map(env => (
                <option key={env.id} value={env.id}>
                  {env.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center space-x-2 pl-2 border-l border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-medium">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <span className="text-sm text-gray-300">
              {user?.displayName || user?.email}
            </span>
          </div>

          <button
            onClick={signOut}
            className="p-1.5 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}