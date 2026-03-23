/**
 * Test Environment Variable Resolution
 * Run in browser console: window.testEnvironmentResolution()
 */

import { useEnvironmentStore } from '../stores/environmentStore'

export function testEnvironmentResolution() {
  console.log('=== Testing Environment Variable Resolution ===')
  
  const store = useEnvironmentStore.getState()
  
  console.log('1. Current Environment:', store.currentEnvironment)
  console.log('2. All Environments:', store.environments)
  console.log('3. Variables:', store.currentEnvironment?.variables)
  
  // Test the replaceVariables function
  const testUrl = '{{server_url}}/api/test'
  console.log('4. Test URL:', testUrl)
  
  const resolved = store.replaceVariables(testUrl)
  console.log('5. Resolved URL:', resolved)
  
  // Test with different patterns
  const tests = [
    '{{server_url}}/api/test',
    '{{ server_url }}/api/test',
    '{{server_url}}',
    'https://example.com/{{server_url}}/test',
    '{{missing_var}}/test'
  ]
  
  console.log('\n=== Testing Multiple Patterns ===')
  tests.forEach(test => {
    const result = store.replaceVariables(test)
    console.log(`Input:  "${test}"`)
    console.log(`Output: "${result}"`)
    console.log('---')
  })
  
  return {
    currentEnvironment: store.currentEnvironment,
    environments: store.environments,
    testResults: tests.map(test => ({
      input: test,
      output: store.replaceVariables(test)
    }))
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  window.testEnvironmentResolution = testEnvironmentResolution
}
