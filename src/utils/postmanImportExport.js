import { v4 as uuidv4 } from 'uuid'
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '../services/firebase'

// Postman Collection v2.1 Schema URL
const POSTMAN_SCHEMA_V21 = 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'

/**
 * Validate Postman Collection v2.1 format
 */
export const validatePostmanCollection = (data) => {
  const errors = []
  
  if (!data || typeof data !== 'object') {
    errors.push('Invalid JSON format')
    return { isValid: false, errors }
  }
  
  // Check required fields
  if (!data.info) {
    errors.push('Missing "info" field')
  } else {
    if (!data.info.name) {
      errors.push('Missing collection name (info.name)')
    }
    if (!data.info.schema || data.info.schema !== POSTMAN_SCHEMA_V21) {
      errors.push('Invalid or missing schema. Must be Postman Collection v2.1')
    }
  }
  
  if (!data.item || !Array.isArray(data.item)) {
    errors.push('Missing or invalid "item" array')
  }
  
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
  if (!body) return null
  
  if (body.mode === 'raw') {
    return {
      type: 'raw',
      content: body.raw || '',
      contentType: body.options?.raw?.language || 'text'
    }
  }
  
  if (body.mode === 'formdata') {
    return {
      type: 'form-data',
      formData: body.formdata || []
    }
  }
  
  if (body.mode === 'urlencoded') {
    return {
      type: 'x-www-form-urlencoded',
      formData: body.urlencoded || []
    }
  }
  
  return null
}

/**
 * Parse Postman auth to our format
 */
const parsePostmanAuth = (auth) => {
  if (!auth || !auth.type) return null
  
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
  
  return null
}

/**
 * Recursively parse Postman items and create Firestore documents
 */
const parsePostmanItem = async (item, collectionId, workspaceId, parentFolderId = null) => {
  if (!item.name) {
    console.warn('Skipping item without name:', item)
    return
  }
  
  // If item has a request, create a request document
  if (item.request) {
    try {
      const requestData = {
        name: item.name,
        method: item.request.method || 'GET',
        url: parsePostmanUrl(item.request.url),
        headers: parsePostmanHeaders(item.request.header),
        params: {}, // Postman params are usually in URL, we'll extract them if needed
        body: parsePostmanBody(item.request.body),
        auth: parsePostmanAuth(item.request.auth),
        collectionId,
        workspaceId,
        folderId: parentFolderId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      // Skip requests without URL
      if (!requestData.url) {
        console.warn('Skipping request without URL:', item.name)
        return
      }
      
      await addDoc(collection(db, 'requests'), requestData)
      console.log('Created request:', item.name)
    } catch (error) {
      console.error('Failed to create request:', item.name, error)
    }
  }
  
  // If item has sub-items, create a folder and process children
  if (item.item && Array.isArray(item.item) && item.item.length > 0) {
    try {
      const folderData = {
        name: item.name,
        collectionId,
        workspaceId,
        parentFolderId,
        createdAt: serverTimestamp()
      }
      
      const folderDoc = await addDoc(collection(db, 'folders'), folderData)
      console.log('Created folder:', item.name)
      
      // Process all child items
      for (const childItem of item.item) {
        await parsePostmanItem(childItem, collectionId, workspaceId, folderDoc.id)
      }
    } catch (error) {
      console.error('Failed to create folder:', item.name, error)
    }
  }
}

/**
 * Import Postman Collection v2.1
 */
export const importPostmanCollection = async (jsonData, workspaceId) => {
  console.log('Starting Postman collection import...')
  
  // Validate the collection
  const validation = validatePostmanCollection(jsonData)
  if (!validation.isValid) {
    throw new Error(`Invalid Postman collection: ${validation.errors.join(', ')}`)
  }
  
  try {
    // Create the collection document
    const collectionData = {
      name: jsonData.info.name,
      description: jsonData.info.description || '',
      workspaceId,
      createdAt: serverTimestamp()
    }
    
    const collectionDoc = await addDoc(collection(db, 'collections'), collectionData)
    console.log('Created collection:', jsonData.info.name)
    
    // Process all items
    if (jsonData.item && Array.isArray(jsonData.item)) {
      for (const item of jsonData.item) {
        await parsePostmanItem(item, collectionDoc.id, workspaceId)
      }
    }
    
    console.log('Postman collection import completed successfully')
    return {
      success: true,
      collectionId: collectionDoc.id,
      collectionName: jsonData.info.name
    }
  } catch (error) {
    console.error('Failed to import Postman collection:', error)
    throw error
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
  if (request.body) {
    if (request.body.type === 'raw') {
      postmanRequest.request.body = {
        mode: 'raw',
        raw: request.body.content || '',
        options: {
          raw: {
            language: request.body.contentType || 'text'
          }
        }
      }
    } else if (request.body.type === 'form-data') {
      postmanRequest.request.body = {
        mode: 'formdata',
        formdata: request.body.formData || []
      }
    } else if (request.body.type === 'x-www-form-urlencoded') {
      postmanRequest.request.body = {
        mode: 'urlencoded',
        urlencoded: request.body.formData || []
      }
    }
  }
  
  // Convert auth
  if (request.auth) {
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
  console.log('Starting Postman collection export...')
  
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
    
    // Fetch folders
    const foldersQuery = query(
      collection(db, 'folders'),
      where('collectionId', '==', collectionId)
    )
    const foldersSnapshot = await getDocs(foldersQuery)
    const folders = foldersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    // Fetch requests
    const requestsQuery = query(
      collection(db, 'requests'),
      where('collectionId', '==', collectionId)
    )
    const requestsSnapshot = await getDocs(requestsQuery)
    const requests = requestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
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
    
    console.log('Postman collection export completed successfully')
    return {
      success: true,
      collection: postmanCollection,
      filename: `postman-${targetCollection.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.json`
    }
  } catch (error) {
    console.error('Failed to export Postman collection:', error)
    throw error
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