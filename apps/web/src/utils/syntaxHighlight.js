// Simple JSON syntax highlighting utility
export const highlightJson = (json) => {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, null, 2)
  }

  // Simple regex-based highlighting
  return json
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'text-gray-300'
      
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-blue-400' // Property names
        } else {
          cls = 'text-green-400' // String values
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-purple-400' // Booleans
      } else if (/null/.test(match)) {
        cls = 'text-red-400' // Null
      } else if (/^-?\d/.test(match)) {
        cls = 'text-yellow-400' // Numbers
      }
      
      return `<span class="${cls}">${match}</span>`
    })
    .replace(/([{}])/g, '<span class="text-gray-400">$1</span>') // Braces
    .replace(/([[\\]])/g, '<span class="text-gray-400">$1</span>') // Brackets
    .replace(/([:,])/g, '<span class="text-gray-500">$1</span>') // Punctuation
}

// Detect content type from headers
export const getContentType = (headers) => {
  if (!headers) return 'text/plain'
  
  const contentType = headers['content-type'] || headers['Content-Type'] || ''
  
  if (contentType.includes('application/json')) return 'application/json'
  if (contentType.includes('text/html')) return 'text/html'
  if (contentType.includes('text/xml') || contentType.includes('application/xml')) return 'application/xml'
  if (contentType.includes('text/css')) return 'text/css'
  if (contentType.includes('text/javascript') || contentType.includes('application/javascript')) return 'text/javascript'
  if (contentType.includes('text/')) return 'text/plain'
  
  return 'application/octet-stream'
}

// Format response data based on content type
export const formatResponseData = (data, contentType, isRaw = false) => {
  if (isRaw) {
    return typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  }

  switch (contentType) {
    case 'application/json':
      try {
        const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
        return highlightJson(jsonString)
      } catch {
        return typeof data === 'string' ? data : JSON.stringify(data, null, 2)
      }
    
    case 'text/html':
    case 'text/xml':
    case 'application/xml':
    case 'text/css':
    case 'text/javascript':
    case 'text/plain':
    default:
      return typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  }
}