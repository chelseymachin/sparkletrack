<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in uiStore.toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
          @click="uiStore.removeToast(toast.id)"
        >
          <span class="toast__icon">
            {{ toast.type === 'success' ? '✨' : toast.type === 'error' ? '❌' : 'ℹ️' }}
          </span>
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useUIStore } from '../stores/ui.js'
const uiStore = useUIStore()
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.toast-container {
  position: fixed;
  bottom: $space-8;
  right: $space-8;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.toast {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-3 $space-5;
  border-radius: $radius-pill;
  font-size: 0.85rem;
  font-weight: 500;
  box-shadow: $shadow-md;
  cursor: pointer;
  min-width: 240px;

  &--success { background: $gray-800; color: $white; }
  &--error   { background: $coral-500; color: $white; }
  &--info    { background: $purple-500; color: $white; }
}

.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from { opacity: 0; transform: translateY(10px); }
.toast-leave-to   { opacity: 0; transform: translateX(20px); }
</style>