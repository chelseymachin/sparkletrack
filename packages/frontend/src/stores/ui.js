import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // Modal state
  const createIssueModalOpen  = ref(false)
  const createProjectModalOpen = ref(false)
  const createIssueDefaults   = ref({})
  const searchOpen    = ref(false)
  const shortcutsOpen = ref(false)

  function openCreateIssue(defaults = {}) {
    createIssueDefaults.value = defaults
    createIssueModalOpen.value = true
  }
  function closeCreateIssue() {
    createIssueModalOpen.value = false
    createIssueDefaults.value = {}
  }
  function openCreateProject() { createProjectModalOpen.value = true }
  function closeCreateProject() { createProjectModalOpen.value = false }

  // Toast notifications
  const toasts = ref([])

  function addToast(message, type = 'success') {
    const id = Date.now()
    toasts.value.push({ id, message, type })
    setTimeout(() => removeToast(id), 3500)
  }
  function removeToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  // Convenience helpers
  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
  }

  return {
    createIssueModalOpen, createProjectModalOpen, createIssueDefaults,
    openCreateIssue, closeCreateIssue, openCreateProject, closeCreateProject,
    toasts, toast, removeToast, searchOpen, shortcutsOpen,
  }
})