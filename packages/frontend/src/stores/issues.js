import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios.js'

export const useIssuesStore = defineStore('issues', () => {
  const issues      = ref([])   // current project's issues
  const allIssues   = ref([])   // cross-project
  const activeIssue = ref(null) // issue detail
  const loading     = ref(false)
  const error       = ref(null)

  // Filters
  const filters = ref({
    status:   null,
    type:     null,
    priority: null,
  })

  function setFilter(key, value) {
    filters.value[key] = value
  }

  function clearFilters() {
    filters.value = { status: null, type: null, priority: null }
  }

  async function fetchIssues(projectId) {
    loading.value = true
    error.value = null
    try {
      const params = {}
      if (filters.value.status)   params.status   = filters.value.status
      if (filters.value.type)     params.type     = filters.value.type
      if (filters.value.priority) params.priority = filters.value.priority

      const res = await api.get(`/projects/${projectId}/issues`, { params })
      issues.value = res.data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchAllIssues(params = {}) {
    loading.value = true
    try {
      const res = await api.get('/issues', { params })
      allIssues.value = res.data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchIssueByKey(key) {
    loading.value = true
    error.value = null
    activeIssue.value = null
    try {
      const res = await api.get(`/issues/${key}`)
      activeIssue.value = res.data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function createIssue(projectId, payload) {
    const res = await api.post(`/projects/${projectId}/issues`, payload)
    issues.value.unshift(res.data)
    return res.data
  }

  async function updateIssue(id, payload) {
    const res = await api.put(`/issues/${id}`, payload)
    const idx = issues.value.findIndex(i => i.id === id)
    if (idx !== -1) issues.value[idx] = res.data
    if (activeIssue.value?.id === id) activeIssue.value = res.data
    return res.data
  }

  async function updateIssueStatus(id, status) {
    const res = await api.patch(`/issues/${id}/status`, { status })
    const idx = issues.value.findIndex(i => i.id === id)
    if (idx !== -1) issues.value[idx] = { ...issues.value[idx], status }
    if (activeIssue.value?.id === id) {
      activeIssue.value = { ...activeIssue.value, status }
    }
    return res.data
  }

  async function deleteIssue(id) {
    await api.delete(`/issues/${id}`)
    issues.value = issues.value.filter(i => i.id !== id)
    if (activeIssue.value?.id === id) activeIssue.value = null
  }

  return {
    issues, allIssues, activeIssue, loading, error, filters,
    setFilter, clearFilters,
    fetchIssues, fetchAllIssues, fetchIssueByKey,
    createIssue, updateIssue, updateIssueStatus, deleteIssue,
  }
})