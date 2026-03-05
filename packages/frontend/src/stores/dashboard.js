import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios.js'

export const useDashboardStore = defineStore('dashboard', () => {
  const stats   = ref(null)
  const activity = ref([])
  const loading  = ref(false)
  const error    = ref(null)

  async function fetchStats() {
    loading.value = true
    error.value = null
    try {
      const res = await api.get('/dashboard/stats')
      stats.value = res.data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchActivity() {
    try {
      const res = await api.get('/dashboard/activity')
      activity.value = res.data
    } catch (e) {
      error.value = e.message
    }
  }

  async function fetchAll() {
    await Promise.all([fetchStats(), fetchActivity()])
  }

  return { stats, activity, loading, error, fetchStats, fetchActivity, fetchAll }
})