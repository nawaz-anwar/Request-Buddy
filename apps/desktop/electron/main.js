const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const axios = require('axios')
const GeminiService = require('./services/geminiService')
const isDev = process.env.NODE_ENV === 'development'

let mainWindow
let geminiService

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false,
    backgroundColor: '#111827'
  })

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../../web/dist/index.html')}`
  
  mainWindow.loadURL(startUrl)

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Initialize services
function initializeServices() {
  geminiService = new GeminiService()
}

// App event listeners
app.whenReady().then(() => {
  createWindow()
  initializeServices()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Create application menu
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Request',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          mainWindow.webContents.send('menu-new-request')
        }
      },
      {
        label: 'New Collection',
        accelerator: 'CmdOrCtrl+Shift+N',
        click: () => {
          mainWindow.webContents.send('menu-new-collection')
        }
      },
      { type: 'separator' },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        click: () => {
          mainWindow.webContents.send('menu-save')
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' }
    ]
  }
]

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  })
}

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

// HTTP request handler
ipcMain.handle('http-request', async (event, config) => {
  console.log('Electron: Received HTTP request:', config.method, config.url)
  
  try {
    const startTime = Date.now()
    
    // Build URL with query parameters
    let finalUrl = config.url
    if (config.params && Object.keys(config.params).length > 0) {
      const url = new URL(config.url)
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, value)
        }
      })
      finalUrl = url.toString()
    }
    
    // Configure axios request
    const axiosConfig = {
      method: config.method.toLowerCase(),
      url: finalUrl,
      headers: { ...config.headers } || {},
      timeout: config.timeout || 30000,
      validateStatus: () => true // Don't throw on HTTP error status
    }

    // Add auth headers (these might already be in headers, but handle them explicitly)
    if (config.auth?.type === 'bearer' && config.auth.bearerToken) {
      axiosConfig.headers.Authorization = `Bearer ${config.auth.bearerToken}`
    } else if (config.auth?.type === 'basic' && config.auth.basic?.username) {
      const credentials = Buffer.from(`${config.auth.basic.username}:${config.auth.basic.password || ''}`).toString('base64')
      axiosConfig.headers.Authorization = `Basic ${credentials}`
    }

    // Add body for non-GET requests
    if (config.method !== 'GET' && config.method !== 'HEAD' && config.body?.type !== 'none') {
      if (config.body.type === 'json' && config.body.content) {
        axiosConfig.headers['Content-Type'] = 'application/json'
        axiosConfig.data = config.body.content
      } else if (config.body.type === 'raw' && config.body.content) {
        axiosConfig.data = config.body.content
        // Don't override Content-Type if already set
        if (!axiosConfig.headers['Content-Type']) {
          axiosConfig.headers['Content-Type'] = 'text/plain'
        }
      } else if (config.body.type === 'form-data' && config.body.data) {
        // For form-data, we need to handle it differently
        // Note: Electron/Node.js FormData handling is different from browser
        const FormData = require('form-data')
        const form = new FormData()
        
        Object.entries(config.body.data).forEach(([key, value]) => {
          if (value.enabled !== false) {
            if (value.type === 'file' && value.file) {
              // Handle file uploads (would need file path in Electron)
              form.append(key, value.file)
            } else {
              form.append(key, value.value || '')
            }
          }
        })
        
        axiosConfig.data = form
        axiosConfig.headers = {
          ...axiosConfig.headers,
          ...form.getHeaders()
        }
      }
    }

    console.log('Electron: Sending request with config:', {
      method: axiosConfig.method,
      url: axiosConfig.url,
      headers: Object.keys(axiosConfig.headers),
      hasData: !!axiosConfig.data
    })

    const response = await axios(axiosConfig)
    const endTime = Date.now()

    const result = {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      time: endTime - startTime,
      size: JSON.stringify(response.data)?.length || 0
    }

    console.log('Electron: Request completed:', result.status, result.time + 'ms')
    return result

  } catch (error) {
    const endTime = Date.now()
    console.error('Electron: Request failed:', error.message)
    
    return {
      status: error.response?.status || 0,
      statusText: error.response?.statusText || error.message,
      headers: error.response?.headers || {},
      data: error.response?.data || { error: error.message },
      time: endTime - startTime,
      size: 0,
      error: true
    }
  }
})

// AI Service IPC Handlers
ipcMain.handle('ai-generate-documentation', async (event, requestData, responseData, userId) => {
  try {
    if (!geminiService || !geminiService.isInitialized()) {
      throw new Error('AI service not available')
    }
    
    geminiService.logUsage(userId, 'generate-documentation')
    const result = await geminiService.generateDocumentation(requestData, responseData)
    return { success: true, data: result }
  } catch (error) {
    console.error('AI Documentation Error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('ai-explain-response', async (event, responseData, userId) => {
  try {
    if (!geminiService || !geminiService.isInitialized()) {
      throw new Error('AI service not available')
    }
    
    geminiService.logUsage(userId, 'explain-response')
    const result = await geminiService.explainResponse(responseData)
    return { success: true, data: result }
  } catch (error) {
    console.error('AI Explain Error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('ai-generate-test-cases', async (event, requestData, responseData, userId) => {
  try {
    if (!geminiService || !geminiService.isInitialized()) {
      throw new Error('AI service not available')
    }
    
    geminiService.logUsage(userId, 'generate-test-cases')
    const result = await geminiService.generateTestCases(requestData, responseData)
    return { success: true, data: result }
  } catch (error) {
    console.error('AI Test Cases Error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('ai-generate-code-snippets', async (event, requestData, userId) => {
  try {
    if (!geminiService || !geminiService.isInitialized()) {
      throw new Error('AI service not available')
    }
    
    geminiService.logUsage(userId, 'generate-code-snippets')
    const result = await geminiService.generateCodeSnippets(requestData)
    return { success: true, data: result }
  } catch (error) {
    console.error('AI Code Snippets Error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('ai-ask-question', async (event, requestData, responseData, userQuestion, userId) => {
  try {
    if (!geminiService || !geminiService.isInitialized()) {
      throw new Error('AI service not available')
    }
    
    geminiService.logUsage(userId, 'ask-question')
    const result = await geminiService.askQuestion(requestData, responseData, userQuestion)
    return { success: true, data: result }
  } catch (error) {
    console.error('AI Question Error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('ai-check-availability', async (event) => {
  return {
    available: geminiService && geminiService.isInitialized(),
    service: 'Gemini AI'
  }
})