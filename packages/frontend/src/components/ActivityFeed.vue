<template>
  <div class="activity-feed">
    <div
      v-for="entry in feed"
      :key="`${entry.feedType}-${entry.id}`"
      class="feed-entry"
    >
      <div
        class="feed-entry__dot"
        :class="entry.feedType === 'comment' ? 'dot--pink' : 'dot--purple'"
      ></div>

      <div class="feed-entry__body">
        <!-- Project badge if showing cross-project feed -->
        <span v-if="showProject && entry.projectName" class="feed-entry__project">
          {{ entry.projectIcon }} {{ entry.projectName }}
        </span>

        <!-- Issue link -->
        <RouterLink
          v-if="entry.fullKey"
          :to="`/issues/${entry.fullKey}`"
          class="feed-entry__key"
        >
          {{ entry.fullKey }}
        </RouterLink>

        <!-- Content -->
        <span v-if="entry.feedType === 'comment'" class="feed-entry__text">
          commented: <em>"{{ truncate(entry.body) }}"</em>
        </span>
        <span v-else-if="entry.action === 'status_changed'" class="feed-entry__text">
          status changed
          <StatusBadge :status="entry.fromValue" />
          →
          <StatusBadge :status="entry.toValue" />
        </span>
        <span v-else-if="entry.action === 'issue_created'" class="feed-entry__text">
          created with status <StatusBadge :status="entry.toValue" />
        </span>
        <span v-else class="feed-entry__text">{{ entry.action }}</span>

        <span class="feed-entry__time">{{ formatDate(entry.createdAt) }}</span>
      </div>
    </div>

    <div v-if="!feed?.length" class="feed-empty">
      <span class="feed-empty__icon">✨</span>
      <p>No activity yet — start working on some issues!</p>
    </div>
  </div>
</template>

<script setup>
import StatusBadge from './StatusBadge.vue'

defineProps({
  feed:        { type: Array,   default: () => [] },
  showProject: { type: Boolean, default: false },
})

function truncate(str, len = 60) {
  if (!str) return ''
  // Strip HTML tags first
  const plain = str.replace(/<[^>]+>/g, '')
  return plain.length > len ? plain.slice(0, len) + '...' : plain
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${date} at ${time}`
}
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.activity-feed {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.feed-entry {
  display: flex;
  gap: $space-3;
  align-items: flex-start;

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 4px;

    &.dot--pink   { background: $pink-400; }
    &.dot--purple { background: $purple-400; }
  }

  &__body {
    flex: 1;
    display: flex;
    align-items: center;
    gap: $space-2;
    flex-wrap: wrap;
    font-size: 0.82rem;
    color: $gray-600;
    line-height: 1.5;
  }

  &__project {
    font-size: 0.72rem;
    color: $gray-400;
    background: $gray-50;
    padding: 1px 8px;
    border-radius: $radius-pill;
    border: 1px solid $gray-100;
  }

  &__key {
    font-family: $font-mono;
    font-size: 0.75rem;
    font-weight: 700;
    color: $pink-500;

    &:hover { text-decoration: underline; }
  }

  &__text {
    display: flex;
    align-items: center;
    gap: $space-2;
    flex-wrap: wrap;

    em {
      color: $gray-500;
      font-style: normal;
    }
  }

  &__time {
    font-size: 0.7rem;
    color: $gray-400;
    white-space: nowrap;
    margin-left: auto;
  }
}

.feed-empty {
  text-align: center;
  padding: $space-8;
  color: $gray-400;

  &__icon {
    display: block;
    font-size: 2rem;
    margin-bottom: $space-3;
  }

  p { font-size: 0.85rem; }
}
</style>