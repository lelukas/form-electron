import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('api', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config: unknown) => ipcRenderer.invoke('save-config', config),
  getFiliados: () => ipcRenderer.invoke('get-filiados'),
  saveFiliados: (filiados: unknown) => ipcRenderer.invoke('save-filiados', filiados),
  importComprovante: () => ipcRenderer.invoke('import-comprovante'),
  openForm: (url: string) => ipcRenderer.invoke('open-form', url),
  captureFormDom: () => ipcRenderer.invoke('capture-form-dom'),
  startAutomation: (config: unknown, filiados: unknown) =>
    ipcRenderer.invoke('start-automation', config, filiados),
  cancelAutomation: () => ipcRenderer.invoke('cancel-automation'),
  onFormProgress: (callback: (update: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, update: unknown) => callback(update)
    ipcRenderer.on('form-progress', handler)
    return () => {
      ipcRenderer.removeListener('form-progress', handler)
    }
  },
})
