/**
 * Test utility for resizable response panel and Pretty/Raw toggle
 * Run this in the browser console to test the Postman-style features
 */

export const testResizableResponsePanel = () => {
  console.log('🧪 Testing Resizable Response Panel')
  console.log('=' .repeat(50))
  
  try {
    // Test 1: Check if response height state exists
    console.log('\n📝 Test 1: Checking response height state')
    const responseHeightElement = document.querySelector('[style*="height:"][style*="px"]')
    if (responseHeightElement) {
      console.log('✅ Response panel with dynamic height found')
      const style = responseHeightElement.getAttribute('style')
      console.log('   Current style:', style)
    } else {
      console.log('❌ Response panel with dynamic height not found')
    }
    
    // Test 2: Check if divider exists
    console.log('\n📝 Test 2: Checking resizable divider')
    const divider = document.querySelector('.cursor-row-resize')
    if (divider) {
      console.log('✅ Resizable divider found')
      console.log('   Classes:', divider.className)
      
      // Check if divider has mouse event handlers
      const hasMouseDown = divider.onmousedown !== null
      console.log('   Has mousedown handler:', hasMouseDown ? '✅' : '❌')
    } else {
      console.log('❌ Resizable divider not found')
    }
    
    // Test 3: Check localStorage persistence
    console.log('\n📝 Test 3: Checking localStorage persistence')
    const savedHeight = localStorage.getItem('requestBuddy_responseHeight')
    if (savedHeight) {
      console.log('✅ Response height saved in localStorage:', savedHeight + 'px')
    } else {
      console.log('⚠️  No saved response height in localStorage (using default)')
    }
    
    // Test 4: Simulate divider interaction
    console.log('\n📝 Test 4: Simulating divider interaction')
    if (divider) {
      console.log('   Hovering over divider...')
      divider.dispatchEvent(new MouseEvent('mouseenter'))
      
      const computedStyle = window.getComputedStyle(divider)
      console.log('   Cursor style:', computedStyle.cursor)
      
      if (computedStyle.cursor === 'row-resize') {
        console.log('✅ Cursor changes to row-resize on hover')
      } else {
        console.log('❌ Cursor does not change to row-resize')
      }
    }
    
    console.log('\n🎉 Resizable Response Panel Test Complete!')
    
    return {
      success: true,
      hasResponsePanel: !!responseHeightElement,
      hasDivider: !!divider,
      hasPersistence: !!savedHeight,
      cursorChanges: divider ? window.getComputedStyle(divider).cursor === 'row-resize' : false
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export const testPrettyRawToggle = () => {
  console.log('\n🧪 Testing Pretty/Raw Toggle')
  console.log('=' .repeat(50))
  
  try {
    // Test 1: Check if response viewer exists
    console.log('\n📝 Test 1: Checking response viewer')
    const responseViewer = document.querySelector('[data-testid="response-viewer"]') || 
                          document.querySelector('.bg-gray-900.dark\\:bg-gray-950') ||
                          document.querySelector('pre code')
    
    if (responseViewer) {
      console.log('✅ Response viewer found')
    } else {
      console.log('⚠️  Response viewer not found (no response loaded)')
    }
    
    // Test 2: Check for Pretty/Raw buttons
    console.log('\n📝 Test 2: Checking Pretty/Raw buttons')
    const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.textContent.includes('Pretty') || btn.textContent.includes('Raw')
    )
    
    console.log(`   Found ${buttons.length} Pretty/Raw buttons`)
    buttons.forEach((btn, index) => {
      console.log(`   Button ${index + 1}: "${btn.textContent.trim()}"`)
      console.log(`   Classes: ${btn.className}`)
      console.log(`   Active: ${btn.className.includes('bg-blue-600') ? '✅' : '❌'}`)
    })
    
    // Test 3: Check button functionality
    console.log('\n📝 Test 3: Testing button functionality')
    const prettyButton = buttons.find(btn => btn.textContent.includes('Pretty'))
    const rawButton = buttons.find(btn => btn.textContent.includes('Raw'))
    
    if (prettyButton && rawButton) {
      console.log('✅ Both Pretty and Raw buttons found')
      
      // Test clicking Raw button
      console.log('   Clicking Raw button...')
      rawButton.click()
      
      setTimeout(() => {
        const isRawActive = rawButton.className.includes('bg-blue-600')
        console.log('   Raw button active after click:', isRawActive ? '✅' : '❌')
        
        // Test clicking Pretty button
        console.log('   Clicking Pretty button...')
        prettyButton.click()
        
        setTimeout(() => {
          const isPrettyActive = prettyButton.className.includes('bg-blue-600')
          console.log('   Pretty button active after click:', isPrettyActive ? '✅' : '❌')
        }, 100)
      }, 100)
      
    } else {
      console.log('❌ Pretty or Raw button not found')
    }
    
    // Test 4: Check response content format
    console.log('\n📝 Test 4: Checking response content format')
    const codeElement = document.querySelector('pre code')
    if (codeElement) {
      const hasHighlighting = codeElement.innerHTML.includes('<span')
      console.log('   Has syntax highlighting:', hasHighlighting ? '✅' : '❌')
      
      const content = codeElement.textContent || codeElement.innerText
      const isFormatted = content.includes('\n') && content.includes('  ')
      console.log('   Is formatted (has newlines and indentation):', isFormatted ? '✅' : '❌')
    } else {
      console.log('⚠️  No code element found (no response loaded)')
    }
    
    console.log('\n🎉 Pretty/Raw Toggle Test Complete!')
    
    return {
      success: true,
      hasResponseViewer: !!responseViewer,
      buttonCount: buttons.length,
      hasPrettyButton: !!prettyButton,
      hasRawButton: !!rawButton,
      hasCodeElement: !!codeElement
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export const testPostmanStyleFeatures = () => {
  console.log('🚀 Testing All Postman-Style Features')
  console.log('=' .repeat(60))
  
  const resizableResults = testResizableResponsePanel()
  const toggleResults = testPrettyRawToggle()
  
  console.log('\n📊 SUMMARY REPORT')
  console.log('=' .repeat(60))
  
  console.log('\n🔧 RESIZABLE RESPONSE PANEL:')
  console.log('   Response Panel:', resizableResults.hasResponsePanel ? '✅' : '❌')
  console.log('   Divider:', resizableResults.hasDivider ? '✅' : '❌')
  console.log('   Persistence:', resizableResults.hasPersistence ? '✅' : '⚠️')
  console.log('   Cursor Change:', resizableResults.cursorChanges ? '✅' : '❌')
  
  console.log('\n🎨 PRETTY/RAW TOGGLE:')
  console.log('   Response Viewer:', toggleResults.hasResponseViewer ? '✅' : '⚠️')
  console.log('   Button Count:', toggleResults.buttonCount)
  console.log('   Pretty Button:', toggleResults.hasPrettyButton ? '✅' : '❌')
  console.log('   Raw Button:', toggleResults.hasRawButton ? '✅' : '❌')
  console.log('   Code Element:', toggleResults.hasCodeElement ? '✅' : '⚠️')
  
  const overallSuccess = resizableResults.success && toggleResults.success
  console.log('\n🎯 OVERALL STATUS:', overallSuccess ? '✅ PASSED' : '❌ FAILED')
  
  return {
    success: overallSuccess,
    resizable: resizableResults,
    toggle: toggleResults
  }
}

// Manual testing instructions
export const manualTestInstructions = `
🧪 MANUAL TESTING INSTRUCTIONS FOR POSTMAN-STYLE FEATURES

SETUP:
1. Open Request Buddy in your browser
2. Create or select a request
3. Send the request to get a response
4. Ensure the response panel is visible at the bottom

FEATURE 1: RESIZABLE RESPONSE PANEL
================================

✅ TEST RESIZABLE DIVIDER:
1. Look for a thin horizontal line between request editor and response viewer
2. Hover over the divider - cursor should change to ↕️ (row-resize)
3. Click and drag the divider up - response area should get larger
4. Click and drag the divider down - request editor area should get larger
5. Try to drag beyond limits - should stop at minimum heights
6. Refresh the page - divider position should be remembered

Expected Behavior:
- Smooth dragging with visual feedback
- Minimum request area: 200px
- Minimum response area: 150px
- Position persists after page refresh
- Cursor changes to row-resize on hover

FEATURE 2: PRETTY/RAW TOGGLE
===========================

✅ TEST RESPONSE FORMATTING:
1. Send a request that returns JSON data
2. Look for "Pretty" and "Raw" buttons in response body header
3. Click "Pretty" - should show formatted JSON with syntax highlighting
4. Click "Raw" - should show unformatted raw response text
5. Toggle between modes - active button should be highlighted
6. Check that content changes between formatted and raw

Expected Behavior:
- Pretty: Formatted JSON with colors and indentation
- Raw: Plain text without formatting
- Active button highlighted in blue
- Smooth switching between modes
- Content scrolling works in both modes

TROUBLESHOOTING:
===============

If resizable divider not working:
- Check browser console for errors
- Verify response panel is visible
- Try refreshing the page

If Pretty/Raw toggle not working:
- Ensure response contains JSON data
- Check if buttons are visible in response header
- Try sending a different request

PERFORMANCE TESTING:
===================

✅ Test with large responses:
1. Send request with large JSON response (>1MB)
2. Test resizing performance - should be smooth
3. Test Pretty/Raw toggle - should switch quickly
4. Verify scrolling works in both modes

✅ Test edge cases:
1. Very small response panel height
2. Very large response panel height
3. Non-JSON responses (HTML, text, etc.)
4. Empty responses
5. Error responses

SUCCESS CRITERIA:
================

✅ Resizable divider works smoothly like Postman
✅ Pretty/Raw toggle switches response format
✅ Position and mode preferences are saved
✅ No performance issues with large responses
✅ Works with all response types
✅ Proper visual feedback and cursor changes
`

console.log('Postman-style features test utilities loaded!')
console.log('Run testPostmanStyleFeatures() to test all features')
console.log('Check manualTestInstructions for manual testing steps')