// Create test response for layout verification

export const createTestResponse = () => {
  const testResponse = {
    status: 200,
    statusText: 'OK',
    data: {
      message: 'Test response for layout verification',
      users: [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 3,
        hasNext: false
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        server: 'test-server'
      }
    },
    headers: {
      'content-type': 'application/json',
      'x-response-time': '45ms',
      'x-rate-limit-remaining': '99',
      'set-cookie': 'session=abc123; Path=/; HttpOnly; Secure'
    },
    time: 245,
    size: 1024,
    timestamp: new Date().toISOString()
  }
  
  return testResponse
}

export const setTestResponseInApp = () => {
  if (typeof window !== 'undefined' && window.setTestResponse) {
    const testResponse = createTestResponse()
    window.setTestResponse(testResponse)
    console.log('✅ Test response set successfully!')
    console.log('Response data:', testResponse)
    return testResponse
  } else {
    console.log('❌ setTestResponse function not available')
    return null
  }
}

export const createLargeTestResponse = () => {
  const largeData = {
    message: 'Large test response for scrolling verification',
    items: []
  }
  
  // Create 50 items to test scrolling
  for (let i = 1; i <= 50; i++) {
    largeData.items.push({
      id: i,
      name: `Item ${i}`,
      description: `This is a detailed description for item ${i}. It contains multiple lines of text to test the scrolling behavior of the response panel.`,
      properties: {
        category: `Category ${Math.ceil(i / 10)}`,
        priority: i % 3 === 0 ? 'high' : i % 2 === 0 ? 'medium' : 'low',
        tags: [`tag${i}`, `category${Math.ceil(i / 10)}`, 'test'],
        metadata: {
          created: new Date(Date.now() - i * 86400000).toISOString(),
          updated: new Date().toISOString(),
          version: `1.${i}.0`
        }
      }
    })
  }
  
  return {
    status: 200,
    statusText: 'OK',
    data: largeData,
    headers: {
      'content-type': 'application/json',
      'x-response-time': '125ms',
      'x-total-items': '50',
      'set-cookie': 'session=xyz789; Path=/; HttpOnly; Secure'
    },
    time: 125,
    size: JSON.stringify(largeData).length,
    timestamp: new Date().toISOString()
  }
}

export const setLargeTestResponse = () => {
  if (typeof window !== 'undefined' && window.setTestResponse) {
    const largeResponse = createLargeTestResponse()
    window.setTestResponse(largeResponse)
    console.log('✅ Large test response set successfully!')
    console.log('Response size:', largeResponse.size, 'bytes')
    return largeResponse
  } else {
    console.log('❌ setTestResponse function not available')
    return null
  }
}

// Export to window for browser console access
if (typeof window !== 'undefined') {
  window.createTestResponse = createTestResponse
  window.setTestResponseInApp = setTestResponseInApp
  window.createLargeTestResponse = createLargeTestResponse
  window.setLargeTestResponse = setLargeTestResponse
}