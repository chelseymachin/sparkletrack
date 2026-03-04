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
            <div
              v-if="issue.description"
              class="description-content"
              v-html="issue.description"
            ></div>
            <p v-else class="description-empty">Add a description... (click to edit)</p>
          </div>
          <div v-else class="description-edit">
            <RichTextEditor
              v-model="descriptionDraft"
              @save="saveDescription"
            />
            <button
              class="btn btn--secondary btn--sm"
              style="margin-top: 8px"
              @click="editingDescription = false"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Activity feed -->
        <div class="issue-detail__section">
          <div class="section-label">Activity</div>

          <!-- Comment input -->
          <div class="comment-input">
            <textarea
              v-model="commentBody"
              class="comment-input__textarea"
              placeholder="Leave a comment..."
              rows="2"
              @keydown.meta.enter="submitComment"
            />
            <div class="comment-input__actions">
              <span class="comment-input__hint">⌘↵ to submit</span>
              <button
                class="btn btn--primary btn--sm"
                :disabled="!commentBody.trim() || submittingComment"
                @click="submitComment"
              >
                {{ submittingComment ? 'Posting...' : 'Comment' }}
              </button>
            </div>
          </div>

          <!-- Feed entries -->
          <div class="activity-feed">
            <div
              v-for="entry in issue.feed"
              :key="`${entry.feedType}-${entry.id}`"
              class="feed-entry"
              :class="`feed-entry--${entry.feedType}`"
            >
              <!-- Comment entry -->
              <template v-if="entry.feedType === 'comment'">
                <div class="feed-entry__dot dot--pink"></div>
                <div class="feed-entry__bubble">
                  <div class="feed-entry__comment-body" v-html="entry.body"></div>
                  <div class="feed-entry__meta">
                    <span class="feed-entry__time">{{ formatDateAndTime(entry.createdAt) }}</span>
                    <button
                      class="feed-entry__delete"
                      @click="deleteComment(entry.id)"
                    >
                      delete
                    </button>
                  </div>
                </div>
              </template>

              <!-- Activity entry -->
              <template v-else>
                <div
                  class="feed-entry__dot"
                  :class="entry.action === 'status_changed' ? 'dot--purple' : 'dot--pink'"
                ></div>
                <div class="feed-entry__content">
                  <span v-if="entry.action === 'status_changed'">
                    Status changed:
                    <StatusBadge :status="entry.fromValue" />
                    →
                    <StatusBadge :status="entry.toValue" />
                  </span>
                  <span v-else-if="entry.action === 'issue_created'">
                    Issue created with status
                    <StatusBadge :status="entry.toValue" />
                  </span>
                  <span v-else>{{ entry.action }}</span>
                </div>
                <div class="feed-entry__time">{{ formatDateAndTime(entry.createdAt) }}</div>
              </template>
            </div>

            <div v-if="!issue.feed?.length" class="activity-empty">
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
            <div class="sidebar-field__label">Labels</div>
            <LabelPicker
              :issue-id="issue.id"
              :selected-labels="issue.labels ?? []"
              :available-labels="labelsStore.labels"
              @add="addLabel"
              @remove="removeLabel"
            />
          </div>

          <div class="sidebar-field">
            <div class="sidebar-field__label">Created</div>
            <div class="sidebar-field__value">{{ formatDateAndTime(issue.createdAt) }}</div>
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
import { useLabelsStore } from '../stores/labels.js'
import { useUIStore } from '../stores/ui.js'
import StatusBadge from '../components/StatusBadge.vue'
import StatusDropdown from '../components/StatusDropdown.vue'
import RichTextEditor from '../components/RichTextEditor.vue'
import LabelPicker from '../components/LabelPicker.vue'
import LabelChip from '../components/LabelChip.vue'

const route       = useRoute()
const router      = useRouter()
const issuesStore = useIssuesStore()
const labelsStore = useLabelsStore()
const uiStore     = useUIStore()

const issue = computed(() => issuesStore.activeIssue)

// When the route key changes, fetch the issue
watch(
  () => route.params.key,
  (key) => {
    if (key) issuesStore.fetchIssueByKey(key)
  },
  { immediate: true }
)

// When the issue loads or status changes, fetch labels and refresh feed
watch(
  () => issue.value?.status,
  async (newStatus, oldStatus) => {
    if (issue.value?.projectId) {
      labelsStore.fetchLabels(issue.value.projectId)
    }
    if (newStatus && oldStatus && newStatus !== oldStatus) {
      await issuesStore.fetchIssueByKey(route.params.key)
    }
  },
  { immediate: true }
)

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

async function saveDescription(html) {
  editingDescription.value = false
  await issuesStore.updateIssue(issue.value.id, { description: html })
  await issuesStore.fetchIssueByKey(route.params.key)
}

// Field updates
async function updateField(field, value) {
  await issuesStore.updateIssue(issue.value.id, { [field]: value })
  await issuesStore.fetchIssueByKey(route.params.key)
}

// Labels
async function addLabel(labelId) {
  await issuesStore.addLabel(issue.value.id, labelId)
}

async function removeLabel(labelId) {
  await issuesStore.removeLabel(issue.value.id, labelId)
}

// Comments
const commentBody       = ref('')
const submittingComment = ref(false)

async function submitComment() {
  if (!commentBody.value.trim()) return
  submittingComment.value = true
  try {
    await issuesStore.addComment(issue.value.id, commentBody.value)
    commentBody.value = ''
  } catch {
    uiStore.toast.error('Failed to post comment')
  } finally {
    submittingComment.value = false
  }
}

async function deleteComment(commentId) {
  await issuesStore.deleteComment(commentId)
}

// Delete issue
async function handleDelete() {
  if (!confirm(`Delete ${issue.value.fullKey}? This cannot be undone.`)) return
  await issuesStore.deleteIssue(issue.value.id)
  uiStore.toast.success('Issue deleted')
  router.back()
}

function formatDateAndTime(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
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

    h1 {
      font-family: $font-display;
      font-size: 1.8rem;
      line-height: 1.2;
      color: $gray-800;
    }

    &:hover .edit-hint { opacity: 1; }
  }

  &__section { margin-bottom: $space-8; }
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
  transition: border-color 0.15s;

  &:hover { border-color: $pink-200; }
}

.description-content {
  font-size: 0.9rem;
  color: $gray-600;
  line-height: 1.6;

  :deep(p)      { margin: 0 0 $space-2; }
  :deep(strong) { font-weight: 700; }
  :deep(em)     { font-style: italic; }
  :deep(ul), :deep(ol) { padding-left: $space-5; margin: $space-2 0; }
  :deep(code) {
    background: $gray-100;
    border-radius: 4px;
    padding: 1px 6px;
    font-family: $font-mono;
    font-size: 0.85em;
  }
  :deep(pre) {
    background: $gray-800;
    color: $white;
    border-radius: $radius-sm;
    padding: $space-4;
    font-family: $font-mono;
    font-size: 0.85em;
    overflow-x: auto;
  }
}

.description-empty {
  color: $gray-400;
  font-style: italic;
  font-size: 0.9rem;
}

.comment-input {
  margin-bottom: $space-5;

  &__textarea {
    width: 100%;
    border: 1.5px solid $gray-200;
    border-radius: $radius-md;
    padding: $space-3;
    font-family: $font-body;
    font-size: 0.88rem;
    color: $gray-800;
    resize: vertical;
    outline: none;
    transition: border-color 0.15s;

    &:focus { border-color: $pink-400; }
    &::placeholder { color: $gray-400; }
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: $space-2;
  }

  &__hint { font-size: 0.72rem; color: $gray-400; }
}

.activity-feed {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.feed-entry {
  display: flex;
  gap: $space-3;
  align-items: flex-start;
  font-size: 0.82rem;
  color: $gray-600;

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 4px;

    &.dot--purple { background: $purple-400; }
    &.dot--pink   { background: $pink-400; }
  }

  &__bubble {
    flex: 1;
    background: $gray-50;
    border: 1px solid $gray-100;
    border-radius: $radius-md;
    padding: $space-3 $space-4;
  }

  &__comment-body {
    font-size: 0.88rem;
    color: $gray-800;
    line-height: 1.5;
    margin-bottom: $space-2;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: $space-3;
  }

  &__content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: $space-2;
    flex-wrap: wrap;
  }

  &__time {
    font-size: 0.72rem;
    color: $gray-400;
    white-space: nowrap;
  }

  &__delete {
    font-size: 0.72rem;
    color: $gray-400;
    &:hover { color: $coral-500; }
  }
}

.activity-empty {
  font-size: 0.82rem;
  color: $gray-400;
  font-style: italic;
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
    &:hover    { background: $pink-400; }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
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