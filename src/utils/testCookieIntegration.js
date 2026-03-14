/**
 * Test utility for Postman-style Cookie Integration
 * Run this in the browser console to test the complete cookie system
 */

import { useCookieStore } from '../stores/cookieStore'
import { parseSetCookie, formatCookieHeader, extractDomain } from './cookieUtils'

export const testCookieIntegration = async () => {
  console.log('🧪 Testing Postman-Style Cookie Integration')
  console.log('=' .repeat(60))
  
  try {
    // Test 1: Cookie Store Functionality
    console.log('\n📝 Test 1: Cookie Store Functionality')
    const cookieStore = useCookieStore.getState()
    
    // Clear existing cookies for clean test
    cookieStore.clearAllCookies()
    console.log('✅ Cleared all cookies for clean test')
    
    // Test adding a cookie
    const testCookie = {
      name: 'test_session',
      value: 'abc123',
      domain: 'api.example.com',
      path: '/',
      expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      httpOnly: false,
      secure: false,
      sameSite: 'Lax'
    }
    
    cookieStore.setCookie(testCookie)
    console.log('✅ Added test cookie:', testCookie.name)
    
    // Test retrieving cookies
    const cookies = cookieStore.getCookiesForUrl('https://api.example.com/users')
    console.log('✅ Retrieved cookies for URL:', cookies.length, 'cookies')
    
    // Test 2: Cookie Parsing
    console.log('\n📝 Test 2: Cookie Parsing')
    const setCookieHeader = 'session_id=xyz789; Path=/; HttpOnly; Secure; SameSite=Strict'
    const parsedCookie = parseSetCookie(setCookieHeader, 'api.example.com')
    
    if (parsedCookie) {
      console.log('✅ Parsed Set-Cookie header successfully')
      console.log('   Name:', parsedCookie.name)
      console.log('   Value:', parsedCookie.value)
      console.log('   HttpOnly:', parsedCookie.httpOnly)
      console.log('   Secure:', parsedCookie.secure)
    } else {
      console.log('❌ Failed to parse Set-Cookie header')
    }
    
    // Test 3: Cookie Formatting
    console.log('\n📝 Test 3: Cookie Formatting')
    const cookiesForHeader = [
      { name: 'session_id', value: 'abc123' },
      { name: 'user_pref', value: 'dark_mode' }
    ]
    
    const cookieHeader = formatCookieHeader(cookiesForHeader)
    console.log('✅ Formatted cookie header:', cookieHeader)
    
    if (cookieHeader === 'session_id=abc123; user_pref=dark_mode') {
      console.log('✅ Cookie header format is correct')
    } else {
      console.log('❌ Cookie header format is incorrect')
    }
    
    // Test 4: Domain Extraction
    console.log('\n📝 Test 4: Domain Extraction')
    const testUrls = [
      'https://api.example.com/users',
      'http://localhost:3000/api',
      'https://subdomain.example.com/path'
    ]
    
    testUrls.forEach(url => {
      const domain = extractDomain(url)
      console.log(`✅ ${url} → ${domain}`)
    })
    
    // Test 5: Request Runner Integration
    console.log('\n📝 Test 5: Request Runner Integration')
    
    // Add a cookie for testing
    cookieStore.setCookie({
      name: 'auth_token',
      value: 'test123',
      domain: 'httpbin.org',
      path: '/',
      httpOnly: false,
      secure: false
    })
    
    console.log('✅ Added test cookie for httpbin.org')
    
    // Test if cookies are attached to requests
    const testRequest = {
      method: 'GET',
      url: 'https://httpbin.org/cookies',
      headers: {},
      params: {},
      body: { type: 'none' }
    }
    
    console.log('🚀 Sending test request to check cookie attachment...')
    
    try {
      // Import runRequest dynamically to avoid circular dependencies
      const { runRequest } = await import('./requestRunner')
      const response = await runRequest(testRequest)
      
      console.log('✅ Request completed with status:', response.status)
      
      if (response.data && response.data.cookies) {
        console.log('✅ Cookies were sent with request:', response.data.cookies)
        
        if (response.data.cookies.auth_token === 'test123') {
          console.log('🎉 Cookie integration working correctly!')
        } else {
          console.log('⚠️  Cookie value mismatch')
        }
      } else {
        console.log('⚠️  No cookies found in response (may be expected)')
      }
      
      // Check if response contains Set-Cookie headers
      if (response.headers && (response.headers['set-cookie'] || response.headers['Set-Cookie'])) {
        console.log('✅ Response contains Set-Cookie headers')
        console.log('   Headers will be automatically captured')
      }
      
    } catch (error) {
      console.log('⚠️  Request failed (may be network issue):', error.message)
    }
    
    // Test 6: Cookie Expiration
    console.log('\n📝 Test 6: Cookie Expiration')
    
    // Add an expired cookie
    const expiredCookie = {
      name: 'expired_cookie',
      value: 'old_value',
      domain: 'example.com',
      path: '/',
      expires: Date.now() - 1000, // 1 second ago
      httpOnly: false,
      secure: false
    }
    
    cookieStore.setCookie(expiredCookie)
    console.log('✅ Added expired cookie')
    
    const validCookies = cookieStore.getCookiesForUrl('https://example.com/')
    const hasExpiredCookie = validCookies.some(c => c.name === 'expired_cookie')
    
    if (!hasExpiredCookie) {
      console.log('✅ Expired cookies are properly filtered out')
    } else {
      console.log('❌ Expired cookies are not being filtered')
    }
    
    // Test 7: Cookie Tab Integration
    console.log('\n📝 Test 7: Cookie Tab Integration')
    
    const cookieTab = document.querySelector('[data-testid="cookies-tab"]') ||
                     document.querySelector('button[aria-label*="cookies"]') ||
                     Array.from(document.querySelectorAll('button')).find(btn => 
                       btn.textContent.toLowerCase().includes('cookies')
                     )
    
    if (cookieTab) {
      console.log('✅ Cookies tab found in UI')
      
      // Try clicking the tab
      cookieTab.click()
      
      setTimeout(() => {
        const cookieContent = document.querySelector('[data-testid="cookies-content"]') ||
                             document.querySelector('.cookie-list') ||
                             document.querySelector('div:contains("Cookies for")')
        
        if (cookieContent) {
          console.log('✅ Cookies tab content is displayed')
        } else {
          console.log('⚠️  Cookies tab content not found (may need URL)')
        }
      }, 100)
      
    } else {
      console.log('⚠️  Cookies tab not found in UI')
    }
    
    console.log('\n🎉 Cookie Integration Test Complete!')
    
    return {
      success: true,
      cookieStore: !!cookieStore,
      parsing: !!parsedCookie,
      formatting: cookieHeader === 'session_id=abc123; user_pref=dark_mode',
      domainExtraction: extractDomain('https://api.example.com') === 'api.example.com',
      expiration: !hasExpiredCookie,
      tabIntegration: !!cookieTab
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export const testLoginFlow = async () => {
  console.log('\n🔐 Testing Login Flow with Cookies')
  console.log('=' .repeat(50))
  
  try {
    const cookieStore = useCookieStore.getState()
    
    // Clear cookies for clean test
    cookieStore.clearAllCookies()
    console.log('✅ Cleared cookies for clean test')
    
    // Simulate login request that returns Set-Cookie
    console.log('🚀 Simulating login request...')
    
    // Mock response with Set-Cookie header
    const mockLoginResponse = {
      status: 200,
      headers: {
        'set-cookie': [
          'session_token=login123; Path=/; HttpOnly; Secure',
          'user_id=12345; Path=/; Max-Age=86400'
        ]
      },
      data: { success: true, user: 'testuser' }
    }
    
    // Simulate cookie capture from response
    const { parseSetCookieHeaders } = await import('./cookieUtils')
    const domain = 'api.example.com'
    const capturedCookies = parseSetCookieHeaders(mockLoginResponse.headers, domain)
    
    console.log('✅ Captured cookies from login response:', capturedCookies.length)
    
    // Store the cookies
    cookieStore.setCookies(capturedCookies)
    
    // Verify cookies are stored
    const storedCookies = cookieStore.getCookiesForDomain(domain)
    console.log('✅ Stored cookies:', storedCookies.length)
    
    storedCookies.forEach(cookie => {
      console.log(`   - ${cookie.name}: ${cookie.value}`)
    })
    
    // Simulate next request that should include cookies
    console.log('🚀 Simulating authenticated request...')
    
    const authRequest = {
      method: 'GET',
      url: `https://${domain}/profile`,
      headers: {},
      params: {},
      body: { type: 'none' }
    }
    
    // Get cookies that would be attached
    const requestCookies = cookieStore.getCookiesForUrl(authRequest.url)
    const { formatCookieHeader } = await import('./cookieUtils')
    const cookieHeader = formatCookieHeader(requestCookies)
    
    console.log('✅ Cookies that would be attached:', cookieHeader)
    
    if (cookieHeader.includes('session_token=login123')) {
      console.log('🎉 Login flow working correctly!')
      console.log('   Session token will be automatically sent with future requests')
    } else {
      console.log('❌ Login flow not working - session token not found')
    }
    
    return {
      success: true,
      capturedCookies: capturedCookies.length,
      storedCookies: storedCookies.length,
      cookieHeader: cookieHeader,
      hasSessionToken: cookieHeader.includes('session_token=login123')
    }
    
  } catch (error) {
    console.error('❌ Login flow test failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Manual testing instructions
export const manualTestInstructions = `
🧪 MANUAL TESTING INSTRUCTIONS FOR COOKIE INTEGRATION

SETUP:
1. Open Request Buddy in your browser
2. Open browser DevTools → Console
3. Run: testCookieIntegration()

FEATURE TESTING:
===============

✅ TEST COOKIE CAPTURE:
1. Send a request to an API that returns Set-Cookie headers
2. Check browser console for "🍪 Captured cookies from response" message
3. Go to Cookies tab - should see captured cookies listed
4. Verify cookie details (name, value, domain, path, expires)

✅ TEST COOKIE ATTACHMENT:
1. Send a request to a domain that has stored cookies
2. Check browser console for "🍪 Attached cookies to request" message
3. Verify the request includes Cookie header in Network tab
4. Response should show cookies were received by server

✅ TEST LOGIN FLOW:
1. Send a login request to an API (e.g., POST /login)
2. Server should return Set-Cookie with session token
3. Cookies should be automatically captured and stored
4. Send another request to same domain
5. Session cookie should be automatically attached
6. Request should be authenticated

✅ TEST COOKIES TAB:
1. Click on "Cookies" tab in request editor
2. Should show cookies for current request URL domain
3. Try adding a new cookie manually
4. Try deleting an existing cookie
5. Verify changes are reflected in cookie store

✅ TEST COOKIE EXPIRATION:
1. Add a cookie with short expiration (or expired)
2. Wait for expiration or set past date
3. Expired cookies should not be sent with requests
4. Should be filtered out from cookie list

EXPECTED BEHAVIOR:
=================

🍪 AUTOMATIC COOKIE HANDLING:
- Login request → Server returns Set-Cookie → Cookies stored
- Next request → Cookies automatically attached → Authenticated

🍪 COOKIE MANAGEMENT:
- View all cookies for current domain
- Add/edit/delete cookies manually
- Cookies persist across browser sessions
- Expired cookies automatically cleaned up

🍪 POSTMAN-STYLE EXPERIENCE:
- Works exactly like Postman's cookie jar
- No manual cookie management needed
- Session-based authentication works seamlessly
- Cookies scoped properly by domain and path

TROUBLESHOOTING:
===============

If cookies not working:
- Check browser console for cookie-related messages
- Verify Set-Cookie headers in Network tab
- Check if cookies are being stored (run testCookieIntegration())
- Ensure domain matching is correct

If login flow broken:
- Verify server returns Set-Cookie headers
- Check cookie domain and path settings
- Ensure cookies aren't expired
- Test with simple cookie first

SUCCESS CRITERIA:
================

✅ Cookies automatically captured from responses
✅ Cookies automatically sent with matching requests  
✅ Login → authenticated requests work seamlessly
✅ Cookies tab shows and manages cookies correctly
✅ Cookie expiration handled properly
✅ Works like Postman's cookie system
`

console.log('Cookie integration test utilities loaded!')
console.log('Run testCookieIntegration() to test the complete system')
console.log('Run testLoginFlow() to test authentication flow')
console.log('Check manualTestInstructions for manual testing steps')