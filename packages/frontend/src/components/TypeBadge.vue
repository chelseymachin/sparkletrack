<template>
  <span class="badge" :class="`badge--${type}`">
    {{ icon }} {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, required: true }
})

const config = {
  bug:     { label: 'Bug',     icon: '🐛' },
  feature: { label: 'Feature', icon: '✦'  },
  task:    { label: 'Task',    icon: '✓'  },
  chore:   { label: 'Chore',   icon: '⚙'  },
}

const label = computed(() => config[props.type]?.label ?? props.type)
const icon  = computed(() => config[props.type]?.icon  ?? '•')
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: $radius-pill;
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;

  &--bug     { background: $coral-100;  color: $coral-500; }
  &--feature { background: $purple-100; color: $purple-500; }
  &--task    { background: $pink-100;   color: $pink-500; }
  &--chore   { background: $gray-100;   color: $gray-600; }
}
</style>