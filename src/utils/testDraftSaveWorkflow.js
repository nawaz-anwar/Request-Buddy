/**
 * Test Draft-Based Save Workflow
 * 
 * This script tests the new draft-based save workflow to ensure:
 * 1. No Firebase writes during editing
 * 2. Single Firebase write on explicit save
 * 3. Correct unsaved changes detection
 * 4. Proper draft state management
 */

import { useRequestStore } from '../stores/requestStore'
import { useWorkspaceStore } from '../stores/workspaceStore'

// Mock Firebase to track writes
let firebaseWrites = []
const originalUpdateDoc = window.updateDoc
const originalAddDoc = window.addDoc

function mockFirebase() {
  firebaseWrites = []
  
  // Mock updateDoc
  window.updateDoc = (...args) => {
    firebaseWrites.push({ type: 'update', args })
    console.log('📝 Firebase UPDATE called:', args)
    return Promise.resolve()
  }
  
  // Mock addDoc
  window.addDoc = (...args) => {
    firebaseWrites.push({ type: 'add', args })
    console.log('📝 Firebase ADD called:', args)
    return Promise.resolve({ id: 'mock-id-' + Date.now() })
  }
}

function restoreFirebase() {
  window.updateDoc = originalUpdateDoc
  window.addDoc = originalAddDoc
}

function getFirebaseWriteCount() {
  return firebaseWrites.length
}

function resetFirebaseWrites() {
  firebaseWrites = []
}

/**
 * Test 1: No Firebase writes during editing
 */
export async function testNoAutoSave() {
  console.log('\n🧪 Test 1: No Firebase writes during editing')
  console.log('=' .repeat(60))
  
  const { createNewTab, updateTab, getDraft } = useRequestStore.getState()
  const { currentWorkspace } = useWorkspaceStore.getState()
  
  if (!currentWorkspace) {
    console.error('❌ No workspace selected')
    return false
  }
  
  mockFirebase()
  resetFirebaseWrites()
  
  // Create new tab
  const tab = createNewTab(currentWorkspace.id)
  console.log('✅ Created new tab:', tab.id)
  
  // Edit multiple fields
  console.log('\n📝 Editing fields...')
  updateTab(tab.id, { url: 'https://api.example.com/users' })
  console.log('  - Updated URL')
  
  updateTab(tab.id, { method: 'POST' })
  console.log('  - Updated method')
  
  updateTab(tab.id, { headers: { 'Content-Type': 'application/json' } })
  console.log('  - Updated headers')
  
  updateTab(tab.id, { body: { type: 'json', content: '{"name": "test"}' } })
  console.log('  - Updated body')
  
  // Check Firebase writes
  const writeCount = getFirebaseWriteCount()
  console.log(`\n📊 Firebase writes during editing: ${writeCount}`)
  
  if (writeCount === 0) {
    console.log('✅ PASS: No Firebase writes during editing')
  } else {
    console.error('❌ FAIL: Expected 0 writes, got', writeCount)
    restoreFirebase()
    return false
  }
  
  // Check draft state
  const draft = getDraft(tab.id)
  console.log('\n📋 Draft state:')
  console.log('  - Has changes:', draft.hasChanges)
  console.log('  - Draft URL:', draft.draftRequest.url)
  console.log('  - Saved URL:', draft.savedRequest?.url || 'null')
  
  if (draft.hasChanges) {
    console.log('✅ PASS: Changes detected correctly')
  } else {
    console.error('❌ FAIL: Changes not detected')
    restoreFirebase()
    return false
  }
  
  restoreFirebase()
  console.log('\n✅ Test 1 PASSED')
  return true
}

/**
 * Test 2: Single Firebase write on explicit save
 */
export async function testExplicitSave() {
  console.log('\n🧪 Test 2: Single Firebase write on explicit save')
  console.log('=' .repeat(60))
  
  const { createNewTab, updateTab, saveTab, getDraft } = useRequestStore.getState()
  const { currentWorkspace } = useWorkspaceStore.getState()
  
  if (!currentWorkspace) {
    console.error('❌ No workspace selected')
    return false
  }
  
  mockFirebase()
  resetFirebaseWrites()
  
  // Create and edit tab
  const tab = createNewTab(currentWorkspace.id)
  updateTab(tab.id, { url: 'https://api.example.com/test' })
  updateTab(tab.id, { name: 'Test Request' })
  
  console.log('✅ Created and edited tab')
  console.log(`📊 Firebase writes before save: ${getFirebaseWriteCount()}`)
  
  // Save tab
  console.log('\n💾 Saving tab...')
  await saveTab(tab.id)
  
  const writeCount = getFirebaseWriteCount()
  console.log(`📊 Firebase writes after save: ${writeCount}`)
  
  if (writeCount === 1) {
    console.log('✅ PASS: Exactly 1 Firebase write on save')
  } else {
    console.error('❌ FAIL: Expected 1 write, got', writeCount)
    restoreFirebase()
    return false
  }
  
  // Check draft state after save
  const draft = getDraft(tab.id)
  console.log('\n📋 Draft state after save:')
  console.log('  - Has changes:', draft.hasChanges)
  
  if (!draft.hasChanges) {
    console.log('✅ PASS: No unsaved changes after save')
  } else {
    console.error('❌ FAIL: Still has unsaved changes after save')
    restoreFirebase()
    return false
  }
  
  restoreFirebase()
  console.log('\n✅ Test 2 PASSED')
  return true
}

/**
 * Test 3: Unsaved changes detection
 */
export async function testUnsavedChangesDetection() {
  console.log('\n🧪 Test 3: Unsaved changes detection')
  console.log('=' .repeat(60))
  
  const { createNewTab, updateTab, saveTab, getDraft } = useRequestStore.getState()
  const { currentWorkspace } = useWorkspaceStore.getState()
  
  if (!currentWorkspace) {
    console.error('❌ No workspace selected')
    return false
  }
  
  mockFirebase()
  
  // Create tab
  const tab = createNewTab(currentWorkspace.id)
  let draft = getDraft(tab.id)
  
  console.log('📋 New tab - Has changes:', draft.hasChanges)
  if (draft.hasChanges) {
    console.log('✅ PASS: New tab has unsaved changes')
  } else {
    console.error('❌ FAIL: New tab should have unsaved changes')
    restoreFirebase()
    return false
  }
  
  // Save tab
  await saveTab(tab.id)
  draft = getDraft(tab.id)
  
  console.log('📋 After save - Has changes:', draft.hasChanges)
  if (!draft.hasChanges) {
    console.log('✅ PASS: No changes after save')
  } else {
    console.error('❌ FAIL: Should have no changes after save')
    restoreFirebase()
    return false
  }
  
  // Edit tab
  updateTab(tab.id, { url: 'https://api.example.com/modified' })
  draft = getDraft(tab.id)
  
  console.log('📋 After edit - Has changes:', draft.hasChanges)
  if (draft.hasChanges) {
    console.log('✅ PASS: Changes detected after edit')
  } else {
    console.error('❌ FAIL: Changes not detected after edit')
    restoreFirebase()
    return false
  }
  
  restoreFirebase()
  console.log('\n✅ Test 3 PASSED')
  return true
}

/**
 * Test 4: Draft state isolation between tabs
 */
export async function testDraftStateIsolation() {
  console.log('\n🧪 Test 4: Draft state isolation between tabs')
  console.log('=' .repeat(60))
  
  const { createNewTab, updateTab, getDraft } = useRequestStore.getState()
  const { currentWorkspace } = useWorkspaceStore.getState()
  
  if (!currentWorkspace) {
    console.error('❌ No workspace selected')
    return false
  }
  
  // Create two tabs
  const tab1 = createNewTab(currentWorkspace.id)
  const tab2 = createNewTab(currentWorkspace.id)
  
  console.log('✅ Created two tabs:', tab1.id, tab2.id)
  
  // Edit tab 1
  updateTab(tab1.id, { url: 'https://api.example.com/tab1' })
  updateTab(tab1.id, { name: 'Tab 1' })
  
  // Edit tab 2
  updateTab(tab2.id, { url: 'https://api.example.com/tab2' })
  updateTab(tab2.id, { name: 'Tab 2' })
  
  // Check drafts
  const draft1 = getDraft(tab1.id)
  const draft2 = getDraft(tab2.id)
  
  console.log('\n📋 Tab 1 draft:')
  console.log('  - URL:', draft1.draftRequest.url)
  console.log('  - Name:', draft1.draftRequest.name)
  console.log('  - Has changes:', draft1.hasChanges)
  
  console.log('\n📋 Tab 2 draft:')
  console.log('  - URL:', draft2.draftRequest.url)
  console.log('  - Name:', draft2.draftRequest.name)
  console.log('  - Has changes:', draft2.hasChanges)
  
  if (draft1.draftRequest.url !== draft2.draftRequest.url) {
    console.log('✅ PASS: Drafts are isolated')
  } else {
    console.error('❌ FAIL: Drafts are not isolated')
    return false
  }
  
  console.log('\n✅ Test 4 PASSED')
  return true
}

/**
 * Test 5: No save when no changes
 */
export async function testNoSaveWhenNoChanges() {
  console.log('\n🧪 Test 5: No save when no changes')
  console.log('=' .repeat(60))
  
  const { createNewTab, saveTab, getDraft } = useRequestStore.getState()
  const { currentWorkspace } = useWorkspaceStore.getState()
  
  if (!currentWorkspace) {
    console.error('❌ No workspace selected')
    return false
  }
  
  mockFirebase()
  
  // Create and save tab
  const tab = createNewTab(currentWorkspace.id)
  await saveTab(tab.id)
  
  resetFirebaseWrites()
  
  // Try to save again without changes
  console.log('💾 Attempting to save without changes...')
  await saveTab(tab.id)
  
  const writeCount = getFirebaseWriteCount()
  console.log(`📊 Firebase writes: ${writeCount}`)
  
  if (writeCount === 0) {
    console.log('✅ PASS: No Firebase write when no changes')
  } else {
    console.error('❌ FAIL: Should not write when no changes')
    restoreFirebase()
    return false
  }
  
  restoreFirebase()
  console.log('\n✅ Test 5 PASSED')
  return true
}

/**
 * Run all tests
 */
export async function runAllDraftSaveTests() {
  console.log('\n' + '='.repeat(60))
  console.log('🧪 DRAFT-BASED SAVE WORKFLOW TEST SUITE')
  console.log('='.repeat(60))
  
  const tests = [
    { name: 'No Auto-Save', fn: testNoAutoSave },
    { name: 'Explicit Save', fn: testExplicitSave },
    { name: 'Unsaved Changes Detection', fn: testUnsavedChangesDetection },
    { name: 'Draft State Isolation', fn: testDraftStateIsolation },
    { name: 'No Save When No Changes', fn: testNoSaveWhenNoChanges }
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    try {
      const result = await test.fn()
      if (result) {
        passed++
      } else {
        failed++
      }
    } catch (error) {
      console.error(`❌ Test "${test.name}" threw error:`, error)
      failed++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST RESULTS')
  console.log('='.repeat(60))
  console.log(`✅ Passed: ${passed}/${tests.length}`)
  console.log(`❌ Failed: ${failed}/${tests.length}`)
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED!')
  } else {
    console.log('\n⚠️  SOME TESTS FAILED')
  }
  
  return { passed, failed, total: tests.length }
}

// Export for browser console
if (typeof window !== 'undefined') {
  window.testNoAutoSave = testNoAutoSave
  window.testExplicitSave = testExplicitSave
  window.testUnsavedChangesDetection = testUnsavedChangesDetection
  window.testDraftStateIsolation = testDraftStateIsolation
  window.testNoSaveWhenNoChanges = testNoSaveWhenNoChanges
  window.runAllDraftSaveTests = runAllDraftSaveTests
  
  console.log('✅ Draft Save Workflow tests loaded!')
  console.log('Run: window.runAllDraftSaveTests()')
}
