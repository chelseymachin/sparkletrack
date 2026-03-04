<template>
  <div class="project-card" @click="$router.push(`/projects/${project.id}/issues`)">
    <div class="project-card__header">
      <div class="project-card__icon" :style="{ background: project.color + '22' }">
        {{ project.icon }}
      </div>
      <PrefixBadge :prefix="project.prefix" :color="project.color" />
    </div>

    <div class="project-card__name">{{ project.name }}</div>
    <div class="project-card__desc">{{ project.description || 'No description yet.' }}</div>

    <div class="project-card__footer">
      <span class="stat stat--open">{{ project.openIssues }} open</span>
      <span class="stat stat--done">{{ project.totalIssues - project.openIssues }} done</span>
    </div>
  </div>
</template>

<script setup>
import PrefixBadge from './PrefixBadge.vue'

defineProps({
  project: { type: Object, required: true }
})
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.project-card {
  background: $white;
  border: 1.5px solid $gray-100;
  border-radius: $radius-lg;
  padding: $space-6;
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s, border-color 0.15s;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
    border-color: $pink-200;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-4;
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: $radius-md;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
  }

  &__name {
    font-family: $font-display;
    font-size: 1.05rem;
    color: $gray-800;
    margin-bottom: $space-2;
  }

  &__desc {
    font-size: 0.82rem;
    color: $gray-400;
    line-height: 1.5;
    margin-bottom: $space-5;
    // Clamp to 2 lines
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__footer {
    display: flex;
    gap: $space-2;
  }
}

.stat {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: $radius-pill;

  &--open {
    background: $pink-100;
    color: $pink-500;
  }

  &--done {
    background: $mint-100;
    color: $mint-500;
  }
}
</style>