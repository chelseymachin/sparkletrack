import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '../stores/ui.js'

export function useKeyboardShortcuts() {
  const router  = useRouter()
  const uiStore = useUIStore()

  function handleKeydown(e) {
    const tag = e.target.tagName.toLowerCase()
    const isEditable = tag === 'input' || tag === 'textarea' ||
      e.target.isContentEditable

    // Cmd+K or Ctrl+K — search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      uiStore.searchOpen = !uiStore.searchOpen
      return
    }

    // ESC — close any open modal
    if (e.key === 'Escape') {
      if (uiStore.searchOpen)          uiStore.searchOpen = false
      if (uiStore.shortcutsOpen)       uiStore.shortcutsOpen = false
      if (uiStore.createIssueModalOpen)     uiStore.createIssueModalOpen = false
      if (uiStore.createProjectModalOpen)   uiStore.createProjectModalOpen = false
      return
    }

    if (isEditable) return

    switch (e.key) {
      case 'n':
      case 'N':
        uiStore.openCreateIssue()
        break
      case '?':
        uiStore.shortcutsOpen = !uiStore.shortcutsOpen
        break
    }
  }

  onMounted(()  => document.addEventListener('keydown', handleKeydown))
  onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
}