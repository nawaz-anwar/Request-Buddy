import { Code, Zap, Info, Copy } from 'lucide-react'

export default function SidebarToggle({ isOpen, activeTab, onToggle, onTabChange }) {
  const tabs = [
    { id: 'code', icon: Code, label: 'Code Snippets', shortcut: 'Cmd+Shift+C' },
    { id: 'curl', icon: Zap, label: 'cURL', shortcut: 'Cmd+Shift+U' },
    { id: 'info', icon: Info, label: 'Request Info', shortcut: 'Cmd+Shift+I' },
    { id: 'copy', icon: Copy, label: 'Copy & Export', shortcut: 'Cmd+Shift+E' }
  ]

  return (
    <div className="fixed right-0 top-0 h-full z-40 flex">
      {/* Vertical Icon Bar */}
      <div className="w-12 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id && isOpen
          
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (isActive) {
                  onToggle()
                } else {
                  onTabChange(tab.id)
                  if (!isOpen) onToggle()
                }
              }}
              className={`p-2 rounded-lg transition-all duration-200 group relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title={`${tab.label} (${tab.shortcut})`}
            >
              <Icon className="h-5 w-5" />
              
              {/* Tooltip */}
              <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {tab.label}
                <div className="text-xs text-gray-300 dark:text-gray-400">{tab.shortcut}</div>
              </div>
            </button>
          )
        })}
        
        {/* Collapse/Expand Button */}
        <div className="flex-1" />
        <button
          onClick={onToggle}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isOpen
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              : 'text-gray-500 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  )
}