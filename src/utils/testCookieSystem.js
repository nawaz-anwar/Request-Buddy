/**
 * Cookie System Test Suite
 * Run this in browser console to test cookie functionality
 */

export async function testCookieSystem() {
  console.log('🍪 Starting Cookie System Tests...\n')
  
  const { useCookieStore } = await import('../stores/cookieStore.js')
  const cookieUtils = await import('./cookieUtils.js')
  
  const cookieStore = useCookieStore.getState()
  let passedTests = 0
  let failedTests = 0
  
  // Helper function
  const test = (name, fn) => {
    try {
      fn()
      console.log(`✅ ${name}`)
      passedTests++
    } catch (error) {
      console.error(`❌ ${name}:`, error.message)
      failedTests++
    }
  }
  
  // Clear all cookies before testing
  cookieStore.clearAllCookies()
  
  // Test 1: Set Cookie
  test('Set Cookie', () => {
    cookieStore.setCookie({
      name: 'test_cookie',
      value: 'test_value',
      domain: 'api.example.com',
      path: '/',
      httpOnly: false,
      secure: false
    })
    
    const cookies = cookieStore.getCookiesForDomain('api.example.com')
    if (cookies.length !== 1) throw new Error('Cookie not added')
    if (cookies[0].name !== 'test_cookie') throw new Error('Cookie name mismatch')
  })
  
  // Test 2: Get Cookies for URL
  test('Get Cookies for URL', () => {
    const cookies = cookieStore.getCookiesForUrl('https://api.example.com/users')
    if (cookies.length !== 1) throw new Error('Cookie not found for URL')
  })
  
  // Test 3: Multiple Cookies
  test('Multiple Cookies', () => {
    cookieStore.setCookie({
      name: 'session_id',
      value: 'abc123',
      domain: 'api.example.com',
      path: '/',
      httpOnly: true,
      secure: true
    })
    
    const cookies = cookieStore.getCookiesForDomain('api.example.com')
    if (cookies.length !== 2) throw new Error('Expected 2 cookies')
  })
  
  // Test 4: Cookie Expiration
  test('Cookie Expiration', () => {
    const expiredTime = Date.now() - 1000 // 1 second ago
    cookieStore.setCookie({
      name: 'expired_cookie',
      value: 'old_value',
      domain: 'api.example.com',
      path: '/',
      expires: expiredTime
    })
    
    // Expired cookies should be filtered out
    const cookies = cookieStore.getCookiesForUrl('https://api.example.com/users')
    const hasExpired = cookies.some(c => c.name === 'expired_cookie')
    if (hasExpired) throw new Error('Expired cookie should be filtered')
  })
  
  // Test 5: Path Matching
  test('Path Matching', () => {
    cookieStore.setCookie({
      name: 'admin_token',
      value: 'secret',
      domain: 'api.example.com',
      path: '/admin'
    })
    
    const adminCookies = cookieStore.getCookiesForUrl('https://api.example.com/admin/users')
    const apiCookies = cookieStore.getCookiesForUrl('https://api.example.com/api/users')
    
    const hasAdminToken = adminCookies.some(c => c.name === 'admin_token')
    const apiHasAdminToken = apiCookies.some(c => c.name === 'admin_token')
    
    if (!hasAdminToken) throw new Error('Admin token should be in /admin path')
    if (apiHasAdminToken) throw new Error('Admin token should not be in /api path')
  })
  
  // Test 6: Secure Flag
  test('Secure Flag', () => {
    cookieStore.setCookie({
      name: 'secure_cookie',
      value: 'secure_value',
      domain: 'api.example.com',
      path: '/',
      secure: true
    })
    
    const httpsCookies = cookieStore.getCookiesForUrl('https://api.example.com/users')
    const httpCookies = cookieStore.getCookiesForUrl('http://api.example.com/users')
    
    const httpsHasSecure = httpsCookies.some(c => c.name === 'secure_cookie')
    const httpHasSecure = httpCookies.some(c => c.name === 'secure_cookie')
    
    if (!httpsHasSecure) throw new Error('Secure cookie should be sent over HTTPS')
    if (httpHasSecure) throw new Error('Secure cookie should not be sent over HTTP')
  })
  
  // Test 7: Delete Cookie
  test('Delete Cookie', () => {
    cookieStore.deleteCookie('api.example.com', 'test_cookie', '/')
    const cookies = cookieStore.getCookiesForDomain('api.example.com')
    const hasTestCookie = cookies.some(c => c.name === 'test_cookie')
    if (hasTestCookie) throw new Error('Cookie should be deleted')
  })
  
  // Test 8: Parse Set-Cookie Header
  test('Parse Set-Cookie Header', () => {
    const header = 'session_id=abc123; Path=/; HttpOnly; Secure; Max-Age=3600'
    const cookie = cookieUtils.parseSetCookie(header, 'api.example.com')
    
    if (!cookie) throw new Error('Failed to parse cookie')
    if (cookie.name !== 'session_id') throw new Error('Name mismatch')
    if (cookie.value !== 'abc123') throw new Error('Value mismatch')
    if (!cookie.httpOnly) throw new Error('HttpOnly flag not set')
    if (!cookie.secure) throw new Error('Secure flag not set')
    if (!cookie.expires) throw new Error('Expires not set from Max-Age')
  })
  
  // Test 9: Format Cookie Header
  test('Format Cookie Header', () => {
    const cookies = [
      { name: 'session_id', value: 'abc123' },
      { name: 'user_pref', value: 'dark_mode' }
    ]
    
    const header = cookieUtils.formatCookieHeader(cookies)
    if (header !== 'session_id=abc123; user_pref=dark_mode') {
      throw new Error('Cookie header format incorrect')
    }
  })
  
  // Test 10: Extract Domain
  test('Extract Domain', () => {
    const domain = cookieUtils.extractDomain('https://api.example.com/users?id=123')
    if (domain !== 'api.example.com') throw new Error('Domain extraction failed')
  })
  
  // Test 11: Cookie Name Validation
  test('Cookie Name Validation', () => {
    if (!cookieUtils.isValidCookieName('valid_name')) {
      throw new Error('Valid name rejected')
    }
    if (cookieUtils.isValidCookieName('invalid name')) {
      throw new Error('Invalid name accepted (space)')
    }
    if (cookieUtils.isValidCookieName('invalid;name')) {
      throw new Error('Invalid name accepted (semicolon)')
    }
  })
  
  // Test 12: LocalStorage Persistence
  test('LocalStorage Persistence', () => {
    const key = 'request-buddy-cookies'
    const stored = localStorage.getItem(key)
    if (!stored) throw new Error('Cookies not persisted to localStorage')
    
    const parsed = JSON.parse(stored)
    if (!parsed.state || !parsed.state.cookieJar) {
      throw new Error('Invalid localStorage structure')
    }
  })
  
  // Test 13: Export/Import Cookies
  test('Export/Import Cookies', () => {
    const exported = cookieStore.exportCookies()
    if (!exported) throw new Error('Export failed')
    
    cookieStore.clearAllCookies()
    const success = cookieStore.importCookies(exported)
    if (!success) throw new Error('Import failed')
    
    const cookies = cookieStore.getCookiesForDomain('api.example.com')
    if (cookies.length === 0) throw new Error('Cookies not restored after import')
  })
  
  // Test 14: Cleanup Expired Cookies
  test('Cleanup Expired Cookies', () => {
    // Add expired cookie
    cookieStore.setCookie({
      name: 'old_cookie',
      value: 'old',
      domain: 'test.com',
      path: '/',
      expires: Date.now() - 10000
    })
    
    // Add valid cookie
    cookieStore.setCookie({
      name: 'new_cookie',
      value: 'new',
      domain: 'test.com',
      path: '/',
      expires: Date.now() + 10000
    })
    
    cookieStore.cleanupExpiredCookies()
    
    const cookies = cookieStore.getCookiesForDomain('test.com')
    const hasOld = cookies.some(c => c.name === 'old_cookie')
    const hasNew = cookies.some(c => c.name === 'new_cookie')
    
    if (hasOld) throw new Error('Expired cookie not cleaned up')
    if (!hasNew) throw new Error('Valid cookie was removed')
  })
  
  // Test 15: Cookie Update (Same Name/Path)
  test('Cookie Update', () => {
    cookieStore.setCookie({
      name: 'update_test',
      value: 'old_value',
      domain: 'test.com',
      path: '/'
    })
    
    cookieStore.setCookie({
      name: 'update_test',
      value: 'new_value',
      domain: 'test.com',
      path: '/'
    })
    
    const cookies = cookieStore.getCookiesForDomain('test.com')
    const updateCookies = cookies.filter(c => c.name === 'update_test')
    
    if (updateCookies.length !== 1) throw new Error('Cookie not updated, duplicate exists')
    if (updateCookies[0].value !== 'new_value') throw new Error('Cookie value not updated')
  })
  
  // Summary
  console.log('\n' + '='.repeat(50))
  console.log(`✅ Passed: ${passedTests}`)
  console.log(`❌ Failed: ${failedTests}`)
  console.log(`📊 Total: ${passedTests + failedTests}`)
  console.log('='.repeat(50))
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! Cookie system is working correctly.')
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.')
  }
  
  // Clean up test cookies
  cookieStore.clearAllCookies()
  console.log('\n🧹 Test cookies cleaned up.')
  
  return {
    passed: passedTests,
    failed: failedTests,
    total: passedTests + failedTests
  }
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  window.testCookieSystem = testCookieSystem
  console.log('💡 Run testCookieSystem() in console to test the cookie system')
}
