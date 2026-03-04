import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios.js'

export const useLabelsStore = defineStore('labels', () => {
  const labels  = ref([])
  const loading = ref(false)

  async function fetchLabels(projectId) {
    loading.value = true
    try {
      const res = await api.get(`/projects/${projectId}/labels`)
      labels.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function createLabel(projectId, payload) {
    const res = await api.post(`/projects/${projectId}/labels`, payload)
    labels.value.push(res.data)
    return res.data
  }

  async function updateLabel(id, payload) {
    const res = await api.put(`/labels/${id}`, payload)
    const idx = labels.value.findIndex(l => l.id === id)
    if (idx !== -1) labels.value[idx] = res.data
    return res.data
  }

  async function deleteLabel(id) {
    await api.delete(`/labels/${id}`)
    labels.value = labels.value.filter(l => l.id !== id)
  }

  return { labels, loading, fetchLabels, createLabel, updateLabel, deleteLabel }
})