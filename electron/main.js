import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { spawn } from 'child_process'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import net from 'net'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev     = !app.isPackaged

// ── Find a free port ──────────────────────────────────────
function getFreePort() {
  return new Promise((resolve) => {
    const srv = net.createServer()
    srv.listen(0, () => {
      const port = srv.address().port
      srv.close(() => resolve(port))
    })
  })
}

// ── Resolve paths for packaged vs dev ─────────────────────
function getBackendPath() {
  if (isDev) {
    return path.resolve(__dirname, '../packages/backend')
  }
  return path.join(process.resourcesPath, 'backend')
}

function getFrontendURL(port) {
  if (isDev) {
    return 'http://localhost:5173'
  }
  return `http://localhost:${port}`
}

// ── User data path for SQLite db ──────────────────────────
function getDbPath() {
  const userDataPath = app.getPath('userData')
  fs.mkdirSync(userDataPath, { recursive: true })
  return path.join(userDataPath, 'sparkletrack.db')
}

let mainWindow   = null
let backendProc  = null
let backendPort  = null

// ── Start Express backend ─────────────────────────────────
async function startBackend() {
  backendPort = await getFreePort()
  const backendPath = getBackendPath()
  const dbPath      = getDbPath()

  console.log(`Starting backend on port ${backendPort}`)
  console.log(`Backend path: ${backendPath}`)
  console.log(`DB path: ${dbPath}`)

  // Run migrations first
  const migrateProc = spawn('node', ['src/db/migrate.js'], {
    cwd: backendPath,
    env: {
      ...process.env,
      DB_PATH:   dbPath,
      NODE_ENV:  'production',
    },
    stdio: 'pipe',
  })

  await new Promise((resolve, reject) => {
    migrateProc.stdout.on('data', d => console.log('[migrate]', d.toString()))
    migrateProc.stderr.on('data', d => console.error('[migrate]', d.toString()))
    migrateProc.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(`Migration failed with code ${code}`))
    })
  })

  // Start the server
  backendProc = spawn('node', ['server.js'], {
    cwd: backendPath,
    env: {
      ...process.env,
      PORT:      String(backendPort),
      DB_PATH:   dbPath,
      NODE_ENV:  'production',
    },
    stdio: 'pipe',
  })

  backendProc.stdout.on('data', d => console.log('[backend]', d.toString()))
  backendProc.stderr.on('data', d => console.error('[backend]', d.toString()))

  backendProc.on('close', (code) => {
    console.log(`Backend exited with code ${code}`)
  })

  // Wait for backend to be ready
  await waitForBackend(backendPort)
  console.log('Backend ready!')
}

// ── Poll until backend responds ───────────────────────────
function waitForBackend(port, retries = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0

    const check = () => {
      const sock = net.createConnection({ port }, () => {
        sock.destroy()
        resolve()
      })
      sock.on('error', () => {
        attempts++
        if (attempts >= retries) {
          reject(new Error('Backend failed to start'))
        } else {
          setTimeout(check, 500)
        }
      })
    }

    check()
  })
}

// ── Create the browser window ─────────────────────────────
async function createWindow() {
  mainWindow = new BrowserWindow({
    width:           1280,
    height:          800,
    minWidth:        900,
    minHeight:       600,
    titleBarStyle:   'hiddenInset', // native mac feel
    backgroundColor: '#fdf6ff',
    webPreferences: {
      nodeIntegration:  false,
      contextIsolation: true,
      preload:          path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'icons/icon.png'),
  })

  // In dev load Vite dev server, in prod load built files
  if (isDev) {
    await mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    await mainWindow.loadURL(`http://localhost:${backendPort}`)
  }

  // Open external links in browser, not Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// ── App lifecycle ─────────────────────────────────────────
app.whenReady().then(async () => {
  try {
    if (!isDev) {
      await startBackend()
    }
    await createWindow()
  } catch (err) {
    console.error('Failed to start:', err)
    app.quit()
  }

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  if (backendProc) {
    console.log('Shutting down backend...')
    backendProc.kill()
  }
})

// Send backend port to renderer so axios knows where to point
ipcMain.handle('get-backend-port', () => backendPort)