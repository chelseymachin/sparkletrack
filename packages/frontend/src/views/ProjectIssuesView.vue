<template>
  <div class="issues-view">
    <div class="issues-view__header">
      <div class="issues-view__title">
        <span v-if="project" class="project-prefix" :style="{ color: project.color }">
          {{ project.prefix }}
        </span>
        <h1>{{ project?.name ?? 'Issues' }}</h1>
      </div>
      <div class="issues-view__actions">
        <div class="view-toggle">
          <RouterLink
            :to="`/projects/${projectId}/board`"
            class="view-toggle__btn"
            active-class="view-toggle__btn--active"
          >
            ▦ Board
          </RouterLink>
          <RouterLink
            :to="`/projects/${projectId}/issues`"
            class="view-toggle__btn"
            active-class="view-toggle__btn--active"
          >
            ≡ List
          </RouterLink>
        </div>
        <button class="btn btn--primary" @click="uiStore.openCreateIssue()">+ Issue</button>
      </div>
    </div>

    <!-- Filters -->
    <FilterBar
      v-model="activeFilters"
      class="filter-bar"
      @change="applyFilters"
    />

    <!-- Loading -->
    <div v-if="issuesStore.loading" class="state-message">Loading issues...</div>

    <!-- Empty state -->
    <div v-else-if="issuesStore.issues.length === 0" class="empty-state">
      <div class="empty-state__icon">✦</div>
      <h2>No issues yet</h2>
      <p>Create your first issue to start tracking work.</p>
      <button class="btn btn--primary" @click="uiStore.openCreateIssue()">Create issue ✦</button>
    </div>

    <!-- Issue table -->
    <div v-else class="issue-table">
      <div class="issue-table__header">
        <span>Key</span>
        <span>Title</span>
        <span>Status</span>
        <span>Type</span>
        <span>Priority</span>
        <span>Created</span>
        <span></span>
      </div>
      <div
        v-for="issue in issuesStore.issues"
        :key="issue.id"
        class="issue-row"
        @click="$router.push(`/issues/${issue.fullKey}`)"
      >
        <span class="issue-row__key" :style="{ color: project?.color }">
          {{ issue.fullKey }}
        </span>
        <span class="issue-row__title">{{ issue.title }}</span>
        <span @click.stop>
          <StatusDropdown :issue="issue" />
        </span>
        <span><TypeBadge :type="issue.type" /></span>
        <span><PriorityBadge :priority="issue.priority" /></span>
        <span class="issue-row__date">{{ formatDate(issue.createdAt) }}</span>
        <span @click.stop>
          <button class="issue-row__delete" @click="handleDelete(issue)">✕</button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useIssuesStore } from '../stores/issues.js'
import { useProjectsStore } from '../stores/projects.js'
import { useUIStore } from '../stores/ui.js'
import StatusDropdown from '../components/StatusDropdown.vue'
import TypeBadge from '../components/TypeBadge.vue'
import PriorityBadge from '../components/PriorityBadge.vue'
import FilterBar from '../components/FilterBar.vue'

const route         = useRoute()
const issuesStore   = useIssuesStore()
const projectsStore = useProjectsStore()
const uiStore       = useUIStore()

const projectId = computed(() => Number(route.params.projectId))
const project   = computed(() => projectsStore.projects.find(p => p.id === projectId.value))

const activeFilters = reactive({ status: '', type: '', priority: '' })
const hasActiveFilters = computed(() =>
  Object.values(activeFilters).some(v => v !== '')
)

watch(projectId, (newId) => {
  issuesStore.fetchIssues(newId)
}, { immediate: true })

function applyFilters() {
  issuesStore.setFilter('status',   activeFilters.status   || null)
  issuesStore.setFilter('type',     activeFilters.type     || null)
  issuesStore.setFilter('priority', activeFilters.priority || null)
  issuesStore.fetchIssues(projectId.value)
}

function clearFilters() {
  Object.assign(activeFilters, { status: '', type: '', priority: '' })
  issuesStore.clearFilters()
  issuesStore.fetchIssues(projectId.value)
}

async function handleDelete(issue) {
  if (!confirm(`Delete ${issue.fullKey}? This cannot be undone.`)) return
  await issuesStore.deleteIssue(issue.id)
  uiStore.toast.success(`${issue.fullKey} deleted`)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.issues-view {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-5;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: $space-3;

    h1 {
      font-family: $font-display;
      font-size: 1.8rem;
    }
  }

  &__actions {
    display: flex;
    gap: $space-3;
    align-items: center;
  }
}

.project-prefix {
  font-family: $font-mono;
  font-size: 0.85rem;
  font-weight: 700;
}

.view-toggle {
  display: flex;
  border: 1.5px solid $gray-200;
  border-radius: $radius-pill;
  overflow: hidden;

  &__btn {
    padding: 7px $space-4;
    font-size: 0.8rem;
    font-weight: 500;
    color: $gray-400;
    transition: background 0.15s, color 0.15s;

    &:hover { background: $gray-50; color: $gray-600; }

    &--active {
      background: $pink-500;
      color: $white;
      font-weight: 600;
    }
  }
}

.filter-bar {
  display: flex;
  gap: $space-3;
  align-items: center;
  margin-bottom: $space-5;
  flex-wrap: wrap;
}

.issue-table {
  background: $white;
  border: 1.5px solid $gray-100;
  border-radius: $radius-lg;
  overflow: hidden;

  &__header {
    display: grid;
    grid-template-columns: 100px 1fr 130px 110px 100px 90px 40px;
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
  grid-template-columns: 100px 1fr 130px 110px 100px 90px 40px;
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

  &__date {
    font-size: 0.76rem;
    color: $gray-400;
  }

  &__delete {
    color: $gray-400;
    font-size: 0.8rem;
    padding: 4px;
    border-radius: 4px;
    opacity: 0;

    .issue-row:hover & { opacity: 1; }
    &:hover { color: $coral-500; background: $coral-100; }
  }
}

.state-message {
  color: $gray-400;
  text-align: center;
  padding: $space-12;
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