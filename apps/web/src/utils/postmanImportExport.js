import { v4 as uuidv4 } from 'uuid'
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '../services/firebase'
import toast from 'react-hot-toast'

// Postman Collection v2.1 Schema URL
const POSTMAN_SCHEMA_V21 = 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'

/**
 * Validate Postman Collection v2.1 format
 */
export const validatePostmanCollection = (data) => {
  console.log('🔍 Validating Postman collection:', data?.info?.name)
  const errors = []
  
  if (!data || typeof data !== 'object') {
    errors.push('Invalid JSON format')
    return { isValid: false, errors }
  }
  
  // Check required fields
  if (!data.info) {
    errors.push('Missing "info" field')
  } else {
    if (!data.info.name || data.info.name.trim() === '') {
      errors.push('Missing collection name (info.name)')
    }
    if (!data.info.schema) {
      errors.push('Missing schema field')
    } else if (data.info.schema !== POSTMAN_SCHEMA_V21) {
      errors.push(`Invalid schema. Expected: ${POSTMAN_SCHEMA_V21}`)
    }
  }
  
  if (!data.item || !Array.isArray(data.item)) {
    errors.push('Missing or invalid "item" array')
  }
  
  console.log('🔍 Validation result:', { isValid: errors.length === 0, errors })
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Parse Postman URL object to string
 */
const parsePostmanUrl = (url) => {
  if (!url) return ''
  
  if (typeof url === 'string') {
    return url
  }
  
  if (url.raw) {
    return url.raw
  }
  
  // Build URL from parts
  let urlString = ''
  
  if (url.protocol) {
    urlString += url.protocol + '://'
  }
  
  if (url.host) {
    if (Array.isArray(url.host)) {
      urlString += url.host.join('.')
    } else {
      urlString += url.host
    }
  }
  
  if (url.port) {
    urlString += ':' + url.port
  }
  
  if (url.path) {
    if (Array.isArray(url.path)) {
      urlString += '/' + url.path.join('/')
    } else {
      urlString += '/' + url.path
    }
  }
  
  if (url.query && Array.isArray(url.query)) {
    const queryParams = url.query
      .filter(q => q.key)
      .map(q => `${encodeURIComponent(q.key)}=${encodeURIComponent(q.value || '')}`)
      .join('&')
    
    if (queryParams) {
      urlString += '?' + queryParams
    }
  }
  
  return urlString
}

/**
 * Parse Postman headers to our format
 */
const parsePostmanHeaders = (headers) => {
  if (!headers || !Array.isArray(headers)) return {}
  
  const headerObj = {}
  headers.forEach(header => {
    if (header.key && header.value !== undefined) {
      headerObj[header.key] = {
        value: header.value,
        enabled: header.disabled !== true
      }
    }
  })
  
  return headerObj
}

/**
 * Parse Postman body to our format
 */
const parsePostmanBody = (body) => {
  if (!body) return { type: 'none', content: '' }
  
  if (body.mode === 'raw') {
    return {
      type: 'json',
      content: body.raw || ''
    }
  }
  
  if (body.mode === 'formdata') {
    const formData = {}
    if (body.formdata && Array.isArray(body.formdata)) {
      body.formdata.forEach(item => {
        if (item.key) {
          formData[item.key] = {
            value: item.value || '',
            type: item.type || 'text',
            enabled: item.disabled !== true
          }
        }
      })
    }
    return {
      type: 'form-data',
      data: formData
    }
  }
  
  if (body.mode === 'urlencoded') {
    const formData = {}
    if (body.urlencoded && Array.isArray(body.urlencoded)) {
      body.urlencoded.forEach(item => {
        if (item.key) {
          formData[item.key] = {
            value: item.value || '',
            enabled: item.disabled !== true
          }
        }
      })
    }
    return {
      type: 'x-www-form-urlencoded',
      data: formData
    }
  }
  
  return { type: 'none', content: '' }
}

/**
 * Parse Postman auth to our format
 */
const parsePostmanAuth = (auth) => {
  if (!auth || !auth.type) return { type: 'none' }
  
  if (auth.type === 'bearer') {
    const token = auth.bearer?.find(item => item.key === 'token')?.value || ''
    return {
      type: 'bearer',
      bearerToken: token
    }
  }
  
  if (auth.type === 'basic') {
    const username = auth.basic?.find(item => item.key === 'username')?.value || ''
    const password = auth.basic?.find(item => item.key === 'password')?.value || ''
    return {
      type: 'basic',
      basic: { username, password }
    }
  }
  
  return { type: 'none' }
}

/**
 * Import Postman Collection v2.1 with atomic batch writes
 */
export const importPostmanCollection = async (jsonData, workspaceId) => {
  console.log('📦 Import started for workspace:', workspaceId)
  
  if (!workspaceId) {
    throw new Error('Workspace ID is required')
  }
  
  // Validate the collection
  const validation = validatePostmanCollection(jsonData)
  if (!validation.isValid) {
    const errorMsg = `Invalid Postman collection: ${validation.errors.join(', ')}`
    console.error('❌ Validation failed:', errorMsg)
    throw new Error(errorMsg)
  }
  
  // Start batch write
  const batch = writeBatch(db)
  const collectionId = uuidv4()
  const createdFolders = new Map() // Track created folders
  const createdRequests = []
  
  try {
    console.log('📂 Creating collection:', jsonData.info.name)
    
    // Create the collection document
    const collectionRef = doc(db, 'collections', collectionId)
    const collectionData = {
      name: jsonData.info.name.trim(),
      description: jsonData.info.description || '',
      workspaceId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    batch.set(collectionRef, collectionData)
    
    // Recursive function to process items
    const processItems = (items, parentFolderId = null) => {
      if (!items || !Array.isArray(items)) {
        console.warn('⚠️ Invalid items array:', items)
        return
      }
      
      items.forEach(item => {
        if (!item || !item.name || item.name.trim() === '') {
          console.warn('⚠️ Skipping item without name:', item)
          return
        }
        
        const itemName = item.name.trim()
        
        // Check if this is a folder (has nested items) or a request
        const hasNestedItems = item.item && Array.isArray(item.item) && item.item.length > 0
        const hasRequest = item.request && typeof item.request === 'object'
        
        // If item has nested items, it's a folder
        if (hasNestedItems) {
          const folderId = uuidv4()
          const folderRef = doc(db, 'folders', folderId)
          const folderData = {
            name: itemName,
            collectionId,
            workspaceId,
            parentFolderId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }
          
          batch.set(folderRef, folderData)
          createdFolders.set(folderId, itemName)
          console.log('📁 Queued folder:', itemName, `(${item.item.length} items)`)
          
          // Process child items recursively
          processItems(item.item, folderId)
        }
        // If item has a request, create a request document
        else if (hasRequest) {
          const url = parsePostmanUrl(item.request.url) || '' // Allow empty URLs
          
          const requestId = uuidv4()
          const requestRef = doc(db, 'requests', requestId)
          const requestData = {
            name: itemName,
            method: (item.request.method || 'GET').toUpperCase(),
            url: url,
            headers: parsePostmanHeaders(item.request.header),
            params: {}, // Will be extracted from URL if needed
            body: parsePostmanBody(item.request.body),
            auth: parsePostmanAuth(item.request.auth),
            collectionId,
            workspaceId,
            folderId: parentFolderId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }
          
          batch.set(requestRef, requestData)
          createdRequests.push({ id: requestId, name: itemName })
          console.log('📄 Queued request:', itemName, '- Method:', requestData.method, '- URL:', url || '(empty)')
        }
        else {
          console.warn('⚠️ Skipping item - no request or nested items:', itemName)
        }
      })
    }
    
    // Process all items
    if (jsonData.item && Array.isArray(jsonData.item)) {
      processItems(jsonData.item)
    }
    
    console.log('💾 Committing batch write...')
    console.log(`📊 Summary: 1 collection, ${createdFolders.size} folders, ${createdRequests.length} requests`)
    
    // Commit the batch
    await batch.commit()
    
    console.log('✅ Import committed successfully')
    
    return {
      success: true,
      collectionId,
      collectionName: jsonData.info.name.trim(),
      stats: {
        collections: 1,
        folders: createdFolders.size,
        requests: createdRequests.length
      }
    }
  } catch (error) {
    console.error('❌ Import failed:', error)
    throw new Error(`Import failed: ${error.message}`)
  }
}

/**
 * Convert our request format to Postman format
 */
const convertRequestToPostman = (request) => {
  const postmanRequest = {
    name: request.name,
    request: {
      method: request.method || 'GET',
      url: request.url || '',
      header: [],
      body: undefined,
      auth: undefined
    },
    response: []
  }
  
  // Convert headers
  if (request.headers && typeof request.headers === 'object') {
    Object.entries(request.headers).forEach(([key, value]) => {
      if (typeof value === 'object' && value.value !== undefined) {
        postmanRequest.request.header.push({
          key,
          value: value.value,
          disabled: value.enabled === false
        })
      } else if (typeof value === 'string') {
        postmanRequest.request.header.push({
          key,
          value
        })
      }
    })
  }
  
  // Convert body
  if (request.body && request.body.type !== 'none') {
    if (request.body.type === 'json' || request.body.type === 'raw') {
      postmanRequest.request.body = {
        mode: 'raw',
        raw: request.body.content || '',
        options: {
          raw: {
            language: 'json'
          }
        }
      }
    } else if (request.body.type === 'form-data') {
      const formdata = []
      if (request.body.data) {
        Object.entries(request.body.data).forEach(([key, value]) => {
          formdata.push({
            key,
            value: value.value || '',
            type: value.type || 'text',
            disabled: value.enabled === false
          })
        })
      }
      postmanRequest.request.body = {
        mode: 'formdata',
        formdata
      }
    } else if (request.body.type === 'x-www-form-urlencoded') {
      const urlencoded = []
      if (request.body.data) {
        Object.entries(request.body.data).forEach(([key, value]) => {
          urlencoded.push({
            key,
            value: value.value || '',
            disabled: value.enabled === false
          })
        })
      }
      postmanRequest.request.body = {
        mode: 'urlencoded',
        urlencoded
      }
    }
  }
  
  // Convert auth
  if (request.auth && request.auth.type !== 'none') {
    if (request.auth.type === 'bearer') {
      postmanRequest.request.auth = {
        type: 'bearer',
        bearer: [
          {
            key: 'token',
            value: request.auth.bearerToken || '',
            type: 'string'
          }
        ]
      }
    } else if (request.auth.type === 'basic') {
      postmanRequest.request.auth = {
        type: 'basic',
        basic: [
          {
            key: 'username',
            value: request.auth.basic?.username || '',
            type: 'string'
          },
          {
            key: 'password',
            value: request.auth.basic?.password || '',
            type: 'string'
          }
        ]
      }
    }
  }
  
  return postmanRequest
}

/**
 * Build folder structure for export
 */
const buildFolderStructure = (folders, requests, parentFolderId = null) => {
  const items = []
  
  // Get folders at this level
  const currentFolders = folders.filter(folder => 
    (parentFolderId === null && !folder.parentFolderId) || 
    folder.parentFolderId === parentFolderId
  )
  
  // Get requests at this level
  const currentRequests = requests.filter(request => 
    (parentFolderId === null && !request.folderId) || 
    request.folderId === parentFolderId
  )
  
  // Add requests first
  currentRequests.forEach(request => {
    items.push(convertRequestToPostman(request))
  })
  
  // Add folders with their contents
  currentFolders.forEach(folder => {
    const folderItem = {
      name: folder.name,
      item: buildFolderStructure(folders, requests, folder.id)
    }
    items.push(folderItem)
  })
  
  return items
}

/**
 * Export collection as Postman Collection v2.1
 */
export const exportPostmanCollection = async (collectionId, workspaceId) => {
  console.log('📤 Export started for collection:', collectionId)
  
  try {
    // Fetch collection
    const collectionsQuery = query(
      collection(db, 'collections'),
      where('workspaceId', '==', workspaceId)
    )
    const collectionsSnapshot = await getDocs(collectionsQuery)
    const targetCollection = collectionsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .find(col => col.id === collectionId)
    
    if (!targetCollection) {
      throw new Error('Collection not found')
    }
    
    console.log('📂 Found collection:', targetCollection.name)
    
    // Fetch folders
    const foldersQuery = query(
      collection(db, 'folders'),
      where('collectionId', '==', collectionId)
    )
    const foldersSnapshot = await getDocs(foldersQuery)
    const folders = foldersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    console.log('📁 Found folders:', folders.length)
    
    // Fetch requests
    const requestsQuery = query(
      collection(db, 'requests'),
      where('collectionId', '==', collectionId)
    )
    const requestsSnapshot = await getDocs(requestsQuery)
    const requests = requestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    console.log('📄 Found requests:', requests.length)
    
    // Build Postman collection structure
    const postmanCollection = {
      info: {
        _postman_id: uuidv4(),
        name: targetCollection.name,
        description: targetCollection.description || '',
        schema: POSTMAN_SCHEMA_V21
      },
      item: buildFolderStructure(folders, requests)
    }
    
    const filename = `${targetCollection.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.postman_collection.json`
    
    console.log('✅ Export completed successfully')
    return {
      success: true,
      collection: postmanCollection,
      filename
    }
  } catch (error) {
    console.error('❌ Export failed:', error)
    throw new Error(`Export failed: ${error.message}`)
  }
}

/**
 * Download JSON file
 */
export const downloadJsonFile = (data, filename) => {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}