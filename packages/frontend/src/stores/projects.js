import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([])
  const loading  = ref(false)
  const error    = ref(null)

  async function fetchProjects() {
    loading.value = true
    error.value = null
    try {
      const res = await axios.get('/api/projects')
      projects.value = res.data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function createProject(payload) {
    const res = await axios.post('/api/projects', payload)
    projects.value.push(res.data)
    return res.data
  }

  async function updateProject(id, payload) {
    const res = await axios.put(`/api/projects/${id}`, payload)
    const idx = projects.value.findIndex(p => p.id === id)
    if (idx !== -1) projects.value[idx] = res.data
    return res.data
  }

  async function archiveProject(id) {
    await axios.delete(`/api/projects/${id}`)
    projects.value = projects.value.filter(p => p.id !== id)
  }

  return { projects, loading, error, fetchProjects, createProject, updateProject, archiveProject }
})