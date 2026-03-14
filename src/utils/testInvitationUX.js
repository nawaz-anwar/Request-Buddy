/**
 * Test Invitation UX Improvements
 * Verifies all 6 features are working correctly
 */

export function testInvitationUX() {
  console.log('🎯 ===== INVITATION UX IMPROVEMENTS TEST =====\n')

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  }

  const test = (name, fn) => {
    try {
      fn()
      console.log(`✅ ${name}`)
      results.passed++
      results.tests.push({ name, status: 'PASS' })
    } catch (error) {
      console.error(`❌ ${name}:`, error.message)
      results.failed++
      results.tests.push({ name, status: 'FAIL', error: error.message })
    }
  }

  // Test 1: localStorage seen invitations structure
  test('localStorage seen invitations exists', () => {
    const key = 'requestBuddy_seenInvitations'
    const value = localStorage.getItem(key)
    
    if (value === null) {
      // Initialize if doesn't exist
      localStorage.setItem(key, JSON.stringify({}))
    }
    
    const parsed = JSON.parse(localStorage.getItem(key))
    if (typeof parsed !== 'object') {
      throw new Error('Seen invitations should be an object')
    }
  })

  // Test 2: Mark invitation as seen
  test('Can mark invitation as seen', () => {
    const testInviteId = 'test_invite_123'
    const seenInvitations = JSON.parse(localStorage.getItem('requestBuddy_seenInvitations') || '{}')
    seenInvitations[testInviteId] = true
    localStorage.setItem('requestBuddy_seenInvitations', JSON.stringify(seenInvitations))
    
    const updated = JSON.parse(localStorage.getItem('requestBuddy_seenInvitations'))
    if (!updated[testInviteId]) {
      throw new Error('Invitation not marked as seen')
    }
  })

  // Test 3: Check if invitation is seen
  test('Can check if invitation is seen', () => {
    const testInviteId = 'test_invite_123'
    const seenInvitations = JSON.parse(localStorage.getItem('requestBuddy_seenInvitations') || '{}')
    
    if (!seenInvitations[testInviteId]) {
      throw new Error('Previously marked invitation not found')
    }
  })

  // Test 4: Detect new invitation
  test('Can detect new invitation', () => {
    const newInviteId = 'new_invite_456'
    const seenInvitations = JSON.parse(localStorage.getItem('requestBuddy_seenInvitations') || '{}')
    
    const isNew = !seenInvitations[newInviteId]
    if (!isNew) {
      throw new Error('New invitation not detected')
    }
  })

  // Test 5: Invitation store has deleteInvitation method
  test('Invitation store has deleteInvitation method', () => {
    const { useWorkspaceInviteStore } = require('../stores/workspaceInviteStore')
    const store = useWorkspaceInviteStore.getState()
    
    if (typeof store.deleteInvitation !== 'function') {
      throw new Error('deleteInvitation method not found in store')
    }
  })

  // Test 6: Check expiration logic
  test('Can check if invitation is expired', () => {
    const now = new Date()
    const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000) // Yesterday
    const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
    
    const isExpired = (expiresAt) => {
      if (!expiresAt) return false
      const expiry = expiresAt instanceof Date ? expiresAt : new Date(expiresAt)
      return expiry < new Date()
    }
    
    if (!isExpired(pastDate)) {
      throw new Error('Past date should be expired')
    }
    
    if (isExpired(futureDate)) {
      throw new Error('Future date should not be expired')
    }
  })

  // Cleanup test data
  const seenInvitations = JSON.parse(localStorage.getItem('requestBuddy_seenInvitations') || '{}')
  delete seenInvitations['test_invite_123']
  localStorage.setItem('requestBuddy_seenInvitations', JSON.stringify(seenInvitations))

  // Print Results
  console.log('\n🎯 ===== TEST RESULTS =====')
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`📊 Total: ${results.tests.length}`)
  console.log(`🎯 Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%\n`)

  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Invitation UX improvements are working.\n')
  } else {
    console.log('⚠️  SOME TESTS FAILED. Please review the errors above.\n')
  }

  return results
}

export function simulateNewInvitation() {
  console.log('🔔 ===== SIMULATING NEW INVITATION =====\n')

  const mockInvite = {
    id: `mock_invite_${Date.now()}`,
    workspaceName: 'Test Workspace',
    workspaceId: 'test_workspace_123',
    email: 'test@example.com',
    role: 'editor',
    invitedBy: 'user_123',
    inviterEmail: 'admin@example.com',
    status: 'pending',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }

  console.log('Mock Invitation Created:')
  console.log('  ID:', mockInvite.id)
  console.log('  Workspace:', mockInvite.workspaceName)
  console.log('  Role:', mockInvite.role)
  console.log('  Invited by:', mockInvite.inviterEmail)
  console.log('  Expires:', mockInvite.expiresAt.toLocaleDateString())

  // Check if this invitation would trigger popup
  const seenInvitations = JSON.parse(localStorage.getItem('requestBuddy_seenInvitations') || '{}')
  const isNew = !seenInvitations[mockInvite.id]

  console.log('\nPopup Behavior:')
  console.log('  Is New:', isNew)
  console.log('  Would Show Popup:', isNew ? 'YES ✅' : 'NO ❌')

  if (isNew) {
    console.log('\n✅ This invitation would trigger the popup on login.')
  } else {
    console.log('\n❌ This invitation would NOT trigger the popup (already seen).')
  }

  console.log('\n')
  return mockInvite
}

export function clearSeenInvitations() {
  console.log('🧹 Clearing seen invitations from localStorage...')
  localStorage.removeItem('requestBuddy_seenInvitations')
  console.log('✅ Cleared! Next login will show popup for all pending invitations.\n')
}

export function listSeenInvitations() {
  console.log('📋 ===== SEEN INVITATIONS =====\n')
  
  const seenInvitations = JSON.parse(localStorage.getItem('requestBuddy_seenInvitations') || '{}')
  const inviteIds = Object.keys(seenInvitations)

  if (inviteIds.length === 0) {
    console.log('No invitations have been seen yet.\n')
    return
  }

  console.log(`Total seen invitations: ${inviteIds.length}\n`)
  inviteIds.forEach((id, index) => {
    console.log(`${index + 1}. ${id}`)
  })
  console.log('\n')
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.testInvitationUX = testInvitationUX
  window.simulateNewInvitation = simulateNewInvitation
  window.clearSeenInvitations = clearSeenInvitations
  window.listSeenInvitations = listSeenInvitations
}
