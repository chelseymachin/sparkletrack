<template>
  <span class="prefix-badge" :style="{ background: bgColor, color: textColor, borderColor: borderColor }">
    {{ prefix }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  prefix: { type: String, required: true },
  color:  { type: String, default: '#ff5eab' },
})

// Derive lighter bg and border from existing
const bgColor     = computed(() => `${props.color}18`)  // ~10% opacity
const borderColor = computed(() => `${props.color}44`)  // ~27% opacity
const textColor   = computed(() => props.color)
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.prefix-badge {
  font-family: $font-mono;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1.5px solid;
  display: inline-block;
  letter-spacing: 0.05em;
}
</style>