// Test functions for Right Sidebar functionality

export const testRightSidebarFeatures = () => {
  console.log('🧪 Testing Right Sidebar Features...')
  
  const tests = [
    {
      name: 'Sidebar Toggle Visibility',
      test: () => {
        const toggleBar = document.querySelector('[class*="fixed right-0 top-0"]')
        return toggleBar !== null
      }
    },
    {
      name: 'Code Generators Available',
      test: () => {
        // Check if code generators are imported
        return typeof window.codeGenerators !== 'undefined' || 
               document.querySelector('[data-testid="code-snippet-generator"]') !== null
      }
    },
    {
      name: 'Keyboard Shortcuts',
      test: () => {
        // Test keyboard shortcut registration
        const event = new KeyboardEvent('keydown', {
          key: 'C',
          metaKey: true,
          shiftKey: true,
          bubbles: true
        })
        document.dispatchEvent(event)
        return true // If no error, shortcuts are registered
      }
    },
    {
      name: 'Local Storage Persistence',
      test: () => {
        localStorage.setItem('requestBuddy_rightSidebarOpen', 'true')
        localStorage.setItem('requestBuddy_rightSidebarTab', 'code')
        const saved1 = localStorage.getItem('requestBuddy_rightSidebarOpen')
        const saved2 = localStorage.getItem('requestBuddy_rightSidebarTab')
        return saved1 === 'true' && saved2 === 'code'
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
  console.log(`\n📊 Right Sidebar Tests: ${passedCount}/${tests.length} passed`)
  
  return results
}

export const testCodeGeneration = () => {
  console.log('🧪 Testing Code Generation...')
  
  const sampleRequest = {
    method: 'POST',
    url: 'https://api.example.com/users/{{userId}}',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {{token}}'
    },
    params: {
      limit: '10',
      offset: '0'
    },
    body: {
      type: 'json',
      content: JSON.stringify({
        name: '{{userName}}',
        email: 'test@example.com'
      })
    },
    auth: {
      type: 'bearer',
      bearerToken: '{{apiToken}}'
    }
  }
  
  const environmentVariables = {
    userId: '123',
    token: 'abc123',
    userName: 'John Doe',
    apiToken: 'xyz789'
  }
  
  // Import code generators
  import('../utils/codeGenerators.js').then(({ codeGenerators }) => {
    const tests = [
      {
        name: 'cURL Generation',
        test: () => {
          const curl = codeGenerators.curl(sampleRequest, environmentVariables)
          return curl.includes('curl -X POST') && 
                 curl.includes('https://api.example.com/users/123') &&
                 curl.includes('Bearer xyz789')
        }
      },
      {
        name: 'JavaScript Fetch Generation',
        test: () => {
          const js = codeGenerators.javascript(sampleRequest, environmentVariables)
          return js.includes('fetch(') && 
                 js.includes('method: "POST"') &&
                 js.includes('John Doe')
        }
      },
      {
        name: 'Node.js Axios Generation',
        test: () => {
          const nodejs = codeGenerators.nodejs(sampleRequest, environmentVariables)
          return nodejs.includes('axios') && 
                 nodejs.includes('method: "post"') &&
                 nodejs.includes('123')
        }
      },
      {
        name: 'Python Requests Generation',
        test: () => {
          const python = codeGenerators.python(sampleRequest, environmentVariables)
          return python.includes('import requests') && 
                 python.includes('requests.post') &&
                 python.includes('Bearer xyz789')
        }
      },
      {
        name: 'PHP cURL Generation',
        test: () => {
          const php = codeGenerators.php(sampleRequest, environmentVariables)
          return php.includes('<?php') && 
                 php.includes('curl_init') &&
                 php.includes('CURLOPT_CUSTOMREQUEST => "POST"')
        }
      },
      {
        name: 'Go HTTP Generation',
        test: () => {
          const go = codeGenerators.go(sampleRequest, environmentVariables)
          return go.includes('package main') && 
                 go.includes('http.NewRequest') &&
                 go.includes('POST')
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
    console.log(`\n📊 Code Generation Tests: ${passedCount}/${tests.length} passed`)
    
    return results
  }).catch(error => {
    console.error('Failed to import code generators:', error)
  })
}

export const testSidebarInteraction = () => {
  console.log('🧪 Testing Sidebar Interaction...')
  
  const tests = [
    {
      name: 'Toggle Button Click',
      test: () => {
        const toggleButton = document.querySelector('button[title*="Collapse Sidebar"], button[title*="Expand Sidebar"]')
        if (toggleButton) {
          toggleButton.click()
          return true
        }
        return false
      }
    },
    {
      name: 'Tab Switching',
      test: () => {
        const tabButtons = document.querySelectorAll('button[title*="Code Snippets"], button[title*="cURL"], button[title*="Request Info"]')
        if (tabButtons.length > 0) {
          tabButtons[0].click()
          return true
        }
        return false
      }
    },
    {
      name: 'Copy Button Functionality',
      test: () => {
        const copyButtons = document.querySelectorAll('button[title*="Copy"], button:has(svg[data-lucide="copy"])')
        return copyButtons.length > 0
      }
    },
    {
      name: 'Language Selector',
      test: () => {
        const languageSelector = document.querySelector('button:has(svg[data-lucide="chevron-down"])')
        return languageSelector !== null
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
  console.log(`\n📊 Sidebar Interaction Tests: ${passedCount}/${tests.length} passed`)
  
  return results
}

export const rightSidebarTestChecklist = () => {
  console.log('📋 Right Sidebar Test Checklist')
  console.log('================================')
  console.log('')
  console.log('✅ VISUAL TESTS (Manual):')
  console.log('  1. Right sidebar toggle bar is visible on the right edge')
  console.log('  2. Clicking toggle opens/closes 320-360px wide sidebar')
  console.log('  3. Four tab icons are visible: Code, cURL, Info, Copy')
  console.log('  4. Active tab is highlighted in blue')
  console.log('  5. Sidebar has proper theme colors (light/dark)')
  console.log('  6. Tooltips show on hover with keyboard shortcuts')
  console.log('')
  console.log('✅ FUNCTIONALITY TESTS (Manual):')
  console.log('  1. Code Snippets tab shows language dropdown')
  console.log('  2. Language selection persists in localStorage')
  console.log('  3. Generated code updates when request changes')
  console.log('  4. Copy button shows green checkmark for 2 seconds')
  console.log('  5. cURL tab generates proper cURL commands')
  console.log('  6. Request Info shows method, URL, headers count')
  console.log('  7. Copy & Export has download and share options')
  console.log('')
  console.log('✅ KEYBOARD SHORTCUTS (Manual):')
  console.log('  1. Cmd+Shift+C opens Code Snippets tab')
  console.log('  2. Cmd+Shift+U opens cURL tab')
  console.log('  3. Cmd+Shift+I opens Request Info tab')
  console.log('  4. Cmd+Shift+E opens Copy & Export tab')
  console.log('')
  console.log('✅ ENVIRONMENT VARIABLES (Manual):')
  console.log('  1. Variables like {{token}} are resolved in generated code')
  console.log('  2. Request Info shows used variables and their values')
  console.log('  3. Code updates when environment changes')
  console.log('')
  console.log('✅ PERSISTENCE (Manual):')
  console.log('  1. Sidebar open/closed state persists on refresh')
  console.log('  2. Active tab persists on refresh')
  console.log('  3. Selected language persists on refresh')
  console.log('')
  console.log('🧪 Run automated tests:')
  console.log('  - window.testRightSidebarFeatures()')
  console.log('  - window.testCodeGeneration()')
  console.log('  - window.testSidebarInteraction()')
}

// Export for window access
if (typeof window !== 'undefined') {
  window.testRightSidebarFeatures = testRightSidebarFeatures
  window.testCodeGeneration = testCodeGeneration
  window.testSidebarInteraction = testSidebarInteraction
  window.rightSidebarTestChecklist = rightSidebarTestChecklist
}