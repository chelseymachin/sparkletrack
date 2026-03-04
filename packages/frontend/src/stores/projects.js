import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios.js'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([])
  const loading  = ref(false)
  const error    = ref(null)

  async function fetchProjects() {
    loading.value = true
    error.value = null
    try {
      const res = await api.get('/projects')
      projects.value = res.data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function createProject(payload) {
    // Auto-uppercase prefix before sending
    const body = { ...payload, prefix: payload.prefix?.toUpperCase() }
    const res = await api.post('/projects', body)
    projects.value.push(res.data)
    return res.data
  }

  async function updateProject(id, payload) {
    const res = await api.put(`/projects/${id}`, payload)
    const idx = projects.value.findIndex(p => p.id === id)
    if (idx !== -1) projects.value[idx] = res.data
    return res.data
  }

  async function archiveProject(id) {
    await api.delete(`/projects/${id}`)
    projects.value = projects.value.filter(p => p.id !== id)
  }

  return {
    projects, loading, error,
    fetchProjects, createProject, updateProject, archiveProject
  }
})