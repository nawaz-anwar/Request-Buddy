import { useState, useEffect } from 'react'
import { Zap, Clock, Users, Mail } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useUserStore } from '../stores/userStore'
import { useEnvironmentStore } from '../stores/environmentStore'
import { useRequestStore } from '../stores/requestStore'
import { useHistoryStore } from '../stores/historyStore'
import { useWorkspaceStore } from '../stores/workspaceStore'
import { useCollectionStore } from '../stores/collectionStore'
import { useWorkspaceInviteStore } from '../stores/workspaceInviteStore'
import CollectionsSidebar from '../components/collections/CollectionsSidebar'
import HistorySidebar from '../components/history/HistorySidebar'
import RequestEditor from '../components/request/RequestEditor'
import ResponseViewer from '../components/response/ResponseViewer'
import RightSidebar from '../components/rightSidebar/RightSidebar'
import WorkspaceSelector from '../components/workspace/WorkspaceSelector'
import MemberManagementModal from '../components/workspace/MemberManagementModal'
import WorkspaceInvitationsModal from '../components/workspace/WorkspaceInvitationsModal'
import EnvironmentSelector from '../components/environments/EnvironmentSelector'
import ThemeToggle from '../components/ui/ThemeToggle'
import ResizablePanel from '../components/ui/ResizablePanel'
import RequestTabs from '../components/ui/RequestTabs'
import UserProfileDropdown from '../components/user/UserProfileDropdown'
import { runRequest, validateRequest } from '../utils/requestRunner'
import { testRequestRunner } from '../utils/testRequestRunner'
import { testHistoryFeatures } from '../utils/testHistory'
import { testResponseViewer } from '../utils/testResponseViewer'
import { testPostmanImportExport } from '../utils/testPostmanImportExport'
import { testCrudOperations } from '../utils/testCrudOperations'
import { testCollaboration } from '../utils/testCollaboration'
import { testCollaborationUI } from '../utils/testCollaborationUI'
import { testCollaborationFix } from '../utils/testCollaborationFix'
import { testWorkspaceSystem, testMemberManagement, testCollectionCreation, testRealTimeCollections } from '../utils/testWorkspaceSystem'
import { testUserProfile, testProfileModal, testUserDropdown, runAllUserProfileTests } from '../utils/testUserProfile'
import { testResponseViewerFix, responseViewerTestChecklist } from '../utils/testResponseViewerFix'
import { testRightSidebarFeatures, testCodeGeneration, testSidebarInteraction, rightSidebarTestChecklist } from '../utils/testRightSidebar'
import { testEnhancedResponseViewer, testCookieParsing, testResponseScrolling, enhancedResponseViewerTestChecklist } from '../utils/testEnhancedResponseViewer'
import { testAIIntegration, testAIActions, testAIRateLimit, aiTestChecklist } from '../utils/testAI'
import { testAIButtonVisibility, simulateAIButtonClick, testAIModalVisibility, aiVisibilityChecklist } from '../utils/testAIVisibility'
import { runAllLayoutTests, verifyLayoutStructure, verifyActionBar, testRightSidebarToggle, testAIButtonDropdown, verifyResponsePanel } from '../utils/testLayoutVerification'
import { setTestResponseInApp, setLargeTestResponse, createTestResponse, createLargeTestResponse } from '../utils/createTestResponse'
import { runCompleteLayoutTest } from '../utils/completeLayoutTest'
import { useAIStore } from '../stores/aiStore'

export default function SimpleDashboard() {
  const { user } = useAuthStore()
  const { initialize: initializeUserStore, cleanup: cleanupUserStore } = useUserStore()
  const { subscribeToEnvironments, replaceVariables, cleanup } = useEnvironmentStore()
  const { 
    tabs, 
    activeTabId, 
    openTab, 
    closeTab, 
    updateTab, 
    setActiveTab, 
    createNewTab, 
    getActiveTab,
    saveTab,
    duplicateTab
  } = useRequestStore()
  const { addToHistory, subscribeToHistory, cleanup: cleanupHistory } = useHistoryStore()
  const { currentWorkspace } = useWorkspaceStore()
  const { 
    pendingInvites, 
    subscribeToPendingInvites, 
    subscribeToSentInvites,
    cleanup: cleanupInvites 
  } = useWorkspaceInviteStore()
  const { checkAvailability } = useAIStore()
  
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [showInvitationsModal, setShowInvitationsModal] = useState(false)
  const [showRightSidebar, setShowRightSidebar] = useState(() => {
    const saved = localStorage.getItem('requestBuddy_rightSidebarOpen')
    return saved === 'true'
  })

  // Initialize user store
  useEffect(() => {
    const unsubscribe = initializeUserStore()
    return () => {
      if (unsubscribe) unsubscribe()
      cleanupUserStore()
    }
  }, [initializeUserStore, cleanupUserStore])

  // Initialize AI service
  useEffect(() => {
    checkAvailability()
  }, [checkAvailability])

  // Subscribe to environments, history, and invitations
  useEffect(() => {
    if (user?.uid && user?.email) {
      subscribeToEnvironments(user.uid)
      subscribeToHistory(user.uid)
      subscribeToPendingInvites(user.email)
    }
    return () => {
      cleanup()
      cleanupHistory()
      cleanupInvites()
    }
  }, [user?.uid, user?.email, subscribeToEnvironments, subscribeToHistory, subscribeToPendingInvites, cleanup, cleanupHistory, cleanupInvites])

  // Show invitations modal if there are pending invites
  useEffect(() => {
    if (pendingInvites.length > 0 && !showInvitationsModal) {
      setShowInvitationsModal(true)
    }
  }, [pendingInvites.length, showInvitationsModal])

  // Add test functions to window for debugging
  useEffect(() => {
    window.testRequestRunner = testRequestRunner
    window.testHistoryFeatures = testHistoryFeatures
    window.testResponseViewer = testResponseViewer
    window.testPostmanImportExport = testPostmanImportExport
    window.testCrudOperations = testCrudOperations
    window.testCollaboration = testCollaboration
    window.testCollaborationUI = testCollaborationUI
    window.testCollaborationFix = testCollaborationFix
    window.testWorkspaceSystem = testWorkspaceSystem
    window.testMemberManagement = testMemberManagement
    window.testCollectionCreation = testCollectionCreation
    window.testRealTimeCollections = testRealTimeCollections
    window.testUserProfile = testUserProfile
    window.testProfileModal = testProfileModal
    window.testUserDropdown = testUserDropdown
    window.runAllUserProfileTests = runAllUserProfileTests
    window.testResponseViewerFix = testResponseViewerFix
    window.responseViewerTestChecklist = responseViewerTestChecklist
    window.testRightSidebarFeatures = testRightSidebarFeatures
    window.testCodeGeneration = testCodeGeneration
    window.testSidebarInteraction = testSidebarInteraction
    window.rightSidebarTestChecklist = rightSidebarTestChecklist
    window.testEnhancedResponseViewer = testEnhancedResponseViewer
    window.testCookieParsing = testCookieParsing
    window.testResponseScrolling = testResponseScrolling
    window.enhancedResponseViewerTestChecklist = enhancedResponseViewerTestChecklist
    window.testAIIntegration = testAIIntegration
    window.testAIActions = testAIActions
    window.testAIRateLimit = testAIRateLimit
    window.aiTestChecklist = aiTestChecklist
    window.testAIButtonVisibility = testAIButtonVisibility
    window.simulateAIButtonClick = simulateAIButtonClick
    window.testAIModalVisibility = testAIModalVisibility
    window.aiVisibilityChecklist = aiVisibilityChecklist
    window.runAllLayoutTests = runAllLayoutTests
    window.verifyLayoutStructure = verifyLayoutStructure
    window.verifyActionBar = verifyActionBar
    window.testRightSidebarToggle = testRightSidebarToggle
    window.testAIButtonDropdown = testAIButtonDropdown
    window.verifyResponsePanel = verifyResponsePanel
    window.setTestResponse = setResponse
    window.setTestResponseInApp = setTestResponseInApp
    window.setLargeTestResponse = setLargeTestResponse
    window.createTestResponse = createTestResponse
    window.createLargeTestResponse = createLargeTestResponse
    window.runCompleteLayoutTest = runCompleteLayoutTest
    window.useWorkspaceStore = useWorkspaceStore
    window.useAuthStore = useAuthStore
    window.useCollectionStore = useCollectionStore
    window.useUserStore = useUserStore
    console.log('Test functions available:')
    console.log('- window.testRequestRunner()')
    console.log('- window.testHistoryFeatures()')
    console.log('- window.testResponseViewer()')
    console.log('- window.testPostmanImportExport()')
    console.log('- window.testCrudOperations()')
    console.log('- window.testCollaboration()')
    console.log('- window.testCollaborationUI() ← Test the UI')
    console.log('- window.testCollaborationFix() ← Test the fixes')
    console.log('- window.testWorkspaceSystem() ← NEW! Test workspace creation')
    console.log('- window.testMemberManagement() ← NEW! Test member management')
    console.log('- window.testCollectionCreation() ← NEW! Test collection creation')
    console.log('- window.testRealTimeCollections() ← NEW! Test real-time updates')
    console.log('- window.testUserProfile() ← NEW! Test user profile management')
    console.log('- window.testProfileModal() ← NEW! Test profile modal')
    console.log('- window.testUserDropdown() ← NEW! Test user dropdown')
    console.log('- window.runAllUserProfileTests() ← NEW! Run all profile tests')
    console.log('- window.testResponseViewerFix() ← NEW! Test response viewer fixes')
    console.log('- window.responseViewerTestChecklist() ← NEW! Response viewer checklist')
    console.log('- window.testRightSidebarFeatures() ← NEW! Test right sidebar features')
    console.log('- window.testCodeGeneration() ← NEW! Test code generation')
    console.log('- window.testSidebarInteraction() ← NEW! Test sidebar interaction')
    console.log('- window.rightSidebarTestChecklist() ← NEW! Right sidebar checklist')
    console.log('- window.testEnhancedResponseViewer() ← NEW! Test enhanced response viewer')
    console.log('- window.testCookieParsing() ← NEW! Test cookie parsing')
    console.log('- window.testResponseScrolling() ← NEW! Test response scrolling')
    console.log('- window.enhancedResponseViewerTestChecklist() ← NEW! Enhanced response checklist')
    console.log('- window.testAIIntegration() ← NEW! Test AI integration')
    console.log('- window.testAIActions() ← NEW! Test AI actions')
    console.log('- window.testAIRateLimit() ← NEW! Test AI rate limiting')
    console.log('- window.aiTestChecklist() ← NEW! AI test checklist')
    console.log('- window.testAIButtonVisibility() ← NEW! Test AI button visibility')
    console.log('- window.simulateAIButtonClick() ← NEW! Simulate AI button click')
    console.log('- window.testAIModalVisibility() ← NEW! Test AI modal visibility')
    console.log('- window.aiVisibilityChecklist() ← NEW! AI visibility checklist')
    console.log('- window.runAllLayoutTests() ← NEW! Run all layout verification tests')
    console.log('- window.verifyLayoutStructure() ← NEW! Verify layout structure')
    console.log('- window.verifyActionBar() ← NEW! Verify action bar')
    console.log('- window.testRightSidebarToggle() ← NEW! Test right sidebar toggle')
    console.log('- window.testAIButtonDropdown() ← NEW! Test AI button dropdown')
    console.log('- window.verifyResponsePanel() ← NEW! Verify response panel')
    console.log('- window.setTestResponse(response) ← NEW! Set test response data')
    console.log('- window.setTestResponseInApp() ← NEW! Set test response for layout testing')
    console.log('- window.setLargeTestResponse() ← NEW! Set large test response for scrolling')
    console.log('- window.createTestResponse() ← NEW! Create test response object')
    console.log('- window.createLargeTestResponse() ← NEW! Create large test response object')
    console.log('- window.runCompleteLayoutTest() ← NEW! Run complete layout test suite')
  }, [])

  // Handle keyboard shortcuts for tabs
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + T for new tab
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault()
        handleNewTab()
      }
      // Cmd/Ctrl + W for close tab
      else if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault()
        if (activeTabId) {
          handleTabClose(activeTabId)
        }
      }
      // Cmd/Ctrl + 1-9 for tab switching
      else if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault()
        const tabIndex = parseInt(e.key) - 1
        if (tabs[tabIndex]) {
          handleTabSelect(tabs[tabIndex].id)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeTabId, tabs])

  // Handle environment modal events
  useEffect(() => {
    const handleCreateEnvironment = () => {
      // This will be handled by the EnvironmentSelector component
    }

    const handleEditEnvironment = (event) => {
      // This will be handled by the EnvironmentSelector component
    }

    window.addEventListener('create-environment', handleCreateEnvironment)
    window.addEventListener('edit-environment', handleEditEnvironment)

    return () => {
      window.removeEventListener('create-environment', handleCreateEnvironment)
      window.removeEventListener('edit-environment', handleEditEnvironment)
    }
  }, [])

  const handleRequestSelect = (selectedRequest) => {
    console.log('Opening request in tab:', selectedRequest.name)
    openTab(selectedRequest)
    // Clear previous response when loading new request
    setResponse(null)
  }

  const handleNewTab = () => {
    if (user?.uid) {
      createNewTab(user.uid)
      setResponse(null)
    }
  }

  const handleTabClose = (tabId) => {
    closeTab(tabId)
    // Clear response if closing active tab
    if (tabId === activeTabId) {
      setResponse(null)
    }
  }

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId)
    setResponse(null) // Clear response when switching tabs
  }

  const handleTabSave = async (tabId) => {
    try {
      await saveTab(tabId)
    } catch (error) {
      console.error('Failed to save tab:', error)
    }
  }

  const handleTabDuplicate = (tab) => {
    duplicateTab(tab)
    setResponse(null)
  }

  const handleHistorySelect = (historyItem) => {
    console.log('History item selected:', historyItem)
    // Show the historical response as read-only
    setResponse({
      status: historyItem.status,
      statusText: historyItem.status >= 200 && historyItem.status < 300 ? 'OK' : 'Error',
      data: historyItem.responseData,
      headers: historyItem.responseHeaders || {},
      time: historyItem.time,
      size: historyItem.responseSize || 0,
      timestamp: historyItem.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      isHistorical: true // Flag to indicate this is from history
    })
  }

  // Get current active tab
  const activeTab = getActiveTab()

  // Get current environment variables for right sidebar
  const { environments, currentEnvironment } = useEnvironmentStore()
  const currentEnvVariables = currentEnvironment ? 
    environments.find(env => env.id === currentEnvironment)?.variables || {} : {}

  const handleSendRequest = async () => {
    if (!activeTab) {
      console.error('No active tab found')
      return
    }

    // Validate request before sending
    const validation = validateRequest(activeTab)
    if (!validation.isValid) {
      console.error('Request validation failed:', validation.errors)
      setResponse({
        error: validation.errors.join(', '),
        status: 0,
        statusText: 'Validation Error',
        data: { errors: validation.errors },
        headers: {},
        time: 0,
        size: 0,
        timestamp: new Date().toISOString()
      })
      return
    }

    setLoading(true)
    console.log('Sending request:', activeTab.name, activeTab.method, activeTab.url)

    try {
      // Process the request with variable replacement
      const processedRequest = {
        method: activeTab.method,
        url: replaceVariables(activeTab.url),
        headers: {},
        params: {},
        body: activeTab.body ? {
          ...activeTab.body,
          content: activeTab.body.content ? replaceVariables(activeTab.body.content) : activeTab.body.content
        } : undefined,
        auth: activeTab.auth ? {
          ...activeTab.auth,
          bearerToken: activeTab.auth.bearerToken ? replaceVariables(activeTab.auth.bearerToken) : activeTab.auth.bearerToken,
          basic: activeTab.auth.basic ? {
            username: replaceVariables(activeTab.auth.basic.username || ''),
            password: replaceVariables(activeTab.auth.basic.password || '')
          } : activeTab.auth.basic
        } : undefined
      }

      // Process headers with variable replacement
      Object.entries(activeTab.headers || {}).forEach(([key, value]) => {
        if (typeof value === 'object' && value.enabled !== false) {
          const replacedKey = replaceVariables(key)
          const replacedValue = replaceVariables(value.value || '')
          processedRequest.headers[replacedKey] = replacedValue
        } else if (typeof value === 'string') {
          const replacedKey = replaceVariables(key)
          const replacedValue = replaceVariables(value)
          processedRequest.headers[replacedKey] = replacedValue
        }
      })

      // Process params with variable replacement
      Object.entries(activeTab.params || {}).forEach(([key, value]) => {
        if (typeof value === 'object' && value.enabled !== false) {
          const replacedKey = replaceVariables(key)
          const replacedValue = replaceVariables(value.value || '')
          processedRequest.params[replacedKey] = replacedValue
        } else if (typeof value === 'string') {
          const replacedKey = replaceVariables(key)
          const replacedValue = replaceVariables(value)
          processedRequest.params[replacedKey] = replacedValue
        }
      })

      // Run the request using the clean request runner
      const result = await runRequest(processedRequest)
      
      console.log('Request completed:', result.status, result.time + 'ms')
      setResponse({
        ...result,
        timestamp: new Date().toISOString()
      })

      // Save to history
      if (user?.uid) {
        try {
          await addToHistory({
            workspaceId: user.uid,
            requestId: activeTab.id || null,
            method: activeTab.method,
            url: processedRequest.url,
            status: result.status || 0,
            time: result.time || 0,
            responseData: result.data,
            responseHeaders: result.headers,
            responseSize: result.size || 0
          })
        } catch (error) {
          console.error('Failed to save to history:', error)
        }
      }

    } catch (error) {
      console.error('Request failed:', error)
      setResponse({
        error: error.message || 'Request failed',
        status: 0,
        statusText: 'Error',
        data: { error: error.message },
        headers: {},
        time: 0,
        size: 0,
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }





  console.log("HEADER COMPONENT RENDERED - SimpleDashboard.jsx")
  
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white text-lg">Request Buddy</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">API Development Tool</p>
            </div>
          </div>
          
          {/* Member Management Button */}
          {currentWorkspace && (
            <button 
              onClick={() => setShowMemberModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              title="Manage Members"
            >
              <Users className="h-4 w-4" />
              <span>Members</span>
            </button>
          )}

          {/* Invitations Button */}
          {pendingInvites.length > 0 && (
            <button 
              onClick={() => setShowInvitationsModal(true)}
              className="relative flex items-center space-x-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              title="Workspace Invitations"
            >
              <Mail className="h-4 w-4" />
              <span>Invitations</span>
              <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingInvites.length}
              </span>
            </button>
          )}
          
          {/* Workspace Selector */}
          <div className="block">
            <WorkspaceSelector />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* History Toggle */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              showHistory 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            title="Toggle History"
          >
            <Clock className="h-4 w-4" />
          </button>

          {/* Environment Selector */}
          <EnvironmentSelector />

          {/* Theme Toggle */}
          <ThemeToggle />

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

          {/* User Profile Dropdown */}
          <UserProfileDropdown />
        </div>
      </header>

      {/* Main Layout Grid - 3 Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Collections */}
        <ResizablePanel 
          defaultWidth={320}
          minWidth={250}
          maxWidth={500}
          className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
        >
          <CollectionsSidebar onRequestSelect={handleRequestSelect} />
        </ResizablePanel>

        {/* History Sidebar - Optional */}
        {showHistory && (
          <ResizablePanel 
            defaultWidth={320}
            minWidth={250}
            maxWidth={500}
            className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
          >
            <HistorySidebar onHistorySelect={handleHistorySelect} />
          </ResizablePanel>
        )}

        {/* Main Content Area - Request Editor + Response */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Request Tabs */}
          <RequestTabs
            tabs={tabs}
            activeTabId={activeTabId}
            onTabSelect={handleTabSelect}
            onTabClose={handleTabClose}
            onNewTab={handleNewTab}
            onTabSave={handleTabSave}
            onTabDuplicate={handleTabDuplicate}
          />

          {/* Request Editor and Response Viewer */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Request Editor */}
            {activeTab ? (
              <div className={`${response ? 'flex-1 min-h-0' : 'flex-1'} bg-white dark:bg-gray-800 overflow-hidden`}>
                <RequestEditor 
                  request={{
                    ...activeTab,
                    onChange: (updates) => updateTab(activeTab.id, updates)
                  }}
                  response={response}
                  onSendRequest={handleSendRequest}
                  onSave={() => saveTab(activeTab.id)}
                  showRightSidebar={showRightSidebar}
                  onToggleRightSidebar={() => setShowRightSidebar(!showRightSidebar)}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
                <div className="text-center">
                  <div className="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
                    <Zap className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Request Open
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Select a request from the sidebar or create a new one
                  </p>
                  <button
                    onClick={handleNewTab}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    <Zap className="h-4 w-4" />
                    <span>New Request</span>
                  </button>
                </div>
              </div>
            )}

            {/* Response Viewer */}
            {response && (
              <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-1 min-h-0 max-h-96 overflow-hidden">
                <ResponseViewer response={response} />
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Fixed Width, No Overlap */}
        {showRightSidebar && (
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-shrink-0">
            <RightSidebar
              request={activeTab}
              environmentVariables={currentEnvVariables}
              isOpen={true}
              onToggle={() => setShowRightSidebar(false)}
            />
          </div>
        )}
      </div>

      {/* Member Management Modal */}
      <MemberManagementModal
        isOpen={showMemberModal}
        workspace={currentWorkspace}
        onClose={() => setShowMemberModal(false)}
      />

      {/* Workspace Invitations Modal */}
      <WorkspaceInvitationsModal
        isOpen={showInvitationsModal}
        onClose={() => setShowInvitationsModal(false)}
      />
    </div>
  )
}