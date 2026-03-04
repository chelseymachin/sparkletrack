<template>
  <span class="badge" :class="`badge--${status}`">
    ● {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true }
})

const labels = {
  backlog:     'Backlog',
  todo:        'To Do',
  in_progress: 'In Progress',
  in_review:   'In Review',
  done:        'Done',
}

const label = computed(() => labels[props.status] ?? props.status)
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
  letter-spacing: 0.03em;
  white-space: nowrap;

  &--backlog     { background: $gray-100;    color: $gray-400; }
  &--todo        { background: $pink-100;    color: $pink-500; }
  &--in_progress { background: $purple-100;  color: $purple-500; }
  &--in_review   { background: $gold-100;    color: $gold-500; }
  &--done        { background: $mint-100;    color: $mint-500; }
}
</style>