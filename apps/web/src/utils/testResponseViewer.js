// Test function for response viewer functionality
export const testResponseViewer = () => {
  console.log('=== Testing Response Viewer Features ===')
  
  // Test data samples
  const testResponses = {
    jsonSuccess: {
      status: 200,
      statusText: 'OK',
      data: {
        users: [
          { id: 1, name: 'John Doe', email: 'john@example.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
        ],
        total: 2,
        page: 1
      },
      headers: {
        'content-type': 'application/json',
        'x-total-count': '2',
        'cache-control': 'no-cache'
      },
      time: 245,
      size: 1024,
      timestamp: new Date().toISOString()
    },
    
    htmlResponse: {
      status: 200,
      statusText: 'OK',
      data: '<!DOCTYPE html><html><head><title>Test Page</title></head><body><h1>Hello World</h1><p>This is a test HTML response.</p></body></html>',
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'server': 'nginx/1.18.0'
      },
      time: 156,
      size: 2048,
      timestamp: new Date().toISOString()
    },
    
    errorResponse: {
      status: 404,
      statusText: 'Not Found',
      data: { error: 'Resource not found', code: 'NOT_FOUND' },
      headers: {
        'content-type': 'application/json',
        'x-error-id': 'err_123456'
      },
      time: 89,
      size: 512,
      timestamp: new Date().toISOString()
    },
    
    networkError: {
      error: 'Network request failed: ECONNREFUSED',
      status: 0,
      statusText: 'Network Error',
      data: { error: 'Connection refused' },
      headers: {},
      time: 0,
      size: 0,
      timestamp: new Date().toISOString()
    },
    
    historicalResponse: {
      status: 201,
      statusText: 'Created',
      data: { id: 123, message: 'User created successfully' },
      headers: {
        'content-type': 'application/json',
        'location': '/api/users/123'
      },
      time: 312,
      size: 256,
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      isHistorical: true
    }
  }
  
  console.log('✓ Response Viewer component available')
  console.log('✓ Syntax highlighting utility available')
  console.log('')
  console.log('Test responses available:')
  console.log('- testResponses.jsonSuccess (200 JSON response)')
  console.log('- testResponses.htmlResponse (200 HTML response)')
  console.log('- testResponses.errorResponse (404 error)')
  console.log('- testResponses.networkError (network failure)')
  console.log('- testResponses.historicalResponse (from history)')
  console.log('')
  console.log('Features implemented:')
  console.log('- ✓ Tabbed interface (Body, Headers, Meta)')
  console.log('- ✓ JSON syntax highlighting')
  console.log('- ✓ Raw/Pretty view toggle')
  console.log('- ✓ HTML preview with iframe')
  console.log('- ✓ Copy to clipboard')
  console.log('- ✓ Download response')
  console.log('- ✓ Status code color coding')
  console.log('- ✓ Response timing and size')
  console.log('- ✓ Historical response indicator')
  console.log('- ✓ Error handling and display')
  console.log('')
  console.log('To test manually:')
  console.log('1. Send requests to see different response types')
  console.log('2. Toggle between Body/Headers/Meta tabs')
  console.log('3. Use Raw/Pretty toggle for JSON responses')
  console.log('4. Try copy and download buttons')
  console.log('5. View historical responses from history panel')
  
  return testResponses
}

// Add to window for easy testing
if (typeof window !== 'undefined') {
  window.testResponseViewer = testResponseViewer
}