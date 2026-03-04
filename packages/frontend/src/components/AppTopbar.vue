<template>
  <header class="topbar">
    <div class="topbar-search">⌘K Search...</div>
    <button class="topbar-new-btn" @click="uiStore.openCreateIssue()">
      + New Issue
    </button>
  </header>
</template>

<script setup>
import { useUIStore } from '../stores/ui.js'
const uiStore = useUIStore()
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.topbar {
  height: 56px;
  background: $white;
  border-bottom: 1.5px solid $pink-100;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: $space-3;
  padding: 0 $space-8;
  position: sticky;
  top: 0;
  z-index: 10;
}

.topbar-search {
  background: $gray-50;
  border: 1.5px solid $gray-100;
  border-radius: $radius-pill;
  padding: 6px $space-4;
  font-size: 0.78rem;
  color: $gray-400;
  cursor: pointer;
  min-width: 180px;

  &:hover {
    border-color: $pink-200;
  }
}

.topbar-new-btn {
  background: $pink-500;
  color: $white;
  border-radius: $radius-pill;
  padding: 7px $space-5;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: $font-body;
  transition: background 0.15s;

  &:hover {
    background: $pink-400;
  }
}
</style>