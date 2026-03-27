/**
 * Local Storage Cache Utility
 * Reduces Firebase reads by caching collections, folders, and requests
 */

const CACHE_VERSION = '1.0'
const MAX_CACHE_SIZE = 5 * 1024 * 1024 // 5MB in bytes

/**
 * Generate cache key for workspace data
 */
const getCacheKey = (workspaceId, dataType) => {
  return `rb_${dataType}_${workspaceId}_v${CACHE_VERSION}`
}

/**
 * Get cache size in bytes
 */
const getCacheSize = () => {
  let total = 0
  for (let key in localStorage) {
    if (key.startsWith('rb_')) {
      total += localStorage[key].length + key.length
    }
  }
  return total
}

/**
 * Check if cache is within size limit
 */
const isCacheSizeValid = () => {
  return getCacheSize() < MAX_CACHE_SIZE
}

/**
 * Save data to cache
 */
export const saveToCache = (workspaceId, dataType, data) => {
  try {
    const key = getCacheKey(workspaceId, dataType)
    const cacheData = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION
    }
    
    const serialized = JSON.stringify(cacheData)
    
    // Check if adding this would exceed size limit
    const estimatedSize = getCacheSize() + serialized.length
    if (estimatedSize > MAX_CACHE_SIZE) {
      console.warn('⚠️ Cache size limit exceeded, skipping cache save')
      return false
    }
    
    localStorage.setItem(key, serialized)
    console.log(`💾 Cached ${dataType} for workspace ${workspaceId} (${data.length} items)`)
    return true
  } catch (error) {
    console.error('Failed to save to cache:', error)
    // If quota exceeded, clear old caches
    if (error.name === 'QuotaExceededError') {
      clearOldCaches()
    }
    return false
  }
}

/**
 * Load data from cache
 */
export const loadFromCache = (workspaceId, dataType) => {
  try {
    const key = getCacheKey(workspaceId, dataType)
    const cached = localStorage.getItem(key)
    
    if (!cached) {
      console.log(`📭 No cache found for ${dataType}`)
      return null
    }
    
    const cacheData = JSON.parse(cached)
    
    // Validate cache version
    if (cacheData.version !== CACHE_VERSION) {
      console.log(`🔄 Cache version mismatch for ${dataType}, invalidating`)
      localStorage.removeItem(key)
      return null
    }
    
    console.log(`📦 Loaded ${dataType} from cache (${cacheData.data.length} items)`)
    return cacheData.data
  } catch (error) {
    console.error('Failed to load from cache:', error)
    return null
  }
}

/**
 * Clear cache for specific workspace and data type
 */
export const clearCache = (workspaceId, dataType) => {
  try {
    const key = getCacheKey(workspaceId, dataType)
    localStorage.removeItem(key)
    console.log(`🗑️ Cleared cache for ${dataType}`)
  } catch (error) {
    console.error('Failed to clear cache:', error)
  }
}

/**
 * Clear all caches for a workspace
 */
export const clearWorkspaceCache = (workspaceId) => {
  try {
    const types = ['collections', 'folders', 'requests']
    types.forEach(type => clearCache(workspaceId, type))
    console.log(`🗑️ Cleared all caches for workspace ${workspaceId}`)
  } catch (error) {
    console.error('Failed to clear workspace cache:', error)
  }
}

/**
 * Clear all Request Buddy caches
 */
export const clearAllCaches = () => {
  try {
    const keysToRemove = []
    for (let key in localStorage) {
      if (key.startsWith('rb_')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
    console.log(`🗑️ Cleared all Request Buddy caches (${keysToRemove.length} items)`)
  } catch (error) {
    console.error('Failed to clear all caches:', error)
  }
}

/**
 * Clear old caches (older than 7 days)
 */
const clearOldCaches = () => {
  try {
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    const now = Date.now()
    
    for (let key in localStorage) {
      if (key.startsWith('rb_')) {
        try {
          const cached = JSON.parse(localStorage[key])
          if (cached.timestamp && (now - cached.timestamp) > maxAge) {
            localStorage.removeItem(key)
            console.log(`🗑️ Removed old cache: ${key}`)
          }
        } catch (e) {
          // Invalid cache entry, remove it
          localStorage.removeItem(key)
        }
      }
    }
  } catch (error) {
    console.error('Failed to clear old caches:', error)
  }
}

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  const stats = {
    totalSize: 0,
    itemCount: 0,
    items: []
  }
  
  for (let key in localStorage) {
    if (key.startsWith('rb_')) {
      const size = localStorage[key].length + key.length
      stats.totalSize += size
      stats.itemCount++
      
      try {
        const cached = JSON.parse(localStorage[key])
        stats.items.push({
          key,
          size,
          itemCount: cached.data?.length || 0,
          timestamp: cached.timestamp,
          age: Date.now() - cached.timestamp
        })
      } catch (e) {
        stats.items.push({
          key,
          size,
          error: 'Invalid cache entry'
        })
      }
    }
  }
  
  return stats
}
