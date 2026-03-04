<template>
  <div class="dashboard">
    <h1>Dashboard ✨</h1>
    <p>Dashboard stats coming soon! For now, head to your projects.</p>
    <RouterLink to="/projects" class="btn btn--primary">View Projects →</RouterLink>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.dashboard {
  padding: $space-8;

  h1 {
    font-family: $font-display;
    font-size: 2rem;
    margin-bottom: $space-3;
  }

  p {
    color: $gray-400;
    margin-bottom: $space-6;
  }
}

.btn {
  display: inline-block;
  padding: 9px $space-5;
  border-radius: $radius-pill;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: $font-body;

  &--primary {
    background: $pink-500;
    color: $white;
    &:hover { background: $pink-400; }
  }
}
</style>