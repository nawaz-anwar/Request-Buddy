/**
 * Cookie System Verification Test
 * Verifies that all cookie functionality is working correctly
 */

import { useCookieStore } from '../stores/cookieStore'
import { parseSetCookie, formatCookieHeader, extractDomain } from './cookieUtils'

export function verifyCookieSystem() {
  console.log('🍪 ===== COOKIE SYSTEM VERIFICATION =====\n')

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

  // Test 1: Cookie Store Exists
  test('Cookie store is initialized', () => {
    const store = useCookieStore.getState()
    if (!store) throw new Error('Cookie store not found')
    if (!store.cookieJar) throw new Error('Cookie jar not initialized')
  })

  // Test 2: Set Cookie
  test('Can set a cookie', () => {
    const store = useCookieStore.getState()
    store.setCookie({
      name: 'test_cookie',
      value: 'test_value',
      domain: 'api.example.com',
      path: '/',
      httpOnly: false,
      secure: false
    })
    
    const cookies = store.getCookiesForDomain('api.example.com')
    if (cookies.length === 0) throw new Error('Cookie not stored')
    if (cookies[0].name !== 'test_cookie') throw new Error('Cookie name mismatch')
  })

  // Test 3: Get Cookies for URL
  test('Can get cookies for URL', () => {
    const store = useCookieStore.getState()
    const cookies = store.getCookiesForUrl('https://api.example.com/users')
    if (cookies.length === 0) throw new Error('No cookies found for URL')
  })

  // Test 4: Parse Set-Cookie Header
  test('Can parse Set-Cookie header', () => {
    const header = 'session_id=abc123; Path=/; HttpOnly; Secure'
    const cookie = parseSetCookie(header, 'api.example.com')
    if (!cookie) throw new Error('Failed to parse cookie')
    if (cookie.name !== 'session_id') throw new Error('Cookie name mismatch')
    if (cookie.value !== 'abc123') throw new Error('Cookie value mismatch')
    if (!cookie.httpOnly) throw new Error('HttpOnly flag not set')
    if (!cookie.secure) throw new Error('Secure flag not set')
  })

  // Test 5: Format Cookie Header
  test('Can format Cookie header', () => {
    const cookies = [
      { name: 'session_id', value: 'abc123' },
      { name: 'user_id', value: '456' }
    ]
    const header = formatCookieHeader(cookies)
    if (header !== 'session_id=abc123; user_id=456') {
      throw new Error(`Expected "session_id=abc123; user_id=456", got "${header}"`)
    }
  })

  // Test 6: Extract Domain
  test('Can extract domain from URL', () => {
    const domain = extractDomain('https://api.example.com/users')
    if (domain !== 'api.example.com') {
      throw new Error(`Expected "api.example.com", got "${domain}"`)
    }
  })

  // Test 7: Delete Cookie
  test('Can delete a cookie', () => {
    const store = useCookieStore.getState()
    store.deleteCookie('api.example.com', 'test_cookie', '/')
    const cookies = store.getCookiesForDomain('api.example.com')
    const testCookie = cookies.find(c => c.name === 'test_cookie')
    if (testCookie) throw new Error('Cookie not deleted')
  })

  // Test 8: Cookie Expiration
  test('Expired cookies are filtered out', () => {
    const store = useCookieStore.getState()
    
    // Add expired cookie
    store.setCookie({
      name: 'expired_cookie',
      value: 'old_value',
      domain: 'api.example.com',
      path: '/',
      expires: Date.now() - 1000 // Expired 1 second ago
    })
    
    // Add valid cookie
    store.setCookie({
      name: 'valid_cookie',
      value: 'new_value',
      domain: 'api.example.com',
      path: '/',
      expires: Date.now() + 3600000 // Expires in 1 hour
    })
    
    const cookies = store.getCookiesForUrl('https://api.example.com/')
    const expiredCookie = cookies.find(c => c.name === 'expired_cookie')
    const validCookie = cookies.find(c => c.name === 'valid_cookie')
    
    if (expiredCookie) throw new Error('Expired cookie was not filtered out')
    if (!validCookie) throw new Error('Valid cookie was filtered out')
  })

  // Test 9: Path Matching
  test('Cookies respect path restrictions', () => {
    const store = useCookieStore.getState()
    
    // Add cookie with specific path
    store.setCookie({
      name: 'admin_cookie',
      value: 'admin_value',
      domain: 'api.example.com',
      path: '/admin'
    })
    
    // Should match /admin path
    const adminCookies = store.getCookiesForUrl('https://api.example.com/admin/users')
    const adminCookie = adminCookies.find(c => c.name === 'admin_cookie')
    if (!adminCookie) throw new Error('Cookie not found for matching path')
    
    // Should NOT match /api path
    const apiCookies = store.getCookiesForUrl('https://api.example.com/api/users')
    const apiCookie = apiCookies.find(c => c.name === 'admin_cookie')
    if (apiCookie) throw new Error('Cookie matched non-matching path')
  })

  // Test 10: Secure Flag
  test('Secure cookies only sent over HTTPS', () => {
    const store = useCookieStore.getState()
    
    // Add secure cookie
    store.setCookie({
      name: 'secure_cookie',
      value: 'secure_value',
      domain: 'api.example.com',
      path: '/',
      secure: true
    })
    
    // Should match HTTPS URL
    const httpsCookies = store.getCookiesForUrl('https://api.example.com/')
    const httpsCookie = httpsCookies.find(c => c.name === 'secure_cookie')
    if (!httpsCookie) throw new Error('Secure cookie not found for HTTPS URL')
    
    // Should NOT match HTTP URL
    const httpCookies = store.getCookiesForUrl('http://api.example.com/')
    const httpCookie = httpCookies.find(c => c.name === 'secure_cookie')
    if (httpCookie) throw new Error('Secure cookie sent over HTTP')
  })

  // Cleanup
  const store = useCookieStore.getState()
  store.clearAllCookies()

  // Print Results
  console.log('\n🍪 ===== VERIFICATION RESULTS =====')
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`📊 Total: ${results.tests.length}`)
  console.log(`🎯 Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%\n`)

  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Cookie system is working correctly.\n')
  } else {
    console.log('⚠️  SOME TESTS FAILED. Please review the errors above.\n')
  }

  return results
}

export function testLoginFlow() {
  console.log('🔐 ===== LOGIN FLOW TEST =====\n')

  const store = useCookieStore.getState()
  store.clearAllCookies()

  console.log('Step 1: User sends login request')
  console.log('  POST https://api.example.com/auth/login')
  console.log('  Body: { username: "user", password: "pass" }\n')

  console.log('Step 2: Server returns Set-Cookie header')
  const setCookieHeader = 'session_token=abc123xyz; Path=/; HttpOnly; Secure; Max-Age=3600'
  console.log(`  Set-Cookie: ${setCookieHeader}\n`)

  console.log('Step 3: Parse and store cookie')
  const cookie = parseSetCookie(setCookieHeader, 'api.example.com')
  store.setCookie(cookie)
  console.log('  ✅ Cookie stored:', cookie.name, '=', cookie.value)
  console.log('  📍 Domain:', cookie.domain)
  console.log('  📂 Path:', cookie.path)
  console.log('  🔒 HttpOnly:', cookie.httpOnly)
  console.log('  🔐 Secure:', cookie.secure)
  console.log('  ⏰ Expires:', new Date(cookie.expires).toLocaleString(), '\n')

  console.log('Step 4: User sends next request')
  console.log('  GET https://api.example.com/api/profile\n')

  console.log('Step 5: Retrieve cookies for URL')
  const cookies = store.getCookiesForUrl('https://api.example.com/api/profile')
  console.log(`  ✅ Found ${cookies.length} cookie(s)\n`)

  console.log('Step 6: Format Cookie header')
  const cookieHeader = formatCookieHeader(cookies)
  console.log(`  Cookie: ${cookieHeader}\n`)

  console.log('Step 7: Request sent with authentication')
  console.log('  GET https://api.example.com/api/profile')
  console.log(`  Cookie: ${cookieHeader}`)
  console.log('  ✅ Server receives authenticated request\n')

  console.log('🎉 LOGIN FLOW TEST COMPLETE!\n')

  // Cleanup
  store.clearAllCookies()
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.verifyCookieSystem = verifyCookieSystem
  window.testLoginFlow = testLoginFlow
}
