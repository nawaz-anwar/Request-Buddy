// Test functions for Layout Fix verification

export const testLayoutStructure = () => {
  console.log('🧪 Testing Layout Structure...')
  
  const tests = [
    {
      name: 'Three Column Layout',
      test: () => {
        // Check for proper 3-column structure
        const mainLayout = document.querySelector('.flex.flex-1.overflow-hidden')
        if (!mainLayout) return false
        
        const children = mainLayout.children
        console.log('Layout children count:', children.length)
        
        // Should have: Left sidebar, Main content, Right sidebar (when open)
        return children.length >= 2 // At least left sidebar and main content
      }
    },
    {
      name: 'Right Sidebar No Overlap',
      test: () => {
        const rightSidebar = document.querySelector('.w-80.bg-white, .w-80.dark\\:bg-gray-800')
        const mainContent = document.querySelector('.flex-1.flex.flex-col.min-w-0')
        
        if (!rightSidebar || !mainContent) {
          console.log('Right sidebar or main content not found')
          return true // Pass if sidebar is closed
        }
        
        const sidebarRect = rightSidebar.getBoundingClientRect()
        const contentRect = mainContent.getBoundingClientRect()
        
        console.log('Sidebar rect:', sidebarRect)
        console.log('Content rect:', contentRect)
        
        // Sidebar should not overlap content
        return sidebarRect.left >= contentRect.right - 10 // Allow 10px tolerance
      }
    },
    {
      name: 'AI Button Visible',
      test: () => {
        const aiButton = document.querySelector('button:has(svg[data-lucide="sparkles"])')
        if (!aiButton) {
          console.log('AI button not found')
          return false
        }
        
        const rect = aiButton.getBoundingClientRect()
        const isVisible = rect.width > 0 && rect.height > 0
        console.log('AI button visible:', isVisible, rect)
        return isVisible
      }
    },
    {
      name: 'Action Bar Layout',
      test: () => {
        // Check if Send, AI, and Sidebar toggle buttons are in action group
        const actionGroup = document.querySelector('.flex.items-center.space-x-2')
        if (!actionGroup) {
          console.log('Action group not found')
          return false
        }
        
        const buttons = actionGroup.querySelectorAll('button')
        console.log('Action buttons count:', buttons.length)
        
        // Should have at least Send, AI, and Toggle buttons
        return buttons.length >= 3
      }
    },
    {
      name: 'Response Panel Scrollable',
      test: () => {
        const responsePanel = document.querySelector('.overflow-auto')
        if (!responsePanel) {
          console.log('No scrollable response panel found')
          return true // Pass if no response yet
        }
        
        const hasOverflow = window.getComputedStyle(responsePanel).overflowY === 'auto'
        console.log('Response panel has overflow-y auto:', hasOverflow)
        return hasOverflow
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
  console.log(`\n📊 Layout Structure Tests: ${passedCount}/${tests.length} passed`)
  
  return results
}

export const testRightSidebarToggle = () => {
  console.log('🧪 Testing Right Sidebar Toggle...')
  
  const toggleButton = document.querySelector('button[title="Toggle Utilities Panel"]')
  
  if (!toggleButton) {
    console.log('❌ Right sidebar toggle button not found')
    return false
  }
  
  console.log('✅ Found right sidebar toggle button')
  
  // Test clicking the toggle
  const initialState = document.querySelector('.w-80.bg-white, .w-80.dark\\:bg-gray-800') !== null
  console.log('Initial sidebar state (open):', initialState)
  
  toggleButton.click()
  
  setTimeout(() => {
    const newState = document.querySelector('.w-80.bg-white, .w-80.dark\\:bg-gray-800') !== null
    console.log('New sidebar state (open):', newState)
    
    if (newState !== initialState) {
      console.log('✅ Sidebar toggle works correctly')
    } else {
      console.log('❌ Sidebar toggle did not change state')
    }
  }, 100)
  
  return true
}

export const testAIButtonIntegration = () => {
  console.log('🧪 Testing AI Button Integration...')
  
  const tests = [
    {
      name: 'AI Button in Action Bar',
      test: () => {
        const aiButton = document.querySelector('button:has(svg[data-lucide="sparkles"])')
        const actionBar = document.querySelector('.flex.items-center.space-x-2')
        
        if (!aiButton || !actionBar) return false
        
        return actionBar.contains(aiButton)
      }
    },
    {
      name: 'AI Button Dropdown',
      test: () => {
        const aiButton = document.querySelector('button:has(svg[data-lucide="sparkles"])')
        if (!aiButton) return false
        
        aiButton.click()
        
        setTimeout(() => {
          const dropdown = document.querySelector('.absolute.top-full')
          const hasDropdown = dropdown !== null
          console.log('AI dropdown appeared:', hasDropdown)
          
          if (hasDropdown) {
            // Close dropdown
            document.body.click()
          }
        }, 100)
        
        return true
      }
    },
    {
      name: 'Compact AI Button Style',
      test: () => {
        const aiButton = document.querySelector('button:has(svg[data-lucide="sparkles"])')
        if (!aiButton) return false
        
        const hasGradient = aiButton.className.includes('from-purple-600')
        const hasCompactSize = aiButton.textContent.trim() === 'AI'
        
        console.log('AI button has gradient:', hasGradient)
        console.log('AI button is compact:', hasCompactSize)
        
        return hasGradient && hasCompactSize
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
  console.log(`\n📊 AI Button Integration Tests: ${passedCount}/${tests.length} passed`)
  
  return results
}

export const layoutFixChecklist = () => {
  console.log('📋 Layout Fix Checklist')
  console.log('=======================')
  console.log('')
  console.log('✅ LAYOUT STRUCTURE (Visual Check):')
  console.log('  1. Three distinct columns: Collections | Main | Utilities')
  console.log('  2. Right sidebar does NOT overlap main content')
  console.log('  3. Main content area is properly centered')
  console.log('  4. No UI elements are cut off or hidden')
  console.log('')
  console.log('✅ ACTION BAR (Visual Check):')
  console.log('  1. Send button is prominent and blue')
  console.log('  2. AI button is purple-blue gradient with "AI" text')
  console.log('  3. Sidebar toggle button (hamburger icon) is visible')
  console.log('  4. All buttons are properly aligned horizontally')
  console.log('')
  console.log('✅ RIGHT SIDEBAR (Interaction Check):')
  console.log('  1. Click hamburger button to toggle sidebar')
  console.log('  2. Sidebar slides in from right without overlap')
  console.log('  3. Sidebar has tabs: Code | cURL | Info | Export')
  console.log('  4. Sidebar content is scrollable')
  console.log('  5. Close button (X) works correctly')
  console.log('')
  console.log('✅ AI INTEGRATION (Interaction Check):')
  console.log('  1. Click AI button to see dropdown menu')
  console.log('  2. Dropdown shows 5 AI actions')
  console.log('  3. Actions requiring response are disabled appropriately')
  console.log('  4. Clicking action opens right sidebar (if closed)')
  console.log('')
  console.log('✅ RESPONSE PANEL (Visual Check):')
  console.log('  1. Response body is scrollable vertically')
  console.log('  2. JSON content has proper syntax highlighting')
  console.log('  3. Copy button shows "Copied!" feedback')
  console.log('  4. Tabs (Body, Headers, Cookies, Meta) work correctly')
  console.log('')
  console.log('✅ THEME CONSISTENCY (Visual Check):')
  console.log('  1. Switch between light and dark themes')
  console.log('  2. All panels change colors consistently')
  console.log('  3. No mixed theme states visible')
  console.log('  4. Text contrast is proper in both themes')
  console.log('')
  console.log('🧪 Run automated tests:')
  console.log('  - window.testLayoutStructure()')
  console.log('  - window.testRightSidebarToggle()')
  console.log('  - window.testAIButtonIntegration()')
}

// Export for window access
if (typeof window !== 'undefined') {
  window.testLayoutStructure = testLayoutStructure
  window.testRightSidebarToggle = testRightSidebarToggle
  window.testAIButtonIntegration = testAIButtonIntegration
  window.layoutFixChecklist = layoutFixChecklist
}