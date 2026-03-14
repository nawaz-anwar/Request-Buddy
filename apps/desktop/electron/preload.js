const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // HTTP requests
  httpRequest: (config) => ipcRenderer.invoke('http-request', config),
  
  // AI services
  aiGenerateDocumentation: (requestData, responseData, userId) => 
    ipcRenderer.invoke('ai-generate-documentation', requestData, responseData, userId),
  aiExplainResponse: (responseData, userId) => 
    ipcRenderer.invoke('ai-explain-response', responseData, userId),
  aiGenerateTestCases: (requestData, responseData, userId) => 
    ipcRenderer.invoke('ai-generate-test-cases', requestData, responseData, userId),
  aiGenerateCodeSnippets: (requestData, userId) => 
    ipcRenderer.invoke('ai-generate-code-snippets', requestData, userId),
  aiAskQuestion: (requestData, responseData, userQuestion, userId) => 
    ipcRenderer.invoke('ai-ask-question', requestData, responseData, userQuestion, userId),
  aiCheckAvailability: () => 
    ipcRenderer.invoke('ai-check-availability'),
  
  // Menu event listeners
  onMenuNewRequest: (callback) => ipcRenderer.on('menu-new-request', callback),
  onMenuNewCollection: (callback) => ipcRenderer.on('menu-new-collection', callback),
  onMenuSave: (callback) => ipcRenderer.on('menu-save', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
})