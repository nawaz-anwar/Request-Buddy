// Complete Layout Test Suite for Request Buddy

export const runCompleteLayoutTest = async () => {
  console.log('🚀 Running Complete Layout Test Suite')
  console.log('=====================================')
  console.log('')
  
  // Step 1: Verify basic layout structure
  console.log('📋 Step 1: Verifying Layout Structure...')
  const layoutTests = [
    {
      name: 'Main Layout Container',
      test: () => document.querySelector('.h-screen.flex.flex-col') !== null
    },
    {
      name: 'Header Section',
      test: () => document.querySelector('header.h-14') !== null
    },
    {
      name: 'Main Content Grid',
      test: () => document.querySelector('.flex.flex-1.overflow-hidden') !== null
    },
    {
      name: 'Collections Sidebar',
      test: () => document.querySelector('[class*="ResizablePanel"]') !== null
    },
    {
      name: 'Main Content Area',
      test: () => document.querySelector('.flex-1.flex.flex-col.min-w-0') !== null
    }
  ]
  
  layoutTests.forEach(test => {
    const result = test.test()
    console.log(`${result ? '✅' : '❌'} ${test.name}`)
  })
  
  console.log('')
  
  // Step 2: Test Action Bar Components
  console.log('📋 Step 2: Testing Action Bar Components...')
  const actionBarTests = [
    {
      name: 'Send Button Present',
      test: () => document.querySelector('button:has(svg[data-lucide="send"])') !== null
    },
    {
      name: 'AI Button Present',
      test: () => document.querySelector('button:has(svg[data-lucide="sparkles"])') !== null
    },
    {
      name: 'Sidebar Toggle Present',
      test: () => document.querySelector('button[title="Toggle Utilities Panel"]') !== null
    },
    {
      name: 'Action Group Layout',
      test: () => {
        const group = document.querySelector('.flex.items-center.space-x-2')
        return group && group.querySelectorAll('button').length >= 3
      }
    }
  ]
  
  actionBarTests.forEach(test => {
    const result = test.test()
    console.log(`${result ? '✅' : '❌'} ${test.name}`)
  })
  
  console.log('')
  
  // Step 3: Test Right Sidebar Toggle
  console.log('📋 Step 3: Testing Right Sidebar Toggle...')
  const toggleBtn = document.querySelector('button[title="Toggle Utilities Panel"]')
  
  if (toggleBtn) {
    console.log('✅ Found sidebar toggle button')
    
    // Get initial state
    const initialSidebar = document.querySelector('.w-80.bg-white, .w-80.dark\\:bg-gray-800')
    const initiallyOpen = initialSidebar !== null
    console.log(`Initial sidebar state: ${initiallyOpen ? 'Open' : 'Closed'}`)
    
    // Test toggle
    toggleBtn.click()
    
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const newSidebar = document.querySelector('.w-80.bg-white, .w-80.dark\\:bg-gray-800')
    const nowOpen = newSidebar !== null
    console.log(`New sidebar state: ${nowOpen ? 'Open' : 'Closed'}`)
    
    if (nowOpen !== initiallyOpen) {
      console.log('✅ Sidebar toggle working correctly')
    } else {
      console.log('❌ Sidebar toggle not working')
    }
    
    // Ensure sidebar is open for next tests
    if (!nowOpen) {
      toggleBtn.click()
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
  } else {
    console.log('❌ Sidebar toggle button not found')
  }
  
  console.log('')
  
  // Step 4: Test AI Button Dropdown
  console.log('📋 Step 4: Testing AI Button Dropdown...')
  const aiBtn = document.querySelector('button:has(svg[data-lucide="sparkles"])')
  
  if (aiBtn) {
    console.log('✅ Found AI button')
    
    aiBtn.click()
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const dropdown = document.querySelector('.absolute.top-full')
    if (dropdown) {
      console.log('✅ AI dropdown appeared')
      
      const actions = dropdown.querySelectorAll('button')
      console.log(`✅ Found ${actions.length} AI actions`)
      
      // Close dropdown
      document.body.click()
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const stillOpen = document.querySelector('.absolute.top-full')
      if (!stillOpen) {
        console.log('✅ Dropdown closed correctly')
      } else {
        console.log('❌ Dropdown did not close')
      }
    } else {
      console.log('❌ AI dropdown did not appear')
    }
  } else {
    console.log('❌ AI button not found')
  }
  
  console.log('')
  
  // Step 5: Test Response Panel with Test Data
  console.log('📋 Step 5: Testing Response Panel...')
  
  if (typeof window !== 'undefined' && window.setTestResponseInApp) {
    console.log('Setting test response...')
    window.setTestResponseInApp()
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const responseViewer = document.querySelector('[class*="ResponseViewer"]')
    if (responseViewer) {
      console.log('✅ Response viewer appeared')
      
      // Check for scrollable content
      const scrollableContent = responseViewer.querySelector('.overflow-auto, .overflow-y-auto')
      if (scrollableContent) {
        console.log('✅ Response content is scrollable')
      } else {
        console.log('❌ Response content is not scrollable')
      }
      
      // Check for tabs
      const tabs = responseViewer.querySelectorAll('button[role="tab"], .border-b button')
      console.log(`✅ Found ${tabs.length} response tabs`)
      
      // Check for copy button
      const copyBtn = responseViewer.querySelector('button[title*="Copy"], button:has(svg[data-lucide="copy"])')
      if (copyBtn) {
        console.log('✅ Copy button found')
      } else {
        console.log('❌ Copy button not found')
      }
      
    } else {
      console.log('❌ Response viewer did not appear')
    }
  } else {
    console.log('❌ Test response function not available')
  }
  
  console.log('')
  
  // Step 6: Test Right Sidebar Content
  console.log('📋 Step 6: Testing Right Sidebar Content...')
  const rightSidebar = document.querySelector('.w-80.bg-white, .w-80.dark\\:bg-gray-800')
  
  if (rightSidebar) {
    console.log('✅ Right sidebar is open')
    
    // Check for tabs
    const sidebarTabs = rightSidebar.querySelectorAll('button')
    console.log(`✅ Found ${sidebarTabs.length} sidebar buttons/tabs`)
    
    // Check for content area
    const contentArea = rightSidebar.querySelector('.flex-1.overflow-hidden')
    if (contentArea) {
      console.log('✅ Sidebar content area found')
    } else {
      console.log('❌ Sidebar content area not found')
    }
    
    // Test sidebar tabs
    const codeTab = Array.from(sidebarTabs).find(btn => btn.textContent.includes('Code'))
    if (codeTab) {
      console.log('✅ Code tab found')
      codeTab.click()
      await new Promise(resolve => setTimeout(resolve, 200))
      console.log('✅ Code tab clicked')
    }
    
  } else {
    console.log('❌ Right sidebar not found or not open')
  }
  
  console.log('')
  
  // Step 7: Layout Measurements
  console.log('📋 Step 7: Layout Measurements...')
  
  const mainContent = document.querySelector('.flex-1.flex.flex-col.min-w-0')
  const rightSidebarEl = document.querySelector('.w-80.bg-white, .w-80.dark\\:bg-gray-800')
  
  if (mainContent && rightSidebarEl) {
    const contentRect = mainContent.getBoundingClientRect()
    const sidebarRect = rightSidebarEl.getBoundingClientRect()
    
    console.log(`Main content width: ${contentRect.width}px`)
    console.log(`Right sidebar width: ${sidebarRect.width}px`)
    console.log(`Content right edge: ${contentRect.right}px`)
    console.log(`Sidebar left edge: ${sidebarRect.left}px`)
    
    const overlap = contentRect.right > sidebarRect.left
    if (!overlap) {
      console.log('✅ No overlap between main content and sidebar')
    } else {
      console.log('❌ Main content overlaps with sidebar')
    }
  }
  
  console.log('')
  console.log('🎉 Complete Layout Test Finished!')
  console.log('')
  console.log('📋 Manual Verification Checklist:')
  console.log('1. ✅ Verify three distinct columns are visible')
  console.log('2. ✅ Check that right sidebar does not overlap main content')
  console.log('3. ✅ Test theme switching (light/dark) for consistency')
  console.log('4. ✅ Verify response panel scrolls properly with large content')
  console.log('5. ✅ Test keyboard shortcuts (Cmd+Enter to send request)')
  console.log('6. ✅ Verify AI button opens dropdown with 5 actions')
  console.log('7. ✅ Check that sidebar toggle works smoothly')
  console.log('8. ✅ Verify code generation in right sidebar')
}

// Export to window for browser console access
if (typeof window !== 'undefined') {
  window.runCompleteLayoutTest = runCompleteLayoutTest
}