<template>
  <div class="stat-card">
    <div class="stat-card__icon">{{ icon }}</div>
    <div class="stat-card__content">
      <div class="stat-card__value">{{ value }}</div>
      <div class="stat-card__label">{{ label }}</div>
    </div>
    <div v-if="trend" class="stat-card__trend" :class="`trend--${trend}`">
      {{ trend === 'up' ? '↑' : '↓' }} {{ trendLabel }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon:       { type: String, required: true },
  value:      { type: [Number, String], required: true },
  label:      { type: String, required: true },
  trend:      { type: String, default: null },
  trendLabel: { type: String, default: '' },
})
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.stat-card {
  background: $white;
  border: 1.5px solid $gray-100;
  border-radius: $radius-lg;
  padding: $space-5 $space-6;
  display: flex;
  align-items: center;
  gap: $space-4;
  transition: box-shadow 0.15s, border-color 0.15s;

  &:hover {
    box-shadow: $shadow-md;
    border-color: $pink-100;
  }

  &__icon {
    font-size: 1.8rem;
    flex-shrink: 0;
  }

  &__content { flex: 1; }

  &__value {
    font-family: $font-display;
    font-size: 2rem;
    color: $gray-800;
    line-height: 1;
    margin-bottom: 2px;
  }

  &__label {
    font-size: 0.78rem;
    color: $gray-400;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  &__trend {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: $radius-pill;

    &.trend--up   { background: $mint-100; color: $mint-500; }
    &.trend--down { background: $coral-100; color: $coral-500; }
  }
}
</style>