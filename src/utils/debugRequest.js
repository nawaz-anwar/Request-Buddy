/**
 * Debug Request - Simple test to isolate the issue
 */

export async function debugSimpleRequest() {
  console.log('🔍 Starting debug request...')
  
  try {
    // Test 1: Simple fetch without any imports
    console.log('Test 1: Direct fetch')
    const response1 = await fetch('https://httpbin.org/get')
    const data1 = await response1.text()
    console.log('✅ Direct fetch works:', response1.status)
    
    // Test 2: Test with the URL from the UI
    console.log('Test 2: Fetch with dummy.restapi URL')
    const response2 = await fetch('https://dummyjson.com/products')
    const data2 = await response2.json()
    console.log('✅ DummyJSON fetch works:', response2.status, data2.products?.length, 'products')
    
    // Test 3: Import and test runRequest
    console.log('Test 3: Import runRequest')
    const { runRequest } = await import('./requestRunner.js')
    console.log('✅ runRequest imported successfully')
    
    // Test 4: Call runRequest with simple request
    console.log('Test 4: Call runRequest')
    const result = await runRequest({
      method: 'GET',
      url: 'https://dummyjson.com/products',
      headers: {},
      params: {},
      body: { type: 'none', content: '' },
      auth: { type: 'none' }
    })
    
    console.log('✅ runRequest result:', result)
    return result
    
  } catch (error) {
    console.error('❌ Debug request failed:', error)
    console.error('Error stack:', error.stack)
    return { error: error.message }
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  window.debugSimpleRequest = debugSimpleRequest
}