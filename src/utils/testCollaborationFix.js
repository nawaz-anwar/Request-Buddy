// Test script to verify collaboration fixes
export const testCollaborationFix = () => {
  console.log('🧪 Testing Collaboration Fix...')
  
  // Test 1: Check if workspace store has migration function
  const workspaceStore = window.useWorkspaceStore?.getState?.()
  if (!workspaceStore) {
    console.error('❌ Workspace store not available')
    return false
  }
  
  console.log('✅ Workspace store available')
  console.log('📊 Current workspaces:', workspaceStore.workspaces?.length || 0)
  console.log('🏢 Current workspace:', workspaceStore.currentWorkspace?.name || 'None')
  console.log('🔄 Migration complete:', workspaceStore.migrationComplete)
  
  // Test 2: Check current workspace structure
  const currentWorkspace = workspaceStore.currentWorkspace
  if (currentWorkspace) {
    console.log('🔍 Workspace structure check:')
    console.log('  - ID:', currentWorkspace.id)
    console.log('  - Name:', currentWorkspace.name)
    console.log('  - Owner ID:', currentWorkspace.ownerId || '❌ MISSING')
    console.log('  - Members:', currentWorkspace.members ? Object.keys(currentWorkspace.members).length : '❌ MISSING')
    console.log('  - Member IDs:', currentWorkspace.memberIds?.length || '❌ MISSING')
    
    if (currentWorkspace.ownerId && currentWorkspace.members && currentWorkspace.memberIds) {
      console.log('✅ Workspace has proper collaboration structure')
      return true
    } else {
      console.log('⚠️ Workspace missing collaboration data - migration should fix this')
      return false
    }
  } else {
    console.log('⚠️ No current workspace selected')
    return false
  }
}

// Test member management modal
export const testMemberModal = () => {
  console.log('🧪 Testing Member Management Modal...')
  
  // Simulate opening the modal
  const event = new CustomEvent('open-member-modal')
  window.dispatchEvent(event)
  
  console.log('✅ Member modal test dispatched')
}

// Add to window for easy testing
if (typeof window !== 'undefined') {
  window.testCollaborationFix = testCollaborationFix
  window.testMemberModal = testMemberModal
}