<template>
  <div class="settings-view">
    <div class="settings-view__header">
      <button class="back-btn" @click="$router.back()">← Back</button>
      <h1>{{ project?.name }} Settings</h1>
    </div>

    <div class="settings-view__body">
      <div class="settings-section">
        <LabelManager :project-id="projectId" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '../stores/projects.js'
import LabelManager from '../components/LabelManager.vue'

const route         = useRoute()
const projectsStore = useProjectsStore()

const projectId = computed(() => Number(route.params.projectId))
const project   = computed(() => projectsStore.projects.find(p => p.id === projectId.value))
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.settings-view {
  max-width: 640px;

  &__header {
    display: flex;
    align-items: center;
    gap: $space-4;
    margin-bottom: $space-8;

    h1 {
      font-family: $font-display;
      font-size: 1.8rem;
    }
  }
}

.settings-section {
  background: $white;
  border: 1.5px solid $gray-100;
  border-radius: $radius-lg;
  padding: $space-6;
}

.back-btn {
  font-size: 0.82rem;
  color: $gray-400;
  padding: 6px $space-3;
  border-radius: $radius-pill;
  border: 1.5px solid $gray-200;

  &:hover { color: $pink-500; border-color: $pink-200; }
}
</style>