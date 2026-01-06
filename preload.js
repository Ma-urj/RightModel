const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message) => ipcRenderer.invoke('send-message', message),
  saveApiKeys: (apiKeys) => ipcRenderer.invoke('save-api-keys', apiKeys),
  getAvailableProviders: () => ipcRenderer.invoke('get-available-providers'),
  onModelSelected: (callback) => ipcRenderer.on('model-selected', (event, data) => callback(data))
});
