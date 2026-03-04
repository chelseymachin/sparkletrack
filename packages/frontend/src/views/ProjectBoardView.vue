<template>
  <div class="board-view">
    <div class="board-view__header">
      <div class="board-view__title">
        <span
          v-if="project"
          class="project-prefix"
          :style="{ color: project.color }"
        >
          {{ project.prefix }}
        </span>
        <h1>{{ project?.name ?? 'Board' }}</h1>
      </div>
      <div class="board-view__actions">
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
        <button class="btn btn--primary" @click="uiStore.openCreateIssue()">
          + Issue
        </button>
      </div>
    </div>

    <div v-if="issuesStore.loading" class="state-message">Loading board...</div>

    <div v-else class="board">
      <BoardColumn
        v-for="col in columns"
        :key="col.status"
        :status="col.status"
        :label="col.label"
        :color="col.color"
        :issues="issuesByStatus[col.status]"
        :project-color="project?.color ?? '#ff5eab'"
        @drag-end="onDragEnd"
        @add-issue="openAddIssue"
        @card-added="onCardAdded"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useIssuesStore } from '../stores/issues.js'
import { useProjectsStore } from '../stores/projects.js'
import { useUIStore } from '../stores/ui.js'
import BoardColumn from '../components/BoardColumn.vue'

const route         = useRoute()
const issuesStore   = useIssuesStore()
const projectsStore = useProjectsStore()
const uiStore       = useUIStore()

const projectId = computed(() => Number(route.params.projectId))
const project   = computed(() => projectsStore.projects.find(p => p.id === projectId.value))

const columns = [
  { status: 'backlog',     label: 'Backlog',      color: '#9980bb' },
  { status: 'todo',        label: 'To Do',        color: '#ff5eab' },
  { status: 'in_progress', label: 'In Progress',  color: '#9955ff' },
  { status: 'in_review',   label: 'In Review',    color: '#f0a800' },
  { status: 'done',        label: 'Done',         color: '#1ab87a' },
]

// Group issues by status from the store
const issuesByStatus = computed(() => issuesStore.issuesByStatus)

// Reload when project changes
watch(projectId, (id) => {
  issuesStore.fetchIssues(id)
}, { immediate: true })

async function onDragEnd({ status, localIssues }) {
  if (localIssues.length === 0) return
  const orderedIds = localIssues.map(i => i.id)
  await issuesStore.reorderIssues(projectId.value, orderedIds, status)
}

async function onCardAdded({ status, draggedId }) {
  if (!draggedId) return

  const idx = issuesStore.issues.findIndex(i => i.id === draggedId)
  if (idx !== -1) {
    issuesStore.issues[idx] = { ...issuesStore.issues[idx], status }
  }

  await issuesStore.updateIssueStatus(draggedId, status)

  const destinationColumn = issuesStore.issues
    .filter(i => i.status === status)
    .map(i => i.id)

  if (destinationColumn.length > 0) {
    await issuesStore.reorderIssues(projectId.value, destinationColumn, status)
  }
}

function openAddIssue(status) {
  uiStore.openCreateIssue({ status })
}
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.board-view {
  height: 100%;
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-6;
    flex-shrink: 0;
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
    align-items: center;
    gap: $space-3;
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

.board {
  display: flex;
  gap: $space-4;
  overflow-x: auto;
  flex: 1;
  align-items: flex-start;
  padding-bottom: $space-6;

  scrollbar-width: thin;
  scrollbar-color: $pink-200 transparent;

  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: $pink-200;
    border-radius: $radius-pill;
  }
}

.state-message {
  color: $gray-400;
  text-align: center;
  padding: $space-12;
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