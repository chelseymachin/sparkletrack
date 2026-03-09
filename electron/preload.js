const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  health: () => ipcRenderer.invoke('health'),

  projects: {
    getAll:  ()     => ipcRenderer.invoke('projects:getAll'),
    getOne:  (id)   => ipcRenderer.invoke('projects:getOne', id),
    create:  (data) => ipcRenderer.invoke('projects:create', data),
    update:  (data) => ipcRenderer.invoke('projects:update', data),
    delete:  (id)   => ipcRenderer.invoke('projects:delete', id),
  },

  issues: {
    getAll:       (filters) => ipcRenderer.invoke('issues:getAll', filters),
    getByProject: (args)    => ipcRenderer.invoke('issues:getByProject', args),
    getOne:       (key)     => ipcRenderer.invoke('issues:getOne', key),
    create:       (data)    => ipcRenderer.invoke('issues:create', data),
    update:       (data)    => ipcRenderer.invoke('issues:update', data),
    updateStatus: (data)    => ipcRenderer.invoke('issues:updateStatus', data),
    reorder:      (data)    => ipcRenderer.invoke('issues:reorder', data),
    delete:       (id)      => ipcRenderer.invoke('issues:delete', id),
  },

  labels: {
    getByProject:    (projectId)            => ipcRenderer.invoke('labels:getByProject', projectId),
    getByIssue:      (issueId)              => ipcRenderer.invoke('labels:getByIssue', issueId),
    create:          (data)                 => ipcRenderer.invoke('labels:create', data),
    update:          (data)                 => ipcRenderer.invoke('labels:update', data),
    delete:          (id)                   => ipcRenderer.invoke('labels:delete', id),
    addToIssue:      ({ issueId, labelId }) => ipcRenderer.invoke('labels:addToIssue', { issueId, labelId }),
    removeFromIssue: ({ issueId, labelId }) => ipcRenderer.invoke('labels:removeFromIssue', { issueId, labelId }),
  },

  comments: {
    getByIssue: (issueId) => ipcRenderer.invoke('comments:getByIssue', issueId),
    create:     (data)    => ipcRenderer.invoke('comments:create', data),
    delete:     (id)      => ipcRenderer.invoke('comments:delete', id),
  },

  dashboard: {
    getStats:    () => ipcRenderer.invoke('dashboard:getStats'),
    getActivity: () => ipcRenderer.invoke('dashboard:getActivity'),
  },

  search: {
    query: (q) => ipcRenderer.invoke('search:query', q),
  },

  export: {
    json: () => ipcRenderer.invoke('export:json'),
  },
})