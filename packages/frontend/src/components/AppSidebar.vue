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
      <div
        class="nav-project"
        :class="{ 'nav-project--active': isProjectActive(project.id) }"
        v-for="project in projectsStore.projects"
        :key="project.id"
      >
        <RouterLink
          :to="`/projects/${project.id}/board`"
          class="nav-project__link"
        >
          <span class="nav-project__icon">{{ project.icon }}</span>
          <span class="nav-project__name">{{ project.name }}</span>
          <span class="nav-project__prefix" :style="{ color: project.color }">
            {{ project.prefix }}
          </span>
        </RouterLink>
        <RouterLink
          :to="`/projects/${project.id}/settings`"
          class="nav-project__settings"
          title="Project settings"
        >
          ⚙
        </RouterLink>
      </div>
      <button class="nav-item nav-item--new" @click="uiStore.openCreateProject()">
        + New Project
      </button>
    </nav>
    <div class="sidebar-footer">
      <a href="/api/export/json" download class="footer-link">⬇ Export</a>
      <span>·</span>
      <button class="footer-link" @click="uiStore.shortcutsOpen = true">? Help</button>
    </div>
  </aside>
</template>

<script setup>
import { useProjectsStore } from '../stores/projects.js'
import { useUIStore } from '../stores/ui.js'
import { useRoute } from 'vue-router'

const projectsStore = useProjectsStore()
const uiStore = useUIStore()
const route = useRoute()

function isProjectActive(projectId) {
  return route.params.projectId === String(projectId)
}
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

.nav-project {
  display: flex;
  align-items: center;
  gap: 2px;
  border-radius: $radius-sm;
  transition: background 0.15s;

  // Gear hidden by default
  &__settings {
    flex-shrink: 0;
    padding: 5px 6px;
    border-radius: $radius-sm;
    font-size: 0.75rem;
    color: $gray-600;
    opacity: 0;
    transition: opacity 0.15s, background 0.15s, color 0.15s;
    line-height: 1;
  }

  &__link {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: $space-2;
    padding: 7px $space-2;
    border-radius: $radius-sm;
    font-size: 0.82rem;
    color: $gray-600;
    transition: color 0.15s;
  }

  &__icon { flex-shrink: 0; }

  &__name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  &__prefix {
    font-family: $font-mono;
    font-size: 0.65rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  // Hover state — target parent, affect children
  &:hover {
    background: $pink-100;

    .nav-project__link { color: $pink-500; }
    .nav-project__settings { opacity: 1; }
  }

  // Active state — target parent, affect children
  &--active {
    background: $pink-100;

    .nav-project__link {
      color: $pink-500;
      font-weight: 600;
    }

    .nav-project__settings { opacity: 1; }
  }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: $space-2;
  padding: 7px $space-2;
  border-radius: $radius-sm;
  font-size: 0.82rem;
  color: $gray-600;
  text-align: left;
  transition: background 0.15s, color 0.15s;

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
    width: 100%;

    &:hover {
      border-color: $pink-300;
      color: $pink-400;
      background: $pink-50;
    }
  }
}

.sidebar-footer {
  font-size: 0.72rem;
  color: $gray-400;
  text-align: center;
  padding-top: $space-4;
  border-top: 1px solid $gray-100;
  margin-top: $space-4;
}

.footer-link {
  font-size: 0.72rem;
  color: $gray-400;
  transition: color 0.15s;
  &:hover { color: $pink-500; }
}
</style>