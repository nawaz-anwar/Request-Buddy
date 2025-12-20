/**
 * Replace variables in text with values from environment
 * @param {string} text - Text containing variables like {{variable}}
 * @param {Object} variables - Object with variable key-value pairs
 * @returns {string} Text with variables replaced
 */
export function replaceVariables(text, variables = {}) {
  if (!text || typeof text !== 'string') return text
  
  let result = text
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    result = result.replace(regex, value)
  })
  
  return result
}

/**
 * Find all variables in text
 * @param {string} text - Text to search for variables
 * @returns {string[]} Array of variable names found
 */
export function findVariables(text) {
  if (!text || typeof text !== 'string') return []
  
  const variableRegex = /\{\{([^}]+)\}\}/g
  const matches = [...text.matchAll(variableRegex)]
  return matches.map(match => match[1].trim())
}

/**
 * Check if text contains variables
 * @param {string} text - Text to check
 * @returns {boolean} True if text contains variables
 */
export function hasVariables(text) {
  return findVariables(text).length > 0
}

/**
 * Get missing variables from text based on available variables
 * @param {string} text - Text to check
 * @param {Object} availableVariables - Available variables object
 * @returns {string[]} Array of missing variable names
 */
export function getMissingVariables(text, availableVariables = {}) {
  const foundVariables = findVariables(text)
  const availableKeys = Object.keys(availableVariables)
  return foundVariables.filter(variable => !availableKeys.includes(variable))
}

/**
 * Preview text with variable replacement
 * @param {string} text - Original text
 * @param {Object} variables - Variables to replace
 * @returns {Object} Object with original, replaced text, and metadata
 */
export function previewVariableReplacement(text, variables = {}) {
  const foundVariables = findVariables(text)
  const replacedText = replaceVariables(text, variables)
  const missingVariables = getMissingVariables(text, variables)
  
  return {
    original: text,
    replaced: replacedText,
    foundVariables,
    missingVariables,
    hasVariables: foundVariables.length > 0,
    hasMissingVariables: missingVariables.length > 0
  }
}