/**
 * Google Authentication Diagnostic Tool
 * 
 * Run this in browser console to diagnose Google auth issues:
 * 
 * import('/src/utils/testGoogleAuth.js').then(m => m.diagnoseGoogleAuth())
 */

import { auth, googleProvider, firebaseConfig } from '../services/firebase'
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth'

export async function diagnoseGoogleAuth() {
  console.log('🔍 Starting Google Authentication Diagnosis...\n')
  
  const results = {
    passed: [],
    failed: [],
    warnings: []
  }
  
  // Test 1: Firebase Config
  console.log('1️⃣ Checking Firebase Configuration...')
  try {
    if (!firebaseConfig.apiKey) throw new Error('Missing API Key')
    if (!firebaseConfig.authDomain) throw new Error('Missing Auth Domain')
    if (!firebaseConfig.projectId) throw new Error('Missing Project ID')
    
    console.log('✅ Firebase config is valid')
    console.log('   Project ID:', firebaseConfig.projectId)
    console.log('   Auth Domain:', firebaseConfig.authDomain)
    results.passed.push('Firebase configuration')
  } catch (error) {
    console.error('❌ Firebase config error:', error.message)
    results.failed.push(`Firebase configuration: ${error.message}`)
  }
  
  // Test 2: Auth Instance
  console.log('\n2️⃣ Checking Auth Instance...')
  try {
    if (!auth) throw new Error('Auth instance not initialized')
    console.log('✅ Auth instance exists')
    console.log('   Current User:', auth.currentUser ? auth.currentUser.email : 'None')
    results.passed.push('Auth instance')
  } catch (error) {
    console.error('❌ Auth instance error:', error.message)
    results.failed.push(`Auth instance: ${error.message}`)
  }
  
  // Test 3: Google Provider
  console.log('\n3️⃣ Checking Google Provider...')
  try {
    if (!googleProvider) throw new Error('Google provider not initialized')
    console.log('✅ Google provider exists')
    console.log('   Provider ID:', googleProvider.providerId)
    console.log('   Custom Parameters:', googleProvider.customParameters)
    console.log('   Scopes:', googleProvider.scopes)
    results.passed.push('Google provider')
  } catch (error) {
    console.error('❌ Google provider error:', error.message)
    results.failed.push(`Google provider: ${error.message}`)
  }
  
  // Test 4: Current Domain
  console.log('\n4️⃣ Checking Current Domain...')
  const currentDomain = window.location.hostname
  console.log('   Current domain:', currentDomain)
  
  const authorizedDomains = [
    'localhost',
    'teamapi-96507.firebaseapp.com',
    'teamapi-96507.web.app'
  ]
  
  if (authorizedDomains.includes(currentDomain)) {
    console.log('✅ Domain should be authorized')
    results.passed.push('Domain authorization')
  } else {
    console.warn('⚠️  Domain may not be authorized in Firebase Console')
    console.warn('   Add this domain to Firebase Console:')
    console.warn('   Authentication → Settings → Authorized domains')
    results.warnings.push(`Domain ${currentDomain} may not be authorized`)
  }
  
  // Test 5: Popup Blocker
  console.log('\n5️⃣ Checking Popup Blocker...')
  try {
    const testPopup = window.open('', '_blank', 'width=1,height=1')
    if (testPopup) {
      testPopup.close()
      console.log('✅ Popups are allowed')
      results.passed.push('Popup blocker')
    } else {
      console.warn('⚠️  Popups may be blocked')
      console.warn('   Allow popups for this site in browser settings')
      results.warnings.push('Popups may be blocked')
    }
  } catch (error) {
    console.warn('⚠️  Could not test popup blocker:', error.message)
    results.warnings.push('Could not test popup blocker')
  }
  
  // Test 6: Network Connectivity
  console.log('\n6️⃣ Checking Network Connectivity...')
  try {
    const response = await fetch('https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=' + firebaseConfig.apiKey)
    if (response.ok) {
      console.log('✅ Can reach Firebase Auth servers')
      results.passed.push('Network connectivity')
    } else {
      throw new Error(`HTTP ${response.status}`)
    }
  } catch (error) {
    console.error('❌ Network error:', error.message)
    results.failed.push(`Network connectivity: ${error.message}`)
  }
  
  // Test 7: Check for Redirect Result
  console.log('\n7️⃣ Checking for Redirect Result...')
  try {
    const result = await getRedirectResult(auth)
    if (result) {
      console.log('✅ Found redirect result:', result.user.email)
      results.passed.push('Redirect result found')
    } else {
      console.log('ℹ️  No pending redirect result (this is normal)')
    }
  } catch (error) {
    console.error('❌ Redirect result error:', error.message)
    results.failed.push(`Redirect result: ${error.message}`)
  }
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 DIAGNOSIS SUMMARY')
  console.log('='.repeat(60))
  
  console.log('\n✅ PASSED (' + results.passed.length + '):')
  results.passed.forEach(item => console.log('   • ' + item))
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS (' + results.warnings.length + '):')
    results.warnings.forEach(item => console.log('   • ' + item))
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ FAILED (' + results.failed.length + '):')
    results.failed.forEach(item => console.log('   • ' + item))
  }
  
  console.log('\n' + '='.repeat(60))
  
  if (results.failed.length === 0) {
    console.log('✅ All critical tests passed!')
    console.log('\nℹ️  If Google sign-in still doesn\'t work, try:')
    console.log('   1. Check Firebase Console → Authentication → Sign-in method')
    console.log('   2. Verify Google provider is enabled')
    console.log('   3. Check browser console for errors when clicking sign-in')
    console.log('   4. Try: await testGoogleSignIn()')
  } else {
    console.log('❌ Some tests failed. Fix the issues above and try again.')
  }
  
  return results
}

export async function testGoogleSignIn() {
  console.log('🧪 Testing Google Sign-In with Popup...\n')
  
  try {
    console.log('1️⃣ Calling signInWithPopup...')
    const result = await signInWithPopup(auth, googleProvider)
    
    console.log('✅ Sign-in successful!')
    console.log('   User ID:', result.user.uid)
    console.log('   Email:', result.user.email)
    console.log('   Display Name:', result.user.displayName)
    console.log('   Photo URL:', result.user.photoURL)
    
    return result.user
  } catch (error) {
    console.error('❌ Sign-in failed!')
    console.error('   Error Code:', error.code)
    console.error('   Error Message:', error.message)
    
    // Provide specific guidance based on error code
    switch (error.code) {
      case 'auth/popup-blocked':
        console.log('\n💡 Solution: Allow popups for this site')
        console.log('   Or try: await testGoogleSignInRedirect()')
        break
      case 'auth/popup-closed-by-user':
        console.log('\n💡 Solution: Complete the sign-in process')
        break
      case 'auth/unauthorized-domain':
        console.log('\n💡 Solution: Add domain to Firebase Console')
        console.log('   Firebase Console → Authentication → Settings → Authorized domains')
        console.log('   Add:', window.location.hostname)
        break
      case 'auth/operation-not-allowed':
        console.log('\n💡 Solution: Enable Google sign-in in Firebase Console')
        console.log('   Firebase Console → Authentication → Sign-in method → Google')
        break
      case 'auth/cancelled-popup-request':
        console.log('\n💡 Solution: Wait a moment and try again')
        break
      default:
        console.log('\n💡 Check GOOGLE_AUTH_FIX.md for more troubleshooting steps')
    }
    
    throw error
  }
}

export async function testGoogleSignInRedirect() {
  console.log('🧪 Testing Google Sign-In with Redirect...\n')
  
  try {
    console.log('1️⃣ Calling signInWithRedirect...')
    console.log('   You will be redirected to Google...')
    await signInWithRedirect(auth, googleProvider)
    console.log('✅ Redirect initiated')
  } catch (error) {
    console.error('❌ Redirect failed!')
    console.error('   Error Code:', error.code)
    console.error('   Error Message:', error.message)
    throw error
  }
}

// Auto-run diagnosis if loaded directly
if (typeof window !== 'undefined') {
  console.log('Google Auth Diagnostic Tool Loaded')
  console.log('Run: diagnoseGoogleAuth() to start diagnosis')
  console.log('Run: testGoogleSignIn() to test popup sign-in')
  console.log('Run: testGoogleSignInRedirect() to test redirect sign-in')
  
  // Make functions available globally for easy access
  window.diagnoseGoogleAuth = diagnoseGoogleAuth
  window.testGoogleSignIn = testGoogleSignIn
  window.testGoogleSignInRedirect = testGoogleSignInRedirect
}
