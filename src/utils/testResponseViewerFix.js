export const testResponseViewerFix = () => {
  console.log('🧪 Testing Response Viewer Fixes...')
  
  // Test data generators
  const generateLargeJsonResponse = () => {
    const largeData = {
      users: [],
      metadata: {
        total: 1000,
        page: 1,
        limit: 100,
        timestamp: new Date().toISOString()
      },
      config: {
        apiVersion: "v2.1",
        features: ["authentication", "pagination", "filtering", "sorting"],
        endpoints: {
          users: "/api/v2/users",
          posts: "/api/v2/posts",
          comments: "/api/v2/comments"
        }
      }
    }

    // Generate 100 fake users for testing scrolling
    for (let i = 1; i <= 100; i++) {
      largeData.users.push({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        profile: {
          bio: `This is a long biography for user ${i}. It contains multiple sentences to test horizontal scrolling and text wrapping in the JSON viewer. The user has been active since ${2020 + (i % 5)} and has contributed to various projects.`,
          preferences: {
            theme: i % 2 === 0 ? 'dark' : 'light',
            notifications: {
              email: true,
              push: i % 3 === 0,
              sms: false
            }
          },
          stats: {
            posts: Math.floor(Math.random() * 100),
            followers: Math.floor(Math.random() * 1000),
            following: Math.floor(Math.random() * 500)
          }
        },
        addresses: [
          {
            type: 'home',
            street: `${100 + i} Main Street`,
            city: 'Sample City',
            state: 'CA',
            zipCode: `9${String(i).padStart(4, '0')}`
          },
          {
            type: 'work',
            street: `${200 + i} Business Ave`,
            city: 'Work City',
            state: 'NY',
            zipCode: `1${String(i).padStart(4, '0')}`
          }
        ]
      })
    }

    return {
      status: 200,
      statusText: 'OK',
      data: largeData,
      headers: {
        'content-type': 'application/json',
        'content-length': JSON.stringify(largeData).length,
        'x-response-time': '245ms',
        'x-rate-limit-remaining': '99',
        'cache-control': 'no-cache'
      },
      time: 245,
      size: JSON.stringify(largeData).length,
      timestamp: new Date().toISOString()
    }
  }

  const generateHtmlResponse = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test HTML Response</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { color: #333; border-bottom: 2px solid #007acc; }
        .content { margin-top: 20px; line-height: 1.6; }
        .code { background: #f4f4f4; padding: 10px; border-radius: 4px; }
    </style>
</head>
<body>
    <h1 class="header">Test HTML Response</h1>
    <div class="content">
        <p>This is a test HTML response to verify the HTML preview functionality.</p>
        <p>It contains multiple paragraphs and elements to test scrolling.</p>
        <div class="code">
            <pre>function testCode() {
    console.log("Testing HTML preview");
    return "success";
}</pre>
        </div>
        <ul>
            <li>List item 1</li>
            <li>List item 2</li>
            <li>List item 3</li>
        </ul>
    </div>
</body>
</html>`

    return {
      status: 200,
      statusText: 'OK',
      data: htmlContent,
      headers: {
        'content-type': 'text/html',
        'content-length': htmlContent.length,
        'x-response-time': '89ms'
      },
      time: 89,
      size: htmlContent.length,
      timestamp: new Date().toISOString()
    }
  }

  const generateErrorResponse = () => {
    return {
      status: 404,
      statusText: 'Not Found',
      error: 'The requested resource was not found on the server. Please check the URL and try again.',
      data: {
        error: 'Not Found',
        message: 'The requested resource was not found',
        code: 404,
        timestamp: new Date().toISOString()
      },
      headers: {
        'content-type': 'application/json',
        'x-error-code': 'RESOURCE_NOT_FOUND'
      },
      time: 156,
      size: 0,
      timestamp: new Date().toISOString()
    }
  }

  // Test functions
  const tests = {
    // Test large JSON response scrolling
    testLargeJsonScrolling: () => {
      console.log('📊 Testing large JSON response scrolling...')
      const response = generateLargeJsonResponse()
      console.log('Generated response with', response.data.users.length, 'users')
      console.log('Response size:', (response.size / 1024).toFixed(1), 'KB')
      
      // Simulate setting the response
      if (window.setTestResponse) {
        window.setTestResponse(response)
        console.log('✅ Large JSON response set - check scrolling behavior')
      } else {
        console.log('💡 To test: Copy this response object and manually trigger a request')
        console.log('Response preview:', {
          status: response.status,
          userCount: response.data.users.length,
          sizeKB: (response.size / 1024).toFixed(1)
        })
      }
    },

    // Test HTML response preview
    testHtmlPreview: () => {
      console.log('🌐 Testing HTML response preview...')
      const response = generateHtmlResponse()
      
      if (window.setTestResponse) {
        window.setTestResponse(response)
        console.log('✅ HTML response set - check preview functionality')
      } else {
        console.log('💡 HTML response generated - manually test HTML preview')
        console.log('Response preview:', {
          status: response.status,
          contentType: response.headers['content-type'],
          sizeBytes: response.size
        })
      }
    },

    // Test error response display
    testErrorResponse: () => {
      console.log('❌ Testing error response display...')
      const response = generateErrorResponse()
      
      if (window.setTestResponse) {
        window.setTestResponse(response)
        console.log('✅ Error response set - check error display')
      } else {
        console.log('💡 Error response generated')
        console.log('Response preview:', {
          status: response.status,
          error: response.error
        })
      }
    },

    // Test copy functionality
    testCopyFunctionality: () => {
      console.log('📋 Testing copy functionality...')
      
      const testText = JSON.stringify({
        message: "Test copy functionality",
        timestamp: new Date().toISOString(),
        data: [1, 2, 3, 4, 5]
      }, null, 2)

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(testText).then(() => {
          console.log('✅ Copy test successful - text copied to clipboard')
          console.log('💡 Check that copy button shows feedback (checkmark icon)')
        }).catch(err => {
          console.error('❌ Copy test failed:', err)
        })
      } else {
        console.log('❌ Clipboard API not available in this environment')
      }
    },

    // Test theme consistency
    testThemeConsistency: () => {
      console.log('🎨 Testing theme consistency...')
      
      const checkThemeElements = () => {
        const responseViewer = document.querySelector('[data-testid="response-viewer"]') || 
                             document.querySelector('.response-viewer') ||
                             document.querySelector('div[class*="response"]')
        
        if (responseViewer) {
          const styles = window.getComputedStyle(responseViewer)
          console.log('Response viewer styles:', {
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            borderColor: styles.borderColor
          })
        }
        
        // Check for hardcoded colors
        const elementsWithHardcodedColors = document.querySelectorAll('[style*="color"], [class*="gray-"], [class*="bg-gray"]')
        console.log('Elements with potential hardcoded colors:', elementsWithHardcodedColors.length)
        
        console.log('💡 Switch between light/dark theme and verify all panels update')
      }

      setTimeout(checkThemeElements, 100)
    },

    // Test responsive layout
    testResponsiveLayout: () => {
      console.log('📱 Testing responsive layout...')
      
      const originalWidth = window.innerWidth
      
      // Simulate different screen sizes
      const testSizes = [
        { width: 1920, name: 'Desktop Large' },
        { width: 1366, name: 'Desktop Standard' },
        { width: 1024, name: 'Tablet Landscape' },
        { width: 768, name: 'Tablet Portrait' }
      ]

      testSizes.forEach(size => {
        console.log(`Testing ${size.name} (${size.width}px)`)
        // Note: Can't actually resize window in most browsers due to security
        console.log('💡 Manually resize window to test responsive behavior')
      })
      
      console.log('✅ Layout should adapt to different screen sizes')
      console.log('💡 Response panel should maintain proper width at all sizes')
    }
  }

  // Run basic tests
  console.log('🎯 Available Test Functions:')
  console.log('- testResponseViewerFix.testLargeJsonScrolling()')
  console.log('- testResponseViewerFix.testHtmlPreview()')
  console.log('- testResponseViewerFix.testErrorResponse()')
  console.log('- testResponseViewerFix.testCopyFunctionality()')
  console.log('- testResponseViewerFix.testThemeConsistency()')
  console.log('- testResponseViewerFix.testResponsiveLayout()')
  
  console.log('🔧 Testing copy functionality automatically...')
  tests.testCopyFunctionality()
  
  console.log('🎨 Testing theme consistency...')
  tests.testThemeConsistency()

  return tests
}

// Test checklist for manual verification
export const responseViewerTestChecklist = () => {
  console.log('📋 Response Viewer Test Checklist:')
  console.log('')
  console.log('✅ Layout & Scrolling:')
  console.log('  □ Response panel fills available width')
  console.log('  □ JSON content scrolls vertically within panel')
  console.log('  □ Long JSON lines scroll horizontally')
  console.log('  □ No page-level scrolling for JSON content')
  console.log('  □ Panel height adjusts properly')
  console.log('')
  console.log('✅ Copy Functionality:')
  console.log('  □ Copy button shows clipboard icon initially')
  console.log('  □ Copy button shows checkmark after clicking')
  console.log('  □ Checkmark reverts to clipboard icon after 2 seconds')
  console.log('  □ Content is actually copied to clipboard')
  console.log('  □ Header copy buttons work individually')
  console.log('')
  console.log('✅ Theme Consistency:')
  console.log('  □ All panels respect light/dark theme')
  console.log('  □ No hardcoded dark colors in light mode')
  console.log('  □ JSON syntax highlighting adapts to theme')
  console.log('  □ Borders and backgrounds use theme colors')
  console.log('')
  console.log('✅ Content Display:')
  console.log('  □ JSON is properly formatted and highlighted')
  console.log('  □ HTML preview works correctly')
  console.log('  □ Error responses display clearly')
  console.log('  □ Headers are readable and copyable')
  console.log('  □ Meta information is accurate')
  console.log('')
  console.log('✅ Responsive Behavior:')
  console.log('  □ Layout works on different screen sizes')
  console.log('  □ Text remains readable at all sizes')
  console.log('  □ Buttons remain accessible')
  console.log('  □ Scrolling works on touch devices')
}

// Auto-run checklist
setTimeout(() => {
  responseViewerTestChecklist()
}, 1000)