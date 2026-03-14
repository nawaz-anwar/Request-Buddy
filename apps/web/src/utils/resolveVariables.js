/**
 * Environment Variable Resolution Utility
 * Single source of truth for {{variable}} replacement
 */

/**
 * Find all variables in a string
 * @param {string} text - Text to search for variables
 * @returns {Array<string>} Array of variable names found
 */
export function findVariables(text) {
  if (!text || typeof text !== 'string') return []
  
  const regex = /\{\{([^}]+)\}\}/g
  const matches = []
  let match
  
  while ((match = regex.exec(text)) !== null) {
    const varName = match[1].trim()
    if (varName && !matches.includes(varName)) {
      matches.push(varName)
    }
  }
  
  return matches
}

/**
 * Check if text contains any unresolved variables
 * @param {string} text - Text to check
 * @returns {boolean} True if contains {{...}}
 */
export function hasUnresolvedVariables(text) {
  if (!text || typeof text !== 'string') return false
  return /\{\{[^}]+\}\}/.test(text)
}

/**
 * Get missing variables (variables that exist in text but not in environment)
 * @param {string} text - Text containing variables
 * @param {Object} variables - Environment variables object
 * @returns {Array<string>} Array of missing variable names
 */
export function getMissingVariables(text, variables = {}) {
  const foundVars = findVariables(text)
  return foundVars.filter(varName => !(varName in variables))
}

/**
 * Resolve environment variables in text
 * @param {string} text - Text containing {{variable}} placeholders
 * @param {Object} variables - Environment variables object { key: value }
 * @param {Object} options - Options { throwOnMissing: boolean, strict: boolean }
 * @returns {string} Text with variables replaced
 * @throws {Error} If throwOnMissing is true and variables are missing
 */
export function resolveVariables(text, variables = {}, options = {}) {
  const { throwOnMissing = false, strict = false } = options
  
  if (!text || typeof text !== 'string') return text
  
  // Find all variables in the text
  const foundVars = findVariables(text)
  
  // Check for missing variables
  const missingVars = foundVars.filter(varName => !(varName in variables))
  
  if (missingVars.length > 0 && throwOnMissing) {
    throw new Error(`Unresolved environment variable${missingVars.length > 1 ? 's' : ''}: ${missingVars.join(', ')}`)
  }
  
  // Replace all variables
  let result = text
  foundVars.forEach(varName => {
    const value = variables[varName]
    if (value !== undefined && value !== null) {
      // Replace all occurrences of this variable
      const regex = new RegExp(`\\{\\{\\s*${varName}\\s*\\}\\}`, 'g')
      result = result.replace(regex, String(value).trim())
    }
  })
  
  // In strict mode, throw if any variables remain unresolved
  if (strict && hasUnresolvedVariables(result)) {
    const remaining = findVariables(result)
    throw new Error(`Unresolved environment variable${remaining.length > 1 ? 's' : ''}: ${remaining.join(', ')}`)
  }
  
  return result
}

/**
 * Resolve variables in an object (recursively)
 * @param {Object} obj - Object containing values with variables
 * @param {Object} variables - Environment variables
 * @param {Object} options - Resolution options
 * @returns {Object} Object with variables resolved
 */
export function resolveObjectVariables(obj, variables = {}, options = {}) {
  if (!obj || typeof obj !== 'object') return obj
  
  const result = Array.isArray(obj) ? [] : {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = resolveVariables(value, variables, options)
    } else if (typeof value === 'object' && value !== null) {
      result[key] = resolveObjectVariables(value, variables, options)
    } else {
      result[key] = value
    }
  }
  
  return result
}

/**
 * Validate that a URL is absolute and properly formatted
 * @param {string} url - URL to validate
 * @returns {Object} { isValid: boolean, error: string }
 */
export function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required' }
  }
  
  // Check for unresolved variables
  if (hasUnresolvedVariables(url)) {
    const unresolvedVars = findVariables(url)
    return { 
      isValid: false, 
      error: `URL contains unresolved environment variable${unresolvedVars.length > 1 ? 's' : ''}: ${unresolvedVars.join(', ')}` 
    }
  }
  
  // Check if URL is absolute
  if (!url.match(/^https?:\/\//i)) {
    return { 
      isValid: false, 
      error: 'URL must be absolute (start with http:// or https://)' 
    }
  }
  
  // Try to parse URL
  try {
    new URL(url)
    return { isValid: true, error: null }
  } catch (error) {
    return { 
      isValid: false, 
      error: `Invalid URL format: ${error.message}` 
    }
  }
}

/**
 * Preview variable replacement (for UI display)
 * @param {string} text - Text with variables
 * @param {Object} variables - Environment variables
 * @returns {Object} { original, resolved, variables: [...], missing: [...] }
 */
export function previewVariableReplacement(text, variables = {}) {
  const foundVariables = findVariables(text)
  const resolvedText = resolveVariables(text, variables)
  const missingVariables = getMissingVariables(text, variables)
  
  return {
    original: text,
    resolved: resolvedText,
    variables: foundVariables.map(varName => ({
      name: varName,
      value: variables[varName],
      found: varName in variables
    })),
    missing: missingVariables,
    hasUnresolved: hasUnresolvedVariables(resolvedText)
  }
}

/**
 * Resolve all variables in a request object
 * @param {Object} request - Request object with url, headers, params, body, auth
 * @param {Object} variables - Environment variables
 * @param {Object} options - Resolution options
 * @returns {Object} Request with all variables resolved
 */
export function resolveRequestVariables(request, variables = {}, options = {}) {
  if (!request) return request
  
  const resolved = { ...request }
  
  // Resolve URL
  if (resolved.url) {
    resolved.url = resolveVariables(resolved.url, variables, options)
  }
  
  // Resolve headers
  if (resolved.headers) {
    const resolvedHeaders = {}
    Object.entries(resolved.headers).forEach(([key, value]) => {
      const resolvedKey = resolveVariables(key, variables, options)
      if (typeof value === 'object' && value.value !== undefined) {
        resolvedHeaders[resolvedKey] = {
          ...value,
          value: resolveVariables(value.value, variables, options)
        }
      } else if (typeof value === 'string') {
        resolvedHeaders[resolvedKey] = resolveVariables(value, variables, options)
      } else {
        resolvedHeaders[resolvedKey] = value
      }
    })
    resolved.headers = resolvedHeaders
  }
  
  // Resolve params
  if (resolved.params) {
    const resolvedParams = {}
    Object.entries(resolved.params).forEach(([key, value]) => {
      const resolvedKey = resolveVariables(key, variables, options)
      if (typeof value === 'object' && value.value !== undefined) {
        resolvedParams[resolvedKey] = {
          ...value,
          value: resolveVariables(value.value, variables, options)
        }
      } else if (typeof value === 'string') {
        resolvedParams[resolvedKey] = resolveVariables(value, variables, options)
      } else {
        resolvedParams[resolvedKey] = value
      }
    })
    resolved.params = resolvedParams
  }
  
  // Resolve body
  if (resolved.body) {
    if (resolved.body.content) {
      resolved.body = {
        ...resolved.body,
        content: resolveVariables(resolved.body.content, variables, options)
      }
    }
    if (resolved.body.data) {
      resolved.body = {
        ...resolved.body,
        data: resolveObjectVariables(resolved.body.data, variables, options)
      }
    }
  }
  
  // Resolve auth
  if (resolved.auth) {
    if (resolved.auth.bearerToken) {
      resolved.auth = {
        ...resolved.auth,
        bearerToken: resolveVariables(resolved.auth.bearerToken, variables, options)
      }
    }
    if (resolved.auth.basic) {
      resolved.auth = {
        ...resolved.auth,
        basic: {
          username: resolveVariables(resolved.auth.basic.username || '', variables, options),
          password: resolveVariables(resolved.auth.basic.password || '', variables, options)
        }
      }
    }
  }
  
  return resolved
}
