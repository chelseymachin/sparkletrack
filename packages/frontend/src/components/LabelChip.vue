<template>
  <span
    class="label-chip"
    :style="{
      background: color + '22',
      color: color,
      borderColor: color + '55',
    }"
  >
    {{ name }}
  </span>
</template>

<script setup>
defineProps({
  name:  { type: String, required: true },
  color: { type: String, default: '#ff5eab' },
})
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.label-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: $radius-pill;
  font-size: 0.68rem;
  font-weight: 600;
  border: 1.5px solid;
  white-space: nowrap;
  letter-spacing: 0.03em;
}
</style>