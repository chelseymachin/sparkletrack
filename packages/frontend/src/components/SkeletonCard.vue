<template>
  <div class="skeleton-card">
    <div class="skeleton-line skeleton-line--short"></div>
    <div class="skeleton-line"></div>
    <div class="skeleton-line skeleton-line--medium"></div>
    <div class="skeleton-footer">
      <div class="skeleton-badge"></div>
      <div class="skeleton-badge"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

$shimmer-bg: linear-gradient(
  90deg,
  $gray-100 25%,
  $gray-50  50%,
  $gray-100 75%
);

.skeleton-card {
  background: $white;
  border: 1.5px solid $gray-100;
  border-radius: $radius-md;
  padding: $space-4;
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.skeleton-line {
  height: 12px;
  border-radius: $radius-pill;
  background: $shimmer-bg;
  background-size: 800px 100%;
  animation: shimmer 1.5s infinite linear;
  width: 100%;

  &--short  { width: 35%; }
  &--medium { width: 65%; }
}

.skeleton-footer {
  display: flex;
  gap: $space-2;
  margin-top: $space-1;
}

.skeleton-badge {
  height: 20px;
  width: 60px;
  border-radius: $radius-pill;
  background: $shimmer-bg;
  background-size: 800px 100%;
  animation: shimmer 1.5s infinite linear;
}
</style>