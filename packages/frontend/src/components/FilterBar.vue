<template>
  <div class="filter-bar">
    <select v-model="localFilters.status" class="filter-select" @change="emit">
      <option value="">All Statuses</option>
      <option value="backlog">Backlog</option>
      <option value="todo">To Do</option>
      <option value="in_progress">In Progress</option>
      <option value="in_review">In Review</option>
      <option value="done">Done</option>
    </select>

    <select v-model="localFilters.type" class="filter-select" @change="emit">
      <option value="">All Types</option>
      <option value="bug">Bug</option>
      <option value="feature">Feature</option>
      <option value="task">Task</option>
      <option value="chore">Chore</option>
    </select>

    <select v-model="localFilters.priority" class="filter-select" @change="emit">
      <option value="">All Priorities</option>
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
      <option value="critical">Critical</option>
    </select>

    <button v-if="hasActiveFilters" class="filter-clear" @click="clear">
      ✕ Clear filters
    </button>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ status: '', type: '', priority: '' })
  }
})

const emits = defineEmits(['update:modelValue', 'change'])

let localFilters = reactive({ ...props.modelValue })

const hasActiveFilters = computed(() =>
  Object.values(localFilters).some(v => v !== '')
)

function emit() {
  emits('update:modelValue', { ...localFilters })
  emits('change', { ...localFilters })
}

function clear() {
  Object.assign(localFilters, { status: '', type: '', priority: '' })
  emit()
}
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.filter-bar {
  display: flex;
  gap: $space-3;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  border: 1.5px solid $gray-200;
  border-radius: $radius-pill;
  padding: 6px $space-4;
  font-size: 0.82rem;
  font-family: $font-body;
  color: $gray-600;
  background: $white;
  outline: none;
  cursor: pointer;

  &:focus { border-color: $pink-300; }
}

.filter-clear {
  font-size: 0.78rem;
  color: $gray-400;
  padding: 6px $space-3;
  border-radius: $radius-pill;
  border: 1.5px solid $gray-200;
  transition: color 0.15s, border-color 0.15s;

  &:hover { color: $coral-500; border-color: $coral-300; }
}
</style>