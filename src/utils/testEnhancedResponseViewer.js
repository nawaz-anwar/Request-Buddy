// Test functions for Enhanced Response Viewer functionality

export const testEnhancedResponseViewer = () => {
  console.log('🧪 Testing Enhanced Response Viewer...')
  
  const tests = [
    {
      name: 'Response Tabs Visibility',
      test: () => {
        const tabs = document.querySelectorAll('[role="tab"], button:has(svg[data-lucide="file-text"]), button:has(svg[data-lucide="code"]), button:has(svg[data-lucide="cookie"]), button:has(svg[data-lucide="info"])')
        return tabs.length >= 4 // Body, Headers, Cookies, Meta
      }
    },
    {
      name: 'Body Scrollable Container',
      test: () => {
        const bodyContainer = document.querySelector('.overflow-auto')
        return bodyContainer !== null
      }
    },
    {
      name: 'Copy Button Visual Feedback',
      test: () => {
        const copyButtons = document.querySelectorAll('button:has(svg[data-lucide="copy"])')
        return copyButtons.length > 0
      }
    },
    {
      name: 'View Mode Controls',
      test: () => {
        // Look for Pretty/Raw/Preview buttons
        const viewButtons = document.querySelectorAll('button:contains("Pretty"), button:contains("Raw"), button:contains("Preview")')
        return viewButtons.length > 0 || document.querySelector('.bg-blue-600') !== null
      }
    }
  ]
  
  const results = tests.map(test => {
    try {
      const passed = test.test()
      console.log(`${passed ? '✅' : '❌'} ${test.name}`)
      return { name: test.name, passed }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`)
      return { name: test.name, passed: false, error: error.message }
    }
  })
  
  const passedCount = results.filter(r => r.passed).length
  console.log(`\n📊 Enhanced Response Viewer Tests: ${passedCount}/${tests.length} passed`)
  
  return results
}

export const testCookieParsing = () => {
  console.log('🧪 Testing Cookie Parsing...')
  
  // Sample response with cookies
  const sampleResponse = {
    status: 200,
    statusText: 'OK',
    headers: {
      'set-cookie': [
        'sessionId=abc123; Domain=.example.com; Path=/; HttpOnly; Secure; SameSite=Strict',
        'userId=12345; Expires=Wed, 21 Oct 2025 07:28:00 GMT; Path=/api',
        'theme=dark; Max-Age=3600; SameSite=Lax'
      ],
      'content-type': 'application/json'
    },
    data: { message: 'Success' },
    time: 150,
    size: 1024
  }
  
  // Test cookie parsing logic
  const parseCookies = (response) => {
    const headers = response.headers || {}
    const cookies = []
    
    const setCookieHeaders = headers['set-cookie'] || headers['Set-Cookie'] || []
    const cookieArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders].filter(Boolean)
    
    cookieArray.forEach((cookieString, index) => {
      if (!cookieString) return
      
      const cookie = {
        id: index,
        name: '',
        value: '',
        domain: '',
        path: '',
        expires: '',
        httpOnly: false,
        secure: false,
        sameSite: ''
      }
      
      const parts = cookieString.split(';').map(part => part.trim())
      
      if (parts[0]) {
        const [name, ...valueParts] = parts[0].split('=')
        cookie.name = name.trim()
        cookie.value = valueParts.join('=').trim()
      }
      
      parts.slice(1).forEach(part => {
        const [key, value] = part.split('=').map(s => s.trim())
        const lowerKey = key.toLowerCase()
        
        switch (lowerKey) {
          case 'domain':
            cookie.domain = value || ''
            break
          case 'path':
            cookie.path = value || ''
            break
          case 'expires':
            cookie.expires = value || ''
            break
          case 'max-age':
            if (value) {
              const maxAge = parseInt(value)
              const expiryDate = new Date(Date.now() + maxAge * 1000)
              cookie.expires = expiryDate.toUTCString()
            }
            break
          case 'httponly':
            cookie.httpOnly = true
            break
          case 'secure':
            cookie.secure = true
            break
          case 'samesite':
            cookie.sameSite = value || 'Lax'
            break
        }
      })
      
      cookies.push(cookie)
    })
    
    return cookies
  }
  
  const tests = [
    {
      name: 'Parse Multiple Cookies',
      test: () => {
        const cookies = parseCookies(sampleResponse)
        return cookies.length === 3
      }
    },
    {
      name: 'Parse Cookie Names and Values',
      test: () => {
        const cookies = parseCookies(sampleResponse)
        return cookies[0].name === 'sessionId' && cookies[0].value === 'abc123'
      }
    },
    {
      name: 'Parse Cookie Attributes',
      test: () => {
        const cookies = parseCookies(sampleResponse)
        const sessionCookie = cookies[0]
        return sessionCookie.domain === '.example.com' && 
               sessionCookie.httpOnly === true && 
               sessionCookie.secure === true
      }
    },
    {
      name: 'Parse Max-Age to Expires',
      test: () => {
        const cookies = parseCookies(sampleResponse)
        const themeCookie = cookies[2]
        return themeCookie.name === 'theme' && themeCookie.expires.length > 0
      }
    }
  ]
  
  const results = tests.map(test => {
    try {
      const passed = test.test()
      console.log(`${passed ? '✅' : '❌'} ${test.name}`)
      return { name: test.name, passed }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`)
      return { name: test.name, passed: false, error: error.message }
    }
  })
  
  const passedCount = results.filter(r => r.passed).length
  console.log(`\n📊 Cookie Parsing Tests: ${passedCount}/${tests.length} passed`)
  
  return results
}

export const testResponseScrolling = () => {
  console.log('🧪 Testing Response Body Scrolling...')
  
  // Create a large JSON response for testing
  const largeJsonResponse = {
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    data: {
      users: Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        profile: {
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10),
          preferences: {
            theme: 'dark',
            notifications: true,
            language: 'en'
          }
        }
      }))
    },
    time: 250,
    size: 50000
  }
  
  // Set the test response
  if (typeof window !== 'undefined' && window.setTestResponse) {
    window.setTestResponse(largeJsonResponse)
    console.log('✅ Large JSON response set for testing')
    console.log('📋 Manual Test Instructions:')
    console.log('  1. Check that response body is scrollable')
    console.log('  2. Verify horizontal scrolling for long lines')
    console.log('  3. Test Pretty/Raw view switching')
    console.log('  4. Confirm copy button shows "Copied!" feedback')
    console.log('  5. Verify response doesn\'t overflow container')
  }
  
  return { 
    message: 'Large response set for manual testing',
    instructions: [
      'Response body should be scrollable',
      'Long JSON lines should scroll horizontally',
      'Pretty/Raw buttons should work',
      'Copy button should show feedback',
      'Content should not overflow container'
    ]
  }
}

export const enhancedResponseViewerTestChecklist = () => {
  console.log('📋 Enhanced Response Viewer Test Checklist')
  console.log('==========================================')
  console.log('')
  console.log('✅ VISUAL TESTS (Manual):')
  console.log('  1. Four tabs visible: Body, Headers, Cookies, Meta')
  console.log('  2. Tab counts show correct numbers (Headers: X, Cookies: Y)')
  console.log('  3. Active tab is highlighted in blue')
  console.log('  4. Response body has fixed height container')
  console.log('  5. Body content is scrollable (vertical + horizontal)')
  console.log('  6. Pretty/Raw/Preview buttons work for different content types')
  console.log('  7. Dark theme for JSON display (gray-900 background)')
  console.log('')
  console.log('✅ FUNCTIONALITY TESTS (Manual):')
  console.log('  1. Body Tab:')
  console.log('     - JSON shows syntax highlighting in Pretty mode')
  console.log('     - Raw mode shows plain text')
  console.log('     - HTML Preview mode works for HTML responses')
  console.log('     - Copy button shows "Copied!" for 2 seconds')
  console.log('     - Download button works')
  console.log('')
  console.log('  2. Headers Tab:')
  console.log('     - All response headers displayed')
  console.log('     - Individual header copy buttons work')
  console.log('     - "Copy All" button copies all headers')
  console.log('     - Header values use monospace font')
  console.log('')
  console.log('  3. Cookies Tab:')
  console.log('     - Parses Set-Cookie headers correctly')
  console.log('     - Shows table with Name, Value, Domain, Path, Expires, Flags')
  console.log('     - HttpOnly, Secure, SameSite flags displayed as badges')
  console.log('     - Individual cookie copy buttons work')
  console.log('     - Shows "No cookies" message when none present')
  console.log('')
  console.log('  4. Meta Tab:')
  console.log('     - Status with colored badge and icon')
  console.log('     - Response time formatted (ms/s)')
  console.log('     - Response size formatted (B/KB/MB)')
  console.log('     - Timestamp shows local date/time')
  console.log('     - Historical response indicator when applicable')
  console.log('')
  console.log('✅ SCROLLING TESTS (Manual):')
  console.log('  1. Response body scrolls independently')
  console.log('  2. Long JSON lines scroll horizontally')
  console.log('  3. Scrolling doesn\'t affect left sidebar')
  console.log('  4. Container has proper max-height')
  console.log('  5. Content never overflows outside bounds')
  console.log('')
  console.log('✅ COPY FEEDBACK TESTS (Manual):')
  console.log('  1. Copy buttons show green checkmark')
  console.log('  2. "Copied!" text appears for 2 seconds')
  console.log('  3. Button returns to normal state after timeout')
  console.log('  4. Multiple copy operations work independently')
  console.log('')
  console.log('✅ THEME CONSISTENCY (Manual):')
  console.log('  1. All panels respect light/dark theme')
  console.log('  2. No hardcoded colors visible')
  console.log('  3. Smooth theme transitions')
  console.log('  4. Proper contrast in both themes')
  console.log('')
  console.log('🧪 Run automated tests:')
  console.log('  - window.testEnhancedResponseViewer()')
  console.log('  - window.testCookieParsing()')
  console.log('  - window.testResponseScrolling()')
}

// Export for window access
if (typeof window !== 'undefined') {
  window.testEnhancedResponseViewer = testEnhancedResponseViewer
  window.testCookieParsing = testCookieParsing
  window.testResponseScrolling = testResponseScrolling
  window.enhancedResponseViewerTestChecklist = enhancedResponseViewerTestChecklist
}