<template>
  <span class="badge" :class="`badge--${priority}`">
    {{ icon }} {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  priority: { type: String, required: true }
})

const config = {
  low:      { label: 'Low',      icon: '↓' },
  medium:   { label: 'Medium',   icon: '→' },
  high:     { label: 'High',     icon: '↑' },
  critical: { label: 'Critical', icon: '‼' },
}

const label = computed(() => config[props.priority]?.label ?? props.priority)
const icon  = computed(() => config[props.priority]?.icon  ?? '•')
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

  &--low      { background: $gray-100;   color: $gray-400; }
  &--medium   { background: $purple-100; color: $purple-500; }
  &--high     { background: $pink-100;   color: $pink-500; }
  &--critical { background: $coral-100;  color: $coral-500; }
}
</style>