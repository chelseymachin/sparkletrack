<template>
  <div class="not-found">
    <div class="not-found__sparkle">✨</div>
    <h1>404</h1>
    <p class="not-found__subtitle">Oops! This page got lost in the sparkles.</p>
    <RouterLink to="/" class="btn btn--primary">← Back to Dashboard</RouterLink>
  </div>
</template>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  gap: $space-4;

  &__sparkle {
    font-size: 4rem;
    animation: spin 3s linear infinite;
  }

  h1 {
    font-family: $font-display;
    font-size: 5rem;
    color: $pink-300;
    line-height: 1;
  }

  &__subtitle {
    font-size: 1.1rem;
    color: $gray-400;
  }
}

@keyframes spin {
  0%   { transform: rotate(0deg) scale(1); }
  50%  { transform: rotate(180deg) scale(1.2); }
  100% { transform: rotate(360deg) scale(1); }
}

.btn {
  padding: 10px $space-6;
  border-radius: $radius-pill;
  font-size: 0.88rem;
  font-weight: 600;
  font-family: $font-body;
  background: $pink-500;
  color: $white;
  margin-top: $space-2;

  &:hover { background: $pink-400; }
}
</style>