// Test script to verify workspace system is working
export const testWorkspaceSystem = async () => {
  console.log('🧪 Testing Workspace System...')
  
  // Get the workspace store
  const workspaceStore = window.useWorkspaceStore?.getState?.()
  if (!workspaceStore) {
    console.error('❌ Workspace store not available')
    return false
  }
  
  console.log('✅ Workspace store available')
  
  // Check current state
  console.log('📊 Current state:')
  console.log('  - Workspaces:', workspaceStore.workspaces?.length || 0)
  console.log('  - Current workspace:', workspaceStore.currentWorkspace?.name || 'None')
  console.log('  - Current workspace ID:', workspaceStore.currentWorkspace?.id || 'None')
  console.log('  - Migration complete:', workspaceStore.migrationComplete)
  console.log('  - Loading:', workspaceStore.loading)
  
  // Check if current workspace has proper structure
  if (workspaceStore.currentWorkspace) {
    const ws = workspaceStore.currentWorkspace
    console.log('🔍 Workspace structure:')
    console.log('  - ID:', ws.id)
    console.log('  - Name:', ws.name)
    console.log('  - Owner ID:', ws.ownerId)
    console.log('  - Members:', ws.members ? Object.keys(ws.members) : 'None')
    console.log('  - Member IDs:', ws.memberIds || 'None')
  }
  
  // Test workspace creation if none exist
  if (workspaceStore.workspaces?.length === 0) {
    console.log('🏗️ No workspaces found, testing creation...')
    
    try {
      const userId = window.useAuthStore?.getState?.()?.user?.uid
      if (!userId) {
        console.error('❌ No authenticated user found')
        return false
      }
      
      console.log('👤 User ID:', userId)
      
      // Create a test workspace
      const workspaceId = await workspaceStore.createWorkspace('Test Workspace', userId)
      console.log('✅ Workspace created with ID:', workspaceId)
      
      // Wait a moment for the subscription to update
      setTimeout(() => {
        const updatedState = window.useWorkspaceStore.getState()
        console.log('📊 Updated state:')
        console.log('  - Workspaces:', updatedState.workspaces?.length || 0)
        console.log('  - Current workspace:', updatedState.currentWorkspace?.name || 'None')
        console.log('  - Current workspace ID:', updatedState.currentWorkspace?.id || 'None')
      }, 1000)
      
      return true
    } catch (error) {
      console.error('❌ Failed to create workspace:', error)
      return false
    }
  } else {
    console.log('✅ Workspaces already exist')
    return true
  }
}

// Test collection creation with proper workspace ID
export const testCollectionCreation = async () => {
  console.log('🧪 Testing Collection Creation...')
  
  const workspaceStore = window.useWorkspaceStore?.getState?.()
  const collectionStore = window.useCollectionStore?.getState?.()
  
  if (!workspaceStore?.currentWorkspace) {
    console.error('❌ No current workspace')
    return false
  }
  
  if (!collectionStore) {
    console.error('❌ Collection store not available')
    return false
  }
  
  try {
    const workspaceId = workspaceStore.currentWorkspace.id
    console.log('🏢 Using workspace ID:', workspaceId)
    
    const collectionData = {
      name: 'Test Collection',
      description: 'Test collection created via script',
      workspaceId: workspaceId
    }
    
    console.log('📦 Creating collection:', collectionData)
    const collectionId = await collectionStore.createCollection(collectionData)
    console.log('✅ Collection created with ID:', collectionId)
    
    return true
  } catch (error) {
    console.error('❌ Failed to create collection:', error)
    return false
  }
}

// Test member management
export const testMemberManagement = async () => {
  console.log('🧪 Testing Member Management...')
  
  const workspaceStore = window.useWorkspaceStore?.getState?.()
  const currentWorkspace = workspaceStore?.currentWorkspace
  
  if (!currentWorkspace) {
    console.error('❌ No current workspace')
    return false
  }
  
  console.log('🏢 Testing with workspace:', currentWorkspace.name)
  console.log('👥 Current members:', Object.keys(currentWorkspace.members || {}).length)
  
  // Test inviting a user
  try {
    const userId = window.useAuthStore?.getState?.()?.user?.uid
    const testEmail = 'test@example.com'
    
    console.log('📧 Inviting user:', testEmail)
    const result = await workspaceStore.inviteUser(currentWorkspace.id, testEmail, 'editor', userId)
    console.log('✅ User invited successfully:', result)
    
    return true
  } catch (error) {
    console.error('❌ Failed to invite user:', error)
    return false
  }
}

// Test real-time collection updates
export const testRealTimeCollections = () => {
  console.log('🧪 Testing Real-Time Collection Updates...')
  
  const collectionStore = window.useCollectionStore?.getState?.()
  const workspaceStore = window.useWorkspaceStore?.getState?.()
  
  if (!collectionStore || !workspaceStore?.currentWorkspace) {
    console.error('❌ Stores not available or no workspace')
    return false
  }
  
  console.log('📊 Current collection state:')
  console.log('  - Collections count:', collectionStore.collections?.length || 0)
  console.log('  - Collections:', collectionStore.collections?.map(c => c.name) || [])
  console.log('  - Subscription active:', !!collectionStore.unsubscribeCollections)
  console.log('  - Current workspace:', workspaceStore.currentWorkspace?.name)
  console.log('  - Workspace ID:', workspaceStore.currentWorkspace?.id)
  
  // Test if subscription is working by creating a collection
  console.log('🔄 Creating test collection to verify real-time updates...')
  
  const testCollection = {
    name: `Real-Time Test ${Date.now()}`,
    description: 'Testing real-time updates',
    workspaceId: workspaceStore.currentWorkspace.id
  }
  
  collectionStore.createCollection(testCollection)
    .then(id => {
      console.log('✅ Test collection created with ID:', id)
      console.log('⏳ Check if it appears in the UI automatically...')
      
      // Check after a short delay
      setTimeout(() => {
        const updatedState = window.useCollectionStore.getState()
        const newCollection = updatedState.collections.find(c => c.id === id)
        if (newCollection) {
          console.log('✅ Real-time update working! Collection appeared:', newCollection.name)
        } else {
          console.log('❌ Real-time update not working - collection not found in store')
        }
      }, 1000)
    })
    .catch(error => {
      console.error('❌ Failed to create test collection:', error)
    })
  
  return true
}

// Add to window for easy testing
if (typeof window !== 'undefined') {
  window.testWorkspaceSystem = testWorkspaceSystem
  window.testMemberManagement = testMemberManagement
  window.testCollectionCreation = testCollectionCreation
  window.testRealTimeCollections = testRealTimeCollections
}