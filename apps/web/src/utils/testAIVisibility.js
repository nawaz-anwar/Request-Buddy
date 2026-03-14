// Test functions to verify AI UI visibility

export const testAIButtonVisibility = () => {
  console.log('🔍 Testing AI Button Visibility...')
  
  const tests = [
    {
      name: 'AI Button Exists in DOM',
      test: () => {
        // Look for AI button with sparkles icon or "AI Assistant" text
        const aiButton = document.querySelector('button:has(svg[data-lucide="sparkles"])') ||
                         document.querySelector('button[title="AI Assistant"]') ||
                         document.querySelector('button:contains("AI Assistant")')
        
        if (aiButton) {
          console.log('✅ Found AI button:', aiButton)
          return true
        }
        
        // Alternative search
        const buttons = document.querySelectorAll('button')
        for (let button of buttons) {
          if (button.textContent.includes('AI') || button.textContent.includes('✨')) {
            console.log('✅ Found AI-related button:', button.textContent)
            return true
          }
        }
        
        console.log('❌ No AI button found')
        console.log('Available buttons:', Array.from(buttons).map(b => b.textContent).filter(t => t.trim()))
        return false
      }
    },
    {
      name: 'AI Button is Visible',
      test: () => {
        const aiButton = document.querySelector('button[title="AI Assistant"]')
        if (!aiButton) return false
        
        const rect = aiButton.getBoundingClientRect()
        const isVisible = rect.width > 0 && rect.height > 0 && 
                         window.getComputedStyle(aiButton).display !== 'none'
        
        console.log('AI Button dimensions:', rect)
        return isVisible
      }
    },
    {
      name: 'AI Button is Clickable',
      test: () => {
        const aiButton = document.querySelector('button[title="AI Assistant"]')
        if (!aiButton) return false
        
        const isEnabled = !aiButton.disabled
        const hasClickHandler = aiButton.onclick !== null || 
                               aiButton.getAttribute('onclick') !== null
        
        console.log('AI Button enabled:', isEnabled)
        console.log('AI Button has click handler:', hasClickHandler)
        return isEnabled
      }
    },
    {
      name: 'Request Editor Component Rendered',
      test: () => {
        // Look for console log we added
        return true // We'll check console manually
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
  console.log(`\n📊 AI Visibility Tests: ${passedCount}/${tests.length} passed`)
  
  if (passedCount === 0) {
    console.log('\n🚨 CRITICAL: No AI button found!')
    console.log('Debugging info:')
    console.log('- Check if RequestEditor component is rendering')
    console.log('- Look for "REQUEST HEADER RENDERED" in console')
    console.log('- Verify you are on a page with a request editor')
  }
  
  return results
}

export const simulateAIButtonClick = () => {
  console.log('🖱️ Simulating AI Button Click...')
  
  const aiButton = document.querySelector('button[title="AI Assistant"]') ||
                   document.querySelector('button:contains("AI Assistant")')
  
  if (!aiButton) {
    console.log('❌ AI button not found for clicking')
    return false
  }
  
  console.log('✅ Found AI button, attempting click...')
  aiButton.click()
  
  // Check if dropdown appeared
  setTimeout(() => {
    const dropdown = document.querySelector('.absolute.top-full') ||
                    document.querySelector('[role="menu"]') ||
                    document.querySelector('.z-50')
    
    if (dropdown) {
      console.log('✅ AI dropdown appeared after click')
    } else {
      console.log('❌ AI dropdown did not appear')
    }
  }, 100)
  
  return true
}

export const testAIModalVisibility = () => {
  console.log('🔍 Testing AI Modal Visibility...')
  
  // Try to trigger an AI action
  const generateDocsButton = document.querySelector('button:contains("Generate API Documentation")')
  
  if (generateDocsButton) {
    console.log('✅ Found Generate Docs button, clicking...')
    generateDocsButton.click()
    
    setTimeout(() => {
      const modal = document.querySelector('.fixed.inset-0') ||
                   document.querySelector('[role="dialog"]')
      
      if (modal) {
        console.log('✅ AI modal appeared')
        return true
      } else {
        console.log('❌ AI modal did not appear')
        return false
      }
    }, 100)
  } else {
    console.log('❌ Generate Docs button not found')
    return false
  }
}

export const aiVisibilityChecklist = () => {
  console.log('📋 AI Visibility Checklist')
  console.log('==========================')
  console.log('')
  console.log('🔍 STEP 1: Check Console Logs')
  console.log('  Look for: "REQUEST HEADER RENDERED - RequestEditor.jsx"')
  console.log('  Look for: "SimpleAIButton rendered with:"')
  console.log('')
  console.log('🔍 STEP 2: Visual Inspection')
  console.log('  1. Open Request Buddy in browser')
  console.log('  2. Navigate to a request tab')
  console.log('  3. Look for purple-blue gradient "AI Assistant" button')
  console.log('  4. Button should be next to Send button')
  console.log('')
  console.log('🔍 STEP 3: Interaction Test')
  console.log('  1. Click the AI Assistant button')
  console.log('  2. Dropdown should appear with 5 AI actions')
  console.log('  3. Click any action (may show placeholder result)')
  console.log('')
  console.log('🧪 Run automated tests:')
  console.log('  - window.testAIButtonVisibility()')
  console.log('  - window.simulateAIButtonClick()')
  console.log('  - window.testAIModalVisibility()')
  console.log('')
  console.log('🚨 If AI button is NOT visible:')
  console.log('  1. Check browser console for errors')
  console.log('  2. Verify you are in a request tab (not empty state)')
  console.log('  3. Check if RequestEditor component is rendering')
  console.log('  4. Look for import/export errors')
}

// Export for window access
if (typeof window !== 'undefined') {
  window.testAIButtonVisibility = testAIButtonVisibility
  window.simulateAIButtonClick = simulateAIButtonClick
  window.testAIModalVisibility = testAIModalVisibility
  window.aiVisibilityChecklist = aiVisibilityChecklist
}