<template>
  <div class="health-bar">
    <div class="health-bar__header">
      <div class="health-bar__project">
        <span class="health-bar__icon">{{ project.icon }}</span>
        <span class="health-bar__name">{{ project.name }}</span>
        <span class="health-bar__prefix" :style="{ color: project.color }">
          {{ project.prefix }}
        </span>
      </div>
      <div class="health-bar__stats">
        <span class="health-bar__done">{{ project.done }} done</span>
        <span class="health-bar__total">/ {{ project.total }}</span>
      </div>
    </div>
    <div class="health-bar__track">
      <div
        class="health-bar__fill"
        :style="{
          width: percentage + '%',
          background: project.color,
        }"
      ></div>
    </div>
    <div class="health-bar__pct">{{ percentage }}% complete</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  project: { type: Object, required: true }
})

const percentage = computed(() => {
  if (!props.project.total || props.project.total === 0) return 0
  return Math.round((props.project.done / props.project.total) * 100)
})
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.health-bar {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-2;
  }

  &__project {
    display: flex;
    align-items: center;
    gap: $space-2;
  }

  &__icon { font-size: 0.9rem; }

  &__name {
    font-size: 0.85rem;
    font-weight: 600;
    color: $gray-800;
  }

  &__prefix {
    font-family: $font-mono;
    font-size: 0.65rem;
    font-weight: 700;
  }

  &__stats {
    font-size: 0.75rem;
    color: $gray-400;
  }

  &__done { color: $gray-600; font-weight: 600; }

  &__track {
    height: 8px;
    background: $gray-100;
    border-radius: $radius-pill;
    overflow: hidden;
    margin-bottom: $space-1;
  }

  &__fill {
    height: 100%;
    border-radius: $radius-pill;
    transition: width 0.6s ease;
    min-width: 4px;
  }

  &__pct {
    font-size: 0.68rem;
    color: $gray-400;
    text-align: right;
  }
}
</style>