// Test utilities for import/export functionality
import { importPostmanCollection, exportPostmanCollection } from './postmanImportExport'

// Sample Postman collection for testing (matches the user's actual sample)
export const samplePostmanCollection = {
  "info": {
    "_postman_id": "0f44f71c-9a22-4193-9e95-baaab68c9f47",
    "name": "Personal APIs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "_exporter_id": "35025207",
    "_collection_link": "https://go.postman.co/collection/35025207-0f44f71c-9a22-4193-9e95-baaab68c9f47?source=collection_link"
  },
  "item": [
    {
      "name": "User Details",
      "request": {
        "method": "GET",
        "header": []
      },
      "response": []
    },
    {
      "name": "New Request",
      "request": {
        "method": "GET",
        "header": []
      },
      "response": []
    }
  ]
}

// Comprehensive test collection with folders, nested items, and full request data
export const comprehensiveTestCollection = {
  "info": {
    "name": "Comprehensive Test Collection",
    "description": "A complete test collection with folders and full request data",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Users",
      "request": {
        "method": "GET",
        "url": {
          "raw": "https://jsonplaceholder.typicode.com/users?page=1&limit=10",
          "protocol": "https",
          "host": ["jsonplaceholder", "typicode", "com"],
          "path": ["users"],
          "query": [
            { "key": "page", "value": "1" },
            { "key": "limit", "value": "10" }
          ]
        },
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Accept",
            "value": "application/json"
          }
        ]
      }
    },
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "https://api.example.com/auth/login",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"user@example.com\",\n  \"password\": \"password123\"\n}"
            }
          }
        },
        {
          "name": "Get Profile",
          "request": {
            "method": "GET",
            "url": "https://api.example.com/user/profile",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "{{auth_token}}",
                  "type": "string"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "Create Post",
      "request": {
        "method": "POST",
        "url": "https://jsonplaceholder.typicode.com/posts",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Test Post\",\n  \"body\": \"This is a test post\",\n  \"userId\": 1\n}"
        }
      }
    }
  ]
}

// Test import functionality
export const testImport = async (workspaceId) => {
  console.log('🧪 Testing import functionality...')
  
  if (!workspaceId) {
    console.error('❌ No workspace ID provided')
    return
  }
  
  try {
    const result = await importPostmanCollection(samplePostmanCollection, workspaceId)
    console.log('✅ Import test successful:', result)
    return result
  } catch (error) {
    console.error('❌ Import test failed:', error)
    throw error
  }
}

// Test export functionality
export const testExport = async (collectionId, workspaceId) => {
  console.log('🧪 Testing export functionality...')
  
  if (!collectionId || !workspaceId) {
    console.error('❌ Collection ID and workspace ID required')
    return
  }
  
  try {
    const result = await exportPostmanCollection(collectionId, workspaceId)
    console.log('✅ Export test successful:', result)
    return result
  } catch (error) {
    console.error('❌ Export test failed:', error)
    throw error
  }
}

// Download sample collection for manual testing
export const downloadSampleCollection = () => {
  const jsonString = JSON.stringify(samplePostmanCollection, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = 'sample-postman-collection.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  console.log('📥 Sample collection downloaded')
}

// Test complete import/export cycle
export const testImportExportCycle = async (workspaceId) => {
  console.log('🔄 Testing complete import/export cycle...')
  
  try {
    // Import
    const importResult = await testImport(workspaceId)
    console.log('✅ Import phase completed')
    
    // Wait a moment for Firestore to sync
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Export
    const exportResult = await testExport(importResult.collectionId, workspaceId)
    console.log('✅ Export phase completed')
    
    // Compare
    const originalName = samplePostmanCollection.info.name
    const exportedName = exportResult.collection.info.name
    
    if (originalName === exportedName) {
      console.log('✅ Import/Export cycle successful - names match')
    } else {
      console.warn('⚠️ Name mismatch:', { original: originalName, exported: exportedName })
    }
    
    return {
      import: importResult,
      export: exportResult,
      success: true
    }
  } catch (error) {
    console.error('❌ Import/Export cycle failed:', error)
    throw error
  }
}

// Add to window for easy testing
if (typeof window !== 'undefined') {
  window.testImport = testImport
  window.testExport = testExport
  window.testImportExportCycle = testImportExportCycle
  window.downloadSampleCollection = downloadSampleCollection
  window.samplePostmanCollection = samplePostmanCollection
  window.comprehensiveTestCollection = comprehensiveTestCollection
  
  console.log('🧪 Import/Export test utilities loaded')
  console.log('Available test functions:')
  console.log('- window.testImport(workspaceId) - Test import with simple collection')
  console.log('- window.testExport(collectionId, workspaceId) - Test export')
  console.log('- window.testImportExportCycle(workspaceId) - Test full cycle')
  console.log('- window.downloadSampleCollection() - Download test file')
  console.log('- window.samplePostmanCollection - Simple test collection')
  console.log('- window.comprehensiveTestCollection - Full test collection with folders')
}