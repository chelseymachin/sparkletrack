<template>
  <div class="issue-card" @click="$router.push(`/issues/${issue.fullKey}`)">
    <div class="issue-card__header">
      <span class="issue-card__key" :style="{ color: projectColor }">
        {{ issue.fullKey }}
      </span>
      <PriorityBadge :priority="issue.priority" />
    </div>

    <div class="issue-card__title">{{ issue.title }}</div>

    <!-- Labels -->
    <div v-if="issue.labels?.length" class="issue-card__labels">
      <LabelChip
        v-for="label in issue.labels"
        :key="label.id"
        :name="label.name"
        :color="label.color"
      />
    </div>

    <div class="issue-card__footer">
      <TypeBadge :type="issue.type" />
    </div>
  </div>
</template>

<script setup>
import PriorityBadge from './PriorityBadge.vue'
import TypeBadge from './TypeBadge.vue'
import LabelChip from './LabelChip.vue'

defineProps({
  issue:        { type: Object, required: true },
  projectColor: { type: String, default: '#ff5eab' },
})
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.issue-card {
  background: $white;
  border: 1.5px solid $gray-100;
  border-radius: $radius-md;
  padding: $space-4;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s, transform 0.15s;

  &:hover {
    box-shadow: $shadow-md;
    border-color: $pink-200;
    transform: translateY(-1px);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-2;
  }

  &__key {
    font-family: $font-mono;
    font-size: 0.7rem;
    font-weight: 700;
  }

  &__title {
    font-size: 0.85rem;
    color: $gray-800;
    line-height: 1.4;
    margin-bottom: $space-3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__labels {
    display: flex;
    flex-wrap: wrap;
    gap: $space-1;
    margin-bottom: $space-2;
  }

  &__footer {
    display: flex;
    gap: $space-2;
    align-items: center;
    flex-wrap: wrap;
  }
}
</style>