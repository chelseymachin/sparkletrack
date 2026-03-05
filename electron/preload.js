import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  getBackendPort: () => ipcRenderer.invoke('get-backend-port'),
})