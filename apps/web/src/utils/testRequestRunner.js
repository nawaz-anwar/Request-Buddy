import { runRequest, validateRequest } from './requestRunner'

/**
 * Test the request runner with a simple GET request
 */
export async function testRequestRunner() {
  console.log('Testing Request Runner...')
  
  const testRequest = {
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: {
      'Accept': 'application/json'
    },
    params: {},
    body: { type: 'none' },
    auth: { type: 'none' }
  }
  
  console.log('Test request:', testRequest)
  
  // Validate first
  const validation = validateRequest(testRequest)
  console.log('Validation result:', validation)
  
  if (!validation.isValid) {
    console.error('Test request is invalid:', validation.errors)
    return
  }
  
  try {
    const result = await runRequest(testRequest)
    console.log('Test result:', result)
    
    if (result.error) {
      console.error('Test failed with error:', result.error)
    } else {
      console.log('Test successful! Status:', result.status, 'Time:', result.time + 'ms')
    }
    
    return result
  } catch (error) {
    console.error('Test threw error:', error)
    return { error: error.message }
  }
}

// Add to window for debugging
if (typeof window !== 'undefined') {
  window.testRequestRunner = testRequestRunner
}