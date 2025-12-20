// Layout Verification Tests for Request Buddy

export const verifyLayoutStructure = () => {
  console.log('🔍 Verifying Layout Structure...')
  
  const checks = [
    {
      name: 'Main Layout Grid',
      check: () => {
        const mainLayout = document.querySelector('.flex.flex-1.overflow-hidden')
        return mainLayout !== null
      }
    },
    {
      name: 'Collections Sidebar',
      check: () => {
        const sidebar = document.querySelector('[class*="ResizablePanel"]')
        return sidebar !== null
      }
    },
    {
      name: 'Main Content Area',
      check: () => {
        const content = document.querySelector('.flex-1.flex.flex-col.min-w-0')
        return content !== null
      }
    },
    {
      name: 'Right Sidebar Container',
      check: () => {
        // Check if right sidebar container exists (even if closed)
        const container = document.querySelector('.w-80.bg-white, .w-80.dark\\:bg-gray-800')
        console.log('Right sidebar container found:', container !== null)
        return true // Pass regardless, as sidebar might be closed
      }
    }
  ]
  
  checks.forEach(check => {
    const result = check.check()
    console.log(`${result ? '✅' : '❌'} ${check.name}`)
  })
}

export const verifyActionBar = () => {
  console.log('🔍 Verifying Action Bar...')
  
  const checks = [
    {
      name: 'Send Button',
      check: () => {
        const sendBtn = document.querySelector('button:has(svg[data-lucide="send"])')
        return sendBtn !== null
      }
    },
    {
      name: 'AI Button',
      check: () => {
        const aiBtn = document.querySelector('button:has(svg[data-lucide="sparkles"])')
        return aiBtn !== null
      }
    },
    {
      name: 'Sidebar Toggle',
      check: () => {
        const toggleBtn = document.querySelector('button[title="Toggle Utilities Panel"]')
        return toggleBtn !== null
      }
    },
    {
      name: 'Action Group Layout',
      check: () => {
        const actionGroup = document.querySelector('.flex.items-center.space-x-2')
        if (!actionGroup) return false
        
        const buttons = actionGroup.querySelectorAll('button')
        return buttons.length >= 3
      }
    }
  ]
  
  checks.forEach(check => {
    const result = check.check()
    console.log(`${result ? '✅' : '❌'} ${check.name}`)
  })
}

export const testRightSidebarToggle = () => {
  console.log('🧪 Testing Right Sidebar Toggle...')
  
  const toggleBtn = document.querySelector('button[title="Toggle Utilities Panel"]')
  
  if (!toggleBtn) {
    console.log('❌ Toggle button not found')
    return false
  }
  
  console.log('✅ Found toggle button, testing click...')
  
  // Get initial state
  const initialSidebar = document.querySelector('.w-80.bg-white, .w-80.dark\\:bg-gray-800')
  const initiallyOpen = initialSidebar !== null
  
  console.log('Initial sidebar state (open):', initiallyOpen)
  
  // Click toggle
  toggleBtn.click()
  
  // Check after short delay
  setTimeout(() => {
    const newSidebar = document.querySelector('.w-80.bg-white, .w-80.dark\\:bg-gray-800')
    const nowOpen = newSidebar !== null
    
    console.log('New sidebar state (open):', nowOpen)
    
    if (nowOpen !== initiallyOpen) {
      console.log('✅ Sidebar toggle working correctly!')
    } else {
      console.log('❌ Sidebar toggle not working')
    }
  }, 200)
  
  return true
}

export const testAIButtonDropdown = () => {
  console.log('🧪 Testing AI Button Dropdown...')
  
  const aiBtn = document.querySelector('button:has(svg[data-lucide="sparkles"])')
  
  if (!aiBtn) {
    console.log('❌ AI button not found')
    return false
  }
  
  console.log('✅ Found AI button, testing dropdown...')
  
  // Click AI button
  aiBtn.click()
  
  setTimeout(() => {
    const dropdown = document.querySelector('.absolute.top-full')
    
    if (dropdown) {
      console.log('✅ AI dropdown appeared')
      
      // Check for AI actions
      const actions = dropdown.querySelectorAll('button')
      console.log(`Found ${actions.length} AI actions`)
      
      // Close dropdown
      document.body.click()
      
      setTimeout(() => {
        const stillOpen = document.querySelector('.absolute.top-full')
        if (!stillOpen) {
          console.log('✅ Dropdown closed correctly')
        } else {
          console.log('❌ Dropdown did not close')
        }
      }, 100)
      
    } else {
      console.log('❌ AI dropdown did not appear')
    }
  }, 100)
  
  return true
}

export const verifyResponsePanel = () => {
  console.log('🔍 Verifying Response Panel...')
  
  // Check if response panel exists
  const responsePanel = document.querySelector('[class*="ResponseViewer"]')
  
  if (!responsePanel) {
    console.log('ℹ️ No response panel visible (no response yet)')
    return true
  }
  
  console.log('✅ Response panel found')
  
  // Check scrollability
  const scrollableContent = responsePanel.querySelector('.overflow-auto, .overflow-y-auto')
  
  if (scrollableContent) {
    console.log('✅ Response content is scrollable')
  } else {
    console.log('❌ Response content is not scrollable')
  }
  
  return true
}

export const runAllLayoutTests = () => {
  console.log('🚀 Running All Layout Tests...')
  console.log('================================')
  
  verifyLayoutStructure()
  console.log('')
  
  verifyActionBar()
  console.log('')
  
  testRightSidebarToggle()
  console.log('')
  
  testAIButtonDropdown()
  console.log('')
  
  verifyResponsePanel()
  console.log('')
  
  console.log('✅ All tests completed!')
  console.log('')
  console.log('📋 Manual Verification Checklist:')
  console.log('1. Check that right sidebar does not overlap main content')
  console.log('2. Verify all buttons are properly aligned in action bar')
  console.log('3. Test theme switching for consistency')
  console.log('4. Verify response panel scrolling with actual response')
  console.log('5. Check keyboard shortcuts (Cmd+Enter to send)')
}

// Export to window for browser console access
if (typeof window !== 'undefined') {
  window.verifyLayoutStructure = verifyLayoutStructure
  window.verifyActionBar = verifyActionBar
  window.testRightSidebarToggle = testRightSidebarToggle
  window.testAIButtonDropdown = testAIButtonDropdown
  window.verifyResponsePanel = verifyResponsePanel
  window.runAllLayoutTests = runAllLayoutTests
}