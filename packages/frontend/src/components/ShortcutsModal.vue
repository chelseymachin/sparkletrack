<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="uiStore.shortcutsOpen" class="modal-overlay" @click.self="uiStore.shortcutsOpen = false">
        <div class="shortcuts-modal">
          <div class="shortcuts-modal__header">
            <h2>Keyboard Shortcuts ✨</h2>
            <button @click="uiStore.shortcutsOpen = false">✕</button>
          </div>
          <div class="shortcuts-modal__body">
            <div class="shortcut-group">
              <div class="shortcut-group__label">Navigation</div>
              <div class="shortcut-row">
                <kbd>⌘K</kbd>
                <span>Open search</span>
              </div>
              <div class="shortcut-row">
                <kbd>?</kbd>
                <span>Show shortcuts</span>
              </div>
            </div>
            <div class="shortcut-group">
              <div class="shortcut-group__label">Actions</div>
              <div class="shortcut-row">
                <kbd>N</kbd>
                <span>New issue</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useUIStore } from '../stores/ui.js'
const uiStore = useUIStore()
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(45, 31, 74, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shortcuts-modal {
  background: $white;
  border-radius: $radius-lg;
  border: 1.5px solid $gray-100;
  box-shadow: 0 24px 64px rgba(45, 31, 74, 0.2);
  width: 400px;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $space-5 $space-6;
    border-bottom: 1.5px solid $gray-100;

    h2 {
      font-family: $font-display;
      font-size: 1.2rem;
      color: $gray-800;
    }

    button {
      color: $gray-400;
      font-size: 0.9rem;
      &:hover { color: $gray-800; }
    }
  }

  &__body {
    padding: $space-5 $space-6;
    display: flex;
    flex-direction: column;
    gap: $space-5;
  }
}

.shortcut-group {
  display: flex;
  flex-direction: column;
  gap: $space-2;

  &__label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: $gray-400;
    margin-bottom: $space-1;
  }
}

.shortcut-row {
  display: flex;
  align-items: center;
  gap: $space-3;
  font-size: 0.85rem;
  color: $gray-600;

  kbd {
    background: $gray-50;
    border: 1.5px solid $gray-200;
    border-radius: $radius-sm;
    padding: 3px 8px;
    font-family: $font-mono;
    font-size: 0.78rem;
    color: $gray-800;
    min-width: 40px;
    text-align: center;
  }
}

.modal-enter-active,
.modal-leave-active { transition: opacity 0.15s, transform 0.15s; }
.modal-enter-from,
.modal-leave-leave-to { opacity: 0; transform: scale(0.96); }
</style>