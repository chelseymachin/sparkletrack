import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Response interceptor — catch all API errors and show toast
api.interceptors.response.use(
  response => response,
  error => {
    // Import dynamically to avoid circular dependency
    import('../stores/ui.js').then(({ useUIStore }) => {
      const uiStore = useUIStore()
      const message = error.response?.data?.error ?? 'Something went wrong'
      uiStore.toast.error(message)
    })
    return Promise.reject(error)
  }
)

export default api