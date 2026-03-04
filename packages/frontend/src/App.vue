<template>
  <div class="app-shell">
    <AppSidebar />
    <div class="app-main">
      <AppTopbar />
      <main class="app-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from './components/AppSidebar.vue'
import AppTopbar from './components/AppTopbar.vue'
import { useProjectsStore } from './stores/projects.js'

// Load projects on app mount so sidebar is populated
const projectsStore = useProjectsStore()
projectsStore.fetchProjects()
</script>

<style lang="scss">
.app-shell {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg);
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; 
}

.app-content {
  flex: 1;
  padding: var(--space-8);
  overflow-y: auto;
}
</style>