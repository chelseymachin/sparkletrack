import axios from 'axios'

async function getBaseURL() {
  // In Electron production, get the dynamic port
  if (window.electron) {
    const port = await window.electron.getBackendPort()
    return `http://localhost:${port}/api`
  }
  // In dev, use Vite proxy
  return '/api'
}

// Create instance with dynamic base URL
const api = axios.create({ baseURL: '/api' })

// Update base URL if running in Electron
if (window.electron) {
  window.electron.getBackendPort().then(port => {
    api.defaults.baseURL = `http://localhost:${port}/api`
  })
}

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    import('../stores/ui.js').then(({ useUIStore }) => {
      const uiStore = useUIStore()
      const message = error.response?.data?.error ?? 'Something went wrong'
      uiStore.toast.error(message)
    })
    return Promise.reject(error)
  }
)

export default api