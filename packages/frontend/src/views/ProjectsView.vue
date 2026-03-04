<template>
  <div class="projects-view">
    <div class="projects-view__header">
      <h1>Projects</h1>
      <button class="btn btn--primary" @click="uiStore.openCreateProject()">
        + New Project
      </button>
    </div>

    <!-- Loading -->
    <div v-if="projectsStore.loading" class="projects-view__loading">
      Loading your projects...
    </div>

    <!-- Empty state -->
    <div v-else-if="projectsStore.projects.length === 0" class="empty-state">
      <div class="empty-state__illustration">✨</div>
      <h2>No projects yet!</h2>
      <p>Create your first project to start tracking features and bugs.</p>
      <button class="btn btn--primary" @click="uiStore.openCreateProject()">
        Create your first project 🌸
      </button>
    </div>

    <!-- Projects grid -->
    <div v-else class="projects-grid">
      <ProjectCard
        v-for="project in projectsStore.projects"
        :key="project.id"
        :project="project"
      />
    </div>
  </div>
</template>

<script setup>
import ProjectCard from '../components/ProjectCard.vue'
import { useProjectsStore } from '../stores/projects.js'
import { useUIStore } from '../stores/ui.js'

const projectsStore = useProjectsStore()
const uiStore = useUIStore()
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.projects-view {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-8;

    h1 {
      font-family: $font-display;
      font-size: 2rem;
      color: $gray-800;
    }
  }

  &__loading {
    color: $gray-400;
    font-size: 0.9rem;
    padding: $space-8;
    text-align: center;
  }
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $space-5;
}

.empty-state {
  text-align: center;
  padding: $space-16 $space-8;

  &__illustration {
    font-size: 4rem;
    margin-bottom: $space-5;
    display: block;
  }

  h2 {
    font-family: $font-display;
    font-size: 1.6rem;
    color: $gray-800;
    margin-bottom: $space-3;
  }

  p {
    color: $gray-400;
    font-size: 0.9rem;
    margin-bottom: $space-6;
  }
}

.btn {
  padding: 9px $space-5;
  border-radius: $radius-pill;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: $font-body;

  &--primary {
    background: $pink-500;
    color: $white;
    &:hover { background: $pink-400; }
  }
}
</style>