<template>
  <Teleport to="body">
    <div v-if="active" class="sparkles" aria-hidden="true">
      <span
        v-for="i in 12"
        :key="i"
        class="sparkle"
        :style="sparkleStyle(i)"
      >✨</span>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  trigger: { type: Boolean, default: false }
})

const active = ref(false)

watch(
  () => props.trigger, 
  (val) => {
    if (val) {
      active.value = true
      setTimeout(() => { active.value = false }, 1200)
    }
  }
)

function sparkleStyle(i) {
  const angle  = (i / 12) * 360
  const radius = 80 + Math.random() * 60
  const x      = Math.cos((angle * Math.PI) / 180) * radius
  const y      = Math.sin((angle * Math.PI) / 180) * radius
  const delay  = Math.random() * 0.3

  return {
    animationDelay: `${delay}s`,
    transform:      `translate(${x}px, ${y}px)`,
    fontSize:       `${0.8 + Math.random() * 0.8}rem`,
  }
}
</script>

<style lang="scss" scoped>
.sparkles {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 9999;
}

.sparkle {
  position: absolute;
  animation: sparkle-fly 1.2s ease-out forwards;
  opacity: 0;
  // Center each sparkle on the origin point before flying out
  transform-origin: center;
  margin-left: -0.5em;
  margin-top: -0.5em;
}

@keyframes sparkle-fly {
  0%   { opacity: 1; transform: translate(0, 0) scale(0.5); }
  60%  { opacity: 1; }
  100% { opacity: 0; }
}
</style>