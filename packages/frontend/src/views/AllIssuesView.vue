<template>
  <div class="all-issues">
    <div class="all-issues__header">
      <h1>All Issues</h1>
    </div>

    <FilterBar
      v-model="filters"
      class="all-issues__filters"
      @change="applyFilters"
    />

    <!-- Loading -->
    <div v-if="issuesStore.loading" class="state-message">
      Loading issues...
    </div>

    <!-- Empty state -->
    <div v-else-if="issuesStore.allIssues.length === 0" class="empty-state">
      <div class="empty-state__icon">✦</div>
      <h2>No issues found</h2>
      <p v-if="hasActiveFilters">Try clearing your filters.</p>
      <p v-else>Create your first issue to get started!</p>
      <button class="btn btn--primary" @click="uiStore.openCreateIssue()">
        Create issue ✦
      </button>
    </div>

    <!-- Issues table -->
    <div v-else class="issue-table">
      <div class="issue-table__header">
        <span>Key</span>
        <span>Title</span>
        <span>Project</span>
        <span>Status</span>
        <span>Type</span>
        <span>Priority</span>
        <span>Created</span>
      </div>
      <div
        v-for="issue in issuesStore.allIssues"
        :key="issue.id"
        class="issue-row"
        @click="$router.push(`/issues/${issue.fullKey}`)"
      >
        <span class="issue-row__key" :style="{ color: issue.projectColor }">
          {{ issue.fullKey }}
        </span>
        <span class="issue-row__title">{{ issue.title }}</span>
        <span>
          <span
            class="issue-row__project"
            :style="{
              background: issue.projectColor + '18',
              color: issue.projectColor,
              borderColor: issue.projectColor + '44',
            }"
          >
            {{ issue.projectIcon }} {{ issue.projectPrefix }}
          </span>
        </span>
        <span><StatusBadge :status="issue.status" /></span>
        <span><TypeBadge :type="issue.type" /></span>
        <span><PriorityBadge :priority="issue.priority" /></span>
        <span class="issue-row__date">{{ formatDate(issue.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted, watch } from 'vue'
import { useIssuesStore } from '../stores/issues.js'
import { useUIStore } from '../stores/ui.js'
import FilterBar from '../components/FilterBar.vue'
import StatusBadge from '../components/StatusBadge.vue'
import TypeBadge from '../components/TypeBadge.vue'
import PriorityBadge from '../components/PriorityBadge.vue'

const issuesStore = useIssuesStore()
const uiStore     = useUIStore()

let filters = reactive({ status: '', type: '', priority: '' })

const hasActiveFilters = computed(() =>
  Object.values(filters).some(v => v !== '')
)

watch(
  () => issuesStore.issues.length,
  () => {
    issuesStore.fetchAllIssues()
  }
)

onMounted(() => {
  issuesStore.fetchAllIssues()
})

function applyFilters() {
  const params = {}
  if (filters.status)   params.status   = filters.status
  if (filters.type)     params.type     = filters.type
  if (filters.priority) params.priority = filters.priority
  issuesStore.fetchAllIssues(params)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  })
}
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.all-issues {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-5;

    h1 {
      font-family: $font-display;
      font-size: 2rem;
      color: $gray-800;
    }
  }

  &__filters { margin-bottom: $space-5; }
}

.issue-table {
  background: $white;
  border: 1.5px solid $gray-100;
  border-radius: $radius-lg;
  overflow: hidden;

  &__header {
    display: grid;
    grid-template-columns: 100px 1fr 100px 130px 110px 100px 90px;
    padding: $space-3 $space-5;
    background: $gray-50;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $gray-400;
    border-bottom: 1.5px solid $gray-100;
  }
}

.issue-row {
  display: grid;
  grid-template-columns: 100px 1fr 100px 130px 110px 100px 90px;
  padding: $space-3 $space-5;
  border-bottom: 1px solid $gray-100;
  align-items: center;
  cursor: pointer;
  transition: background 0.1s;

  &:last-child { border-bottom: none; }
  &:hover { background: $gray-50; }

  &__key {
    font-family: $font-mono;
    font-size: 0.8rem;
    font-weight: 700;
  }

  &__title {
    font-size: 0.88rem;
    color: $gray-800;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: $space-4;
  }

  &__project {
    font-family: $font-mono;
    font-size: 0.68rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: $radius-pill;
    border: 1.5px solid;
    display: inline-block;
  }

  &__date {
    font-size: 0.76rem;
    color: $gray-400;
  }
}

.state-message {
  text-align: center;
  padding: $space-12;
  color: $gray-400;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: $space-16 $space-8;

  &__icon { font-size: 3rem; margin-bottom: $space-4; }

  h2 {
    font-family: $font-display;
    font-size: 1.4rem;
    margin-bottom: $space-2;
  }

  p { color: $gray-400; font-size: 0.9rem; margin-bottom: $space-5; }
}

.btn {
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