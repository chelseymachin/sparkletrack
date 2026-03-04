<template>
  <Teleport to="body">
    <div v-if="uiStore.createIssueModalOpen" class="modal-backdrop" @click.self="uiStore.closeCreateIssue()">
      <div class="modal">
        <div class="modal__header">
          <h2>New Issue ✦</h2>
          <button class="modal__close" @click="uiStore.closeCreateIssue()">✕</button>
        </div>

        <div class="modal__body">
          <!-- Project -->
          <div class="field">
            <label class="field__label">Project *</label>
            <select
              v-model="selectedProjectId"
              class="field__input"
              :class="{ 'field__input--error': errors.project }"
            >
              <option value="">Select a project...</option>
              <option
                v-for="project in projectsStore.projects"
                :key="project.id"
                :value="project.id"
              >
                {{ project.icon }} {{ project.name }} ({{ project.prefix }})
              </option>
            </select>
            <span v-if="errors.project" class="field__error">{{ errors.project }}</span>
          </div>

          <!-- Title -->
          <div class="field">
            <label class="field__label">Title *</label>
            <input
              v-model="form.title"
              class="field__input"
              :class="{ 'field__input--error': errors.title }"
              placeholder="e.g. Fix cart modal overlay"
            />
            <span v-if="errors.title" class="field__error">{{ errors.title }}</span>
          </div>

          <!-- Type + Priority -->
          <div class="field-row">
            <div class="field">
              <label class="field__label">Type</label>
              <select v-model="form.type" class="field__input">
                <option value="bug">🐛 Bug</option>
                <option value="feature">✦ Feature</option>
                <option value="task">✓ Task</option>
                <option value="chore">⚙ Chore</option>
              </select>
            </div>
            <div class="field">
              <label class="field__label">Priority</label>
              <select v-model="form.priority" class="field__input">
                <option value="low">↓ Low</option>
                <option value="medium">→ Medium</option>
                <option value="high">↑ High</option>
                <option value="critical">‼ Critical</option>
              </select>
            </div>
          </div>

          <!-- Status -->
          <div class="field">
            <label class="field__label">Status</label>
            <select v-model="form.status" class="field__input">
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <!-- Description -->
          <div class="field">
            <label class="field__label">Description <span class="field__hint">optional</span></label>
            <textarea
              v-model="form.description"
              class="field__input field__input--textarea"
              placeholder="Add more details..."
              rows="3"
            />
          </div>
        </div>

        <div class="modal__footer">
          <button class="btn btn--secondary" @click="uiStore.closeCreateIssue()">Cancel</button>
          <button class="btn btn--primary" :disabled="submitting" @click="submit">
            {{ submitting ? 'Creating...' : 'Create Issue ✦' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useUIStore } from '../stores/ui.js'
import { useIssuesStore } from '../stores/issues.js'
import { useProjectsStore } from '../stores/projects.js'
import { useRoute } from 'vue-router'

const uiStore       = useUIStore()
const issuesStore   = useIssuesStore()
const projectsStore = useProjectsStore()
const route         = useRoute()

const form = reactive({
  title:       '',
  type:        'task',
  priority:    'medium',
  status:      'backlog',
  description: '',
})

const errors            = reactive({})
const submitting        = ref(false)
const selectedProjectId = ref('')

// Pre-select project from route if we're inside a project view,
// and reset form state every time the modal opens
watch(
  () => uiStore.createIssueModalOpen,
  (isOpen) => {
    if (isOpen) {
      const routeProjectId = Number(route.params.projectId)
      selectedProjectId.value = routeProjectId || ''
      // Clear any leftover errors from previous open
      Object.keys(errors).forEach(k => delete errors[k])
    }
  }
)

// Pre-fill status if modal was opened from a board column
watch(() => uiStore.createIssueDefaults, (defaults) => {
  if (defaults.status) form.status = defaults.status
}, { deep: true })

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])
  let valid = true

  if (!selectedProjectId.value) {
    errors.project = 'Please select a project'
    valid = false
  }
  if (!form.title.trim()) {
    errors.title = 'Title is required'
    valid = false
  }
  return valid
}

async function submit() {
  if (!validate()) return

  submitting.value = true
  try {
    await issuesStore.createIssue(selectedProjectId.value, { ...form })
    uiStore.toast.success('Issue created! ✦')
    uiStore.closeCreateIssue()
    Object.assign(form, {
      title:       '',
      type:        'task',
      priority:    'medium',
      status:      'backlog',
      description: '',
    })
    selectedProjectId.value = ''
  } catch (e) {
    uiStore.toast.error('Failed to create issue.')
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(45, 31, 74, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: $white;
  border: 1.5px solid $pink-100;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $space-6 $space-6 $space-4;
    border-bottom: 1px solid $gray-100;

    h2 {
      font-family: $font-display;
      font-size: 1.3rem;
    }
  }

  &__close {
    color: $gray-400;
    padding: $space-1;
    border-radius: $radius-sm;
    &:hover { background: $gray-100; color: $gray-800; }
  }

  &__body {
    padding: $space-5 $space-6;
    display: flex;
    flex-direction: column;
    gap: $space-4;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: $space-3;
    padding: $space-4 $space-6 $space-6;
    border-top: 1px solid $gray-100;
  }
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-4;
}

.field {
  display: flex;
  flex-direction: column;
  gap: $space-2;

  &__label {
    font-size: 0.78rem;
    font-weight: 600;
    color: $gray-600;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  &__hint {
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
    color: $gray-400;
    margin-left: $space-2;
  }

  &__input {
    border: 1.5px solid $gray-200;
    border-radius: $radius-sm;
    padding: 9px $space-3;
    font-size: 0.88rem;
    font-family: $font-body;
    color: $gray-800;
    background: $white;
    outline: none;
    transition: border-color 0.15s;

    &:focus     { border-color: $pink-400; }
    &--error    { border-color: $coral-500; }
    &--textarea { resize: vertical; min-height: 80px; }
  }

  &__error { font-size: 0.76rem; color: $coral-500; }
}

.btn {
  padding: 9px $space-5;
  border-radius: $radius-pill;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: $font-body;
  transition: background 0.15s, opacity 0.15s;

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
}
</style>