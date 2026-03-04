<template>
  <aside class="sidebar">
    <div class="sidebar-logo">✨ SparkleTrack</div>

    <nav class="sidebar-nav">
      <RouterLink to="/" class="nav-item" active-class="nav-item--active">
        🏠 Dashboard
      </RouterLink>
      <RouterLink to="/issues" class="nav-item" active-class="nav-item--active">
        📋 All Issues
      </RouterLink>
    </nav>

    <div class="sidebar-section-label">Projects</div>

    <nav class="sidebar-projects">
      <RouterLink
        v-for="project in projectsStore.projects"
        :key="project.id"
        :to="`/projects/${project.id}/board`"
        class="nav-item"
        active-class="nav-item--active"
      >
        <span>{{ project.icon }} {{ project.name }}</span>
        <span class="project-prefix">{{ project.prefix }}</span>
      </RouterLink>

      <button class="nav-item nav-item--new" @click="uiStore.openCreateProject()">
        + New Project
      </button>
    </nav>

    <div class="sidebar-footer">
      ⚙ Settings &nbsp;·&nbsp; ? Help
    </div>
  </aside>
</template>

<script setup>
import { useProjectsStore } from '../stores/projects.js'
import { useUIStore } from '../stores/ui.js'

const projectsStore = useProjectsStore()
const uiStore = useUIStore()
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.sidebar {
  width: 220px;
  min-height: 100vh;
  background: $white;
  border-right: 1.5px solid $pink-100;
  display: flex;
  flex-direction: column;
  padding: $space-5 $space-4;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-logo {
  font-family: $font-display;
  font-size: 1.2rem;
  color: $pink-500;
  margin-bottom: $space-6;
  padding: 0 $space-2;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: $space-4;
}

.sidebar-section-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $gray-400;
  padding: $space-3 $space-2 $space-1;
}

.sidebar-projects {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px $space-2;
  border-radius: $radius-sm;
  font-size: 0.82rem;
  color: $gray-600;
  transition: background 0.15s, color 0.15s;
  width: 100%;
  text-align: left;

  &:hover {
    background: $pink-50;
    color: $pink-500;
  }

  &--active {
    background: $pink-100;
    color: $pink-500;
    font-weight: 600;
  }

  &--new {
    border: 1.5px dashed $gray-200;
    color: $gray-400;
    margin-top: $space-2;
    justify-content: center;

    &:hover {
      border-color: $pink-300;
      color: $pink-400;
      background: $pink-50;
    }
  }
}

.project-prefix {
  font-family: $font-mono;
  font-size: 0.65rem;
  color: $pink-400;
}

.sidebar-footer {
  font-size: 0.72rem;
  color: $gray-400;
  text-align: center;
  padding-top: $space-4;
  border-top: 1px solid $gray-100;
  margin-top: $space-4;
}
</style>