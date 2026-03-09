import axios from 'axios'

const ipc = window.api ?? null

function wrapResult(result) {
  return { data: result }
}

async function wrapError(fn) {
  try {
    return wrapResult(await fn())
  } catch (err) {
    const message = err.message ?? 'Something went wrong'
    const wrappedError = new Error(message)
    wrappedError.response = { data: { error: message } }
    import('../stores/ui.js').then(({ useUIStore }) => {
      const uiStore = useUIStore()
      uiStore.toast.error(message)
    })
    return Promise.reject(wrappedError)
  }
}

// ── Axios fallback for browser dev (no Electron preload) ──
const axiosApi = axios.create({ baseURL: '/api' })
axiosApi.interceptors.response.use(
  response => response,
  error => {
    import('../stores/ui.js').then(({ useUIStore }) => {
      const uiStore = useUIStore()
      uiStore.toast.error(error.response?.data?.error ?? 'Something went wrong')
    })
    return Promise.reject(error)
  }
)

// ── IPC api (Electron only) ───────────────────────────────
const ipcApi = {
  get: (url, config) => wrapError(() => {
    if (url === '/projects')                      return ipc.projects.getAll()
    if (url.match(/^\/projects\/(\d+)$/))         return ipc.projects.getOne(url.match(/^\/projects\/(\d+)$/)[1])
    if (url === '/issues')                        return ipc.issues.getAll(config?.params)
    if (url.match(/^\/projects\/(\d+)\/issues$/)) return ipc.issues.getByProject({ projectId: url.match(/^\/projects\/(\d+)\/issues$/)[1], filters: config?.params })
    if (url.match(/^\/issues\/([^/]+)$/))         return ipc.issues.getOne(url.match(/^\/issues\/([^/]+)$/)[1])
    if (url.match(/^\/projects\/(\d+)\/labels$/)) return ipc.labels.getByProject(url.match(/^\/projects\/(\d+)\/labels$/)[1])
    if (url.match(/^\/issues\/(\d+)\/labels$/))   return ipc.labels.getByIssue(url.match(/^\/issues\/(\d+)\/labels$/)[1])
    if (url.match(/^\/issues\/(\d+)\/comments$/)) return ipc.comments.getByIssue(url.match(/^\/issues\/(\d+)\/comments$/)[1])
    if (url === '/dashboard/stats')               return ipc.dashboard.getStats()
    if (url === '/dashboard/activity')            return ipc.dashboard.getActivity()
    if (url.match(/^\/search/))                   return ipc.search.query(config?.params?.q)
    throw new Error(`Unhandled GET: ${url}`)
  }),

  post: (url, data) => wrapError(() => {
    if (url === '/projects')                           return ipc.projects.create(data)
    if (url.match(/^\/projects\/(\d+)\/issues$/))      return ipc.issues.create({ projectId: url.match(/^\/projects\/(\d+)\/issues$/)[1], ...data })
    if (url.match(/^\/projects\/(\d+)\/labels$/))      return ipc.labels.create({ projectId: url.match(/^\/projects\/(\d+)\/labels$/)[1], ...data })
    if (url.match(/^\/issues\/(\d+)\/comments$/))      return ipc.comments.create({ issueId: url.match(/^\/issues\/(\d+)\/comments$/)[1], ...data })
    if (url.match(/^\/issues\/(\d+)\/labels\/(\d+)$/)) {
      const [, issueId, labelId] = url.match(/^\/issues\/(\d+)\/labels\/(\d+)$/)
      return ipc.labels.addToIssue({ issueId, labelId })
    }
    throw new Error(`Unhandled POST: ${url}`)
  }),

  put: (url, data) => wrapError(() => {
    if (url.match(/^\/projects\/(\d+)$/)) return ipc.projects.update({ id: url.match(/^\/projects\/(\d+)$/)[1], ...data })
    if (url.match(/^\/issues\/(\d+)$/))   return ipc.issues.update({ id: url.match(/^\/issues\/(\d+)$/)[1], ...data })
    if (url.match(/^\/labels\/(\d+)$/))   return ipc.labels.update({ id: url.match(/^\/labels\/(\d+)$/)[1], ...data })
    throw new Error(`Unhandled PUT: ${url}`)
  }),

  patch: (url, data) => wrapError(() => {
    if (url.match(/^\/issues\/(\d+)\/status$/))    return ipc.issues.updateStatus({ id: url.match(/^\/issues\/(\d+)\/status$/)[1], ...data })
    if (url.match(/^\/issues\/reorder\/(\d+)$/))   return ipc.issues.reorder({ projectId: url.match(/^\/issues\/reorder\/(\d+)$/)[1], ...data })
    throw new Error(`Unhandled PATCH: ${url}`)
  }),

  delete: (url) => wrapError(() => {
    if (url.match(/^\/projects\/(\d+)$/))              return ipc.projects.delete(url.match(/^\/projects\/(\d+)$/)[1])
    if (url.match(/^\/issues\/(\d+)$/))                return ipc.issues.delete(url.match(/^\/issues\/(\d+)$/)[1])
    if (url.match(/^\/labels\/(\d+)$/))                return ipc.labels.delete(url.match(/^\/labels\/(\d+)$/)[1])
    if (url.match(/^\/comments\/(\d+)$/))              return ipc.comments.delete(url.match(/^\/comments\/(\d+)$/)[1])
    if (url.match(/^\/issues\/(\d+)\/labels\/(\d+)$/)) {
      const [, issueId, labelId] = url.match(/^\/issues\/(\d+)\/labels\/(\d+)$/)
      return ipc.labels.removeFromIssue({ issueId, labelId })
    }
    throw new Error(`Unhandled DELETE: ${url}`)
  }),
}

export default ipc ? ipcApi : axiosApi