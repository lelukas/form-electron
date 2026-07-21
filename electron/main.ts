import { app, BrowserWindow, ipcMain, dialog, session } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { existsSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { getConfig, saveConfig, getFiliados, saveFiliados, getUploadsDir } from './store'
import { runAutomation } from './form-automation'
import type { Config, Filiado } from '../src/lib/types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let mainWin: BrowserWindow | null = null
let formWin: BrowserWindow | null = null
const cancelFlag = { current: false }

function createMainWindow() {
  mainWin = new BrowserWindow({
    width: 800,
    height: 700,
    title: 'Form Electron',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    mainWin.loadURL(VITE_DEV_SERVER_URL)
  } else {
    mainWin.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

function createFormWindow(url: string) {
  const formSession = session.fromPartition('persist:form-session')

  formWin = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Google Forms',
    webPreferences: {
      session: formSession,
      contextIsolation: false,
      nodeIntegration: false,
    },
  })

  formWin.loadURL(url)


  formWin.on('closed', () => {
    formWin = null
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    mainWin = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

function setupIPC() {
  ipcMain.handle('get-config', () => {
    return getConfig()
  })

  ipcMain.handle('save-config', (_event, config: Config) => {
    saveConfig(config)
  })

  ipcMain.handle('get-filiados', () => {
    return getFiliados()
  })

  ipcMain.handle('save-filiados', (_event, filiados: Filiado[]) => {
    saveFiliados(filiados)
  })

  ipcMain.handle('import-comprovante', async () => {
    const result = await dialog.showOpenDialog(mainWin!, {
      properties: ['openFile'],
      filters: [
        { name: 'Comprovantes', extensions: ['pdf', 'png', 'jpg', 'jpeg', 'webp'] },
      ],
    })
    if (result.canceled) return null

    const srcPath = result.filePaths[0]
    const fileName = path.basename(srcPath)
    const destDir = getUploadsDir()
    const destPath = path.join(destDir, fileName)

    let finalPath = destPath
    let counter = 1
    while (existsSync(finalPath)) {
      const ext = path.extname(fileName)
      const base = path.basename(fileName, ext)
      finalPath = path.join(destDir, `${base}_${counter}${ext}`)
      counter++
    }

    copyFileSync(srcPath, finalPath)
    return path.basename(finalPath)
  })

  ipcMain.handle('open-form', (_event, url: string) => {
    if (!url) return
    if (formWin && !formWin.isDestroyed()) {
      formWin.focus()
      return
    }
    createFormWindow(url)
  })

  ipcMain.handle('capture-form-dom', async () => {
    if (!formWin || formWin.isDestroyed()) throw new Error('Form window not open')
    const html = await formWin.webContents.executeJavaScript('document.documentElement.outerHTML')
    const dir = path.resolve(process.env.APP_ROOT!, 'dom')
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    const filePath = path.join(dir, `form-dom-${Date.now()}.html`)
    writeFileSync(filePath, html, 'utf-8')
    return filePath
  })

  ipcMain.handle('start-automation', async (_event, config: Config, filiados: Filiado[]) => {
    cancelFlag.current = false

    const url = config.url
    if (!url) {
      throw new Error('URL do formulário não configurada')
    }

    if (!formWin || formWin.isDestroyed()) {
      createFormWindow(url)
    } else {
      formWin.loadURL(url)
    }

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout aguardando página carregar')), 30000)
      formWin!.webContents.on('did-finish-load', () => {
        clearTimeout(timeout)
        resolve()
      })
    })

    const onProgress: (update: any) => void = (update) => {
      if (mainWin && !mainWin.isDestroyed()) {
        mainWin.webContents.send('form-progress', update)
      }
    }

    try {
      await runAutomation(config, filiados, formWin!.webContents, cancelFlag, onProgress)
    } catch (e) {
      onProgress({ type: 'error', message: String(e) })
      throw e
    }
  })

  ipcMain.handle('cancel-automation', () => {
    cancelFlag.current = true
  })
}

app.whenReady().then(() => {
  setupIPC()
  createMainWindow()
})
