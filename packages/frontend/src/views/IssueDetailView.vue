<template>
  <div v-if="issuesStore.loading" class="state-message">Loading issue...</div>

  <div v-else-if="!issuesStore.activeIssue" class="state-message">
    Issue not found.
    <RouterLink to="/projects">← Back to projects</RouterLink>
  </div>

  <div v-else class="issue-detail">
    <!-- Header -->
    <div class="issue-detail__header">
      <button class="back-btn" @click="$router.back()">← Back</button>
      <div class="issue-detail__key" :style="{ color: issue.projectColor }">
        {{ issue.fullKey }}
      </div>
    </div>

    <div class="issue-detail__body">
      <!-- Main content -->
      <div class="issue-detail__main">
        <!-- Title -->
        <div v-if="!editingTitle" class="issue-detail__title" @click="startEditTitle">
          <h1>{{ issue.title }}</h1>
          <span class="edit-hint">click to edit</span>
        </div>
        <div v-else class="issue-detail__title-edit">
          <input
            v-model="titleDraft"
            class="title-input"
            @keyup.enter="saveTitle"
            @keyup.escape="editingTitle = false"
            @blur="saveTitle"
            autofocus
          />
        </div>

        <!-- Description -->
        <div class="issue-detail__section">
          <div class="section-label">Description</div>
          <div v-if="!editingDescription" class="description-display" @click="startEditDescription">
            <p v-if="issue.description" v-html="issue.description"></p>
            <p v-else class="description-empty">Add a description... (click to edit)</p>
          </div>
          <div v-else class="description-edit">
            <textarea
              v-model="descriptionDraft"
              class="description-textarea"
              rows="6"
              @blur="saveDescription"
            />
            <div class="description-edit__actions">
              <button class="btn btn--primary btn--sm" @click="saveDescription">Save</button>
              <button class="btn btn--secondary btn--sm" @click="editingDescription = false">Cancel</button>
            </div>
          </div>
        </div>

        <!-- Activity log -->
        <div class="issue-detail__section">
          <div class="section-label">Activity</div>
          <div class="activity-feed">
            <div
              v-for="entry in (issue.activity ?? [])"
              :key="entry.id"
              class="activity-entry"
            >
              <div class="activity-entry__dot"
                :class="entry.action === 'status_changed' ? 'dot--purple' : 'dot--pink'"
              ></div>
              <div class="activity-entry__content">
                <span v-if="entry.action === 'status_changed'">
                  Status changed:
                  <StatusBadge :status="entry.fromValue" />
                  →
                  <StatusBadge :status="entry.toValue" />
                </span>
                <span v-else-if="entry.action === 'issue_created'">
                  Issue created with status <StatusBadge :status="entry.toValue" />
                </span>
                <span v-else>{{ entry.action }}</span>
              </div>
              <div class="activity-entry__time">{{ formatDate(entry.createdAt) }}</div>
            </div>
            <div v-if="!issue.activity?.length" class="activity-empty">
              No activity yet.
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="issue-detail__sidebar">
        <div class="sidebar-card">
          <div class="sidebar-field">
            <div class="sidebar-field__label">Status</div>
            <StatusDropdown :issue="issue" />
          </div>

          <div class="sidebar-field">
            <div class="sidebar-field__label">Priority</div>
            <select
              :value="issue.priority"
              class="sidebar-select"
              @change="updateField('priority', $event.target.value)"
            >
              <option value="low">↓ Low</option>
              <option value="medium">→ Medium</option>
              <option value="high">↑ High</option>
              <option value="critical">‼ Critical</option>
            </select>
          </div>

          <div class="sidebar-field">
            <div class="sidebar-field__label">Type</div>
            <select
              :value="issue.type"
              class="sidebar-select"
              @change="updateField('type', $event.target.value)"
            >
              <option value="bug">🐛 Bug</option>
              <option value="feature">✦ Feature</option>
              <option value="task">✓ Task</option>
              <option value="chore">⚙ Chore</option>
            </select>
          </div>

          <div class="sidebar-field">
            <div class="sidebar-field__label">Created</div>
            <div class="sidebar-field__value">{{ formatDate(issue.createdAt) }}</div>
          </div>

          <div class="sidebar-field">
            <div class="sidebar-field__label">Project</div>
            <div class="sidebar-field__value">
              {{ issue.projectIcon }} {{ issue.projectName }}
            </div>
          </div>
        </div>

        <button class="delete-btn" @click="handleDelete">Delete issue</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useIssuesStore } from '../stores/issues.js'
import { useUIStore } from '../stores/ui.js'
import StatusBadge from '../components/StatusBadge.vue'
import StatusDropdown from '../components/StatusDropdown.vue'
import PriorityBadge from '../components/PriorityBadge.vue'

const route       = useRoute()
const router      = useRouter()
const issuesStore = useIssuesStore()
const uiStore     = useUIStore()

const issue = computed(() => issuesStore.activeIssue)

// Title editing
const editingTitle = ref(false)
const titleDraft   = ref('')

function startEditTitle() {
  titleDraft.value = issue.value.title
  editingTitle.value = true
}

async function saveTitle() {
  editingTitle.value = false
  if (titleDraft.value.trim() && titleDraft.value !== issue.value.title) {
    await issuesStore.updateIssue(issue.value.id, { title: titleDraft.value.trim() })
  }
}

// Description editing
const editingDescription = ref(false)
const descriptionDraft   = ref('')

function startEditDescription() {
  descriptionDraft.value = issue.value.description ?? ''
  editingDescription.value = true
}

async function saveDescription() {
  editingDescription.value = false
  await issuesStore.updateIssue(issue.value.id, { description: descriptionDraft.value })
  // Refresh to get updated activity log
  await issuesStore.fetchIssueByKey(route.params.key)
}

async function updateField(field, value) {
  await issuesStore.updateIssue(issue.value.id, { [field]: value })
  await issuesStore.fetchIssueByKey(route.params.key)
}

async function handleDelete() {
  if (!confirm(`Delete ${issue.value.fullKey}? This cannot be undone.`)) return
  await issuesStore.deleteIssue(issue.value.id)
  uiStore.toast.success('Issue deleted')
  router.back()
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

watch(
  () => route.params.key,
  (key) => {
    if (key) issuesStore.fetchIssueByKey(key)
  }, { immediate: true }
)
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.issue-detail {
  max-width: 960px;

  &__header {
    display: flex;
    align-items: center;
    gap: $space-4;
    margin-bottom: $space-6;
  }

  &__key {
    font-family: $font-mono;
    font-size: 0.9rem;
    font-weight: 700;
    background: $gray-50;
    padding: 4px 12px;
    border-radius: $radius-pill;
    border: 1.5px solid $gray-100;
  }

  &__body {
    display: grid;
    grid-template-columns: 1fr 260px;
    gap: $space-8;
    align-items: flex-start;
  }

  &__title {
    display: flex;
    align-items: flex-start;
    gap: $space-3;
    margin-bottom: $space-6;
    cursor: pointer;
    group: true;

    h1 {
      font-family: $font-display;
      font-size: 1.8rem;
      line-height: 1.2;
      color: $gray-800;
    }

    &:hover .edit-hint { opacity: 1; }
  }

  &__section {
    margin-bottom: $space-8;
  }
}

.edit-hint {
  font-size: 0.72rem;
  color: $gray-400;
  opacity: 0;
  transition: opacity 0.15s;
  margin-top: 8px;
  white-space: nowrap;
}

.title-input {
  width: 100%;
  font-family: $font-display;
  font-size: 1.8rem;
  border: none;
  border-bottom: 2px solid $pink-400;
  outline: none;
  background: transparent;
  color: $gray-800;
  padding-bottom: $space-2;
  margin-bottom: $space-6;
}

.section-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $gray-400;
  margin-bottom: $space-3;
}

.description-display {
  background: $gray-50;
  border: 1.5px solid $gray-100;
  border-radius: $radius-md;
  padding: $space-4 $space-5;
  cursor: pointer;
  min-height: 80px;

  &:hover { border-color: $pink-200; }

  p { font-size: 0.9rem; color: $gray-600; line-height: 1.6; }
}

.description-empty {
  color: $gray-400 !important;
  font-style: italic;
}

.description-textarea {
  width: 100%;
  border: 1.5px solid $pink-300;
  border-radius: $radius-md;
  padding: $space-4;
  font-family: $font-body;
  font-size: 0.9rem;
  color: $gray-800;
  resize: vertical;
  outline: none;
  background: $white;
}

.description-edit__actions {
  display: flex;
  gap: $space-2;
  margin-top: $space-2;
}

.back-btn {
  font-size: 0.82rem;
  color: $gray-400;
  padding: 6px $space-3;
  border-radius: $radius-pill;
  border: 1.5px solid $gray-200;

  &:hover { color: $pink-500; border-color: $pink-200; }
}

.sidebar-card {
  background: $white;
  border: 1.5px solid $gray-100;
  border-radius: $radius-lg;
  padding: $space-5;
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.sidebar-field {
  &__label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: $gray-400;
    margin-bottom: $space-2;
  }

  &__value {
    font-size: 0.85rem;
    color: $gray-600;
  }
}

.sidebar-select {
  border: 1.5px solid $gray-200;
  border-radius: $radius-sm;
  padding: 7px $space-3;
  font-size: 0.82rem;
  font-family: $font-body;
  color: $gray-800;
  background: $white;
  outline: none;
  width: 100%;
  cursor: pointer;

  &:focus { border-color: $pink-300; }
}

.activity-feed {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.activity-entry {
  display: flex;
  align-items: center;
  gap: $space-3;
  font-size: 0.82rem;
  color: $gray-600;

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;

    &.dot--purple { background: $purple-400; }
    &.dot--pink   { background: $pink-400; }
  }

  &__content { flex: 1; display: flex; align-items: center; gap: $space-2; flex-wrap: wrap; }
  &__time    { font-size: 0.72rem; color: $gray-400; white-space: nowrap; }
}

.activity-empty {
  font-size: 0.82rem;
  color: $gray-400;
  font-style: italic;
}

.delete-btn {
  margin-top: $space-3;
  width: 100%;
  padding: 8px;
  border-radius: $radius-md;
  font-size: 0.8rem;
  color: $coral-500;
  border: 1.5px solid $coral-200;
  background: $white;

  &:hover { background: $coral-100; }
}

.state-message {
  text-align: center;
  padding: $space-12;
  color: $gray-400;
}

.btn {
  padding: 7px $space-4;
  border-radius: $radius-pill;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: $font-body;

  &--primary {
    background: $pink-500;
    color: $white;
    &:hover { background: $pink-400; }
  }

  &--secondary {
    background: $white;
    color: $purple-500;
    border: 1.5px solid $purple-200;
    &:hover { background: $purple-50; }
  }

  &--sm { padding: 5px $space-3; font-size: 0.76rem; }
}
</style>