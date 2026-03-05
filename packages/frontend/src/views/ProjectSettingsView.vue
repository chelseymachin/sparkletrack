<template>
  <div class="settings-view">
    <div class="settings-view__header">
      <button class="back-btn" @click="$router.back()">← Back</button>
      <h1>{{ project?.name }} Settings</h1>
    </div>

    <div class="settings-view__body">
      <div class="settings-section">
        <LabelManager :project-id="projectId" />
      </div>

      <!-- Danger zone -->
      <div class="settings-section settings-section--danger">
        <div class="danger-zone__header">
          <h3>Danger Zone</h3>
          <p>These actions are irreversible. Please be certain.</p>
        </div>
        <div class="danger-zone__action">
          <div class="danger-zone__info">
            <strong>Delete this project</strong>
            <p>Permanently removes the project and all its issues from view.</p>
          </div>
          <button class="btn btn--danger" @click="showConfirm = true">
            Delete Project
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmation modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showConfirm" class="modal-overlay" @click.self="showConfirm = false">
          <div class="confirm-modal">
            <div class="confirm-modal__header">
              <h2>Delete {{ project?.name }}?</h2>
            </div>
            <div class="confirm-modal__body">
              <p>
                This will archive the project and all of its issues.
                They won't appear in the app but can still be found in the database.
              </p>
              <p class="confirm-modal__warning">
                Type <strong>{{ project?.name }}</strong> to confirm:
              </p>
              <input
                v-model="confirmName"
                class="confirm-modal__input"
                :placeholder="project?.name"
                @keyup.escape="showConfirm = false"
              />
            </div>
            <div class="confirm-modal__actions">
              <button class="btn btn--secondary" @click="showConfirm = false">
                Cancel
              </button>
              <button
                class="btn btn--danger"
                :disabled="confirmName !== project?.name || deleting"
                @click="deleteProject"
              >
                {{ deleting ? 'Deleting...' : 'Delete Project' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '../stores/projects.js'
import LabelManager from '../components/LabelManager.vue'

const route         = useRoute()
const router        = useRouter()
const projectsStore = useProjectsStore()

const projectId = computed(() => Number(route.params.projectId))
const project   = computed(() => projectsStore.projects.find(p => p.id === projectId.value))

const showConfirm = ref(false)
const confirmName = ref('')
const deleting    = ref(false)

async function deleteProject() {
  if (confirmName.value !== project.value?.name) return
  deleting.value = true
  try {
    await projectsStore.archiveProject(projectId.value)
    router.push('/')
  } finally {
    deleting.value = false
    showConfirm.value = false
  }
}
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.settings-view {
  max-width: 640px;

  &__header {
    display: flex;
    align-items: center;
    gap: $space-4;
    margin-bottom: $space-8;

    h1 {
      font-family: $font-display;
      font-size: 1.8rem;
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: $space-6;
  }
}

.settings-section {
  background: $white;
  border: 1.5px solid $gray-100;
  border-radius: $radius-lg;
  padding: $space-6;

  &--danger {
    border-color: $coral-200;
  }
}

.danger-zone {
  &__header {
    margin-bottom: $space-5;

    h3 {
      font-family: $font-display;
      font-size: 1.1rem;
      color: $coral-500;
      margin-bottom: $space-1;
    }

    p { font-size: 0.82rem; color: $gray-400; }
  }

  &__action {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-4;
    padding: $space-4;
    border: 1.5px solid $coral-100;
    border-radius: $radius-md;
    background: $coral-50;
  }

  &__info {
    strong {
      font-size: 0.88rem;
      color: $gray-800;
      display: block;
      margin-bottom: 2px;
    }
    p { font-size: 0.78rem; color: $gray-400; }
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(45, 31, 74, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-modal {
  background: $white;
  border-radius: $radius-lg;
  border: 1.5px solid $gray-100;
  box-shadow: 0 24px 64px rgba(45, 31, 74, 0.2);
  width: 440px;
  overflow: hidden;

  &__header {
    padding: $space-5 $space-6;
    border-bottom: 1.5px solid $gray-100;

    h2 {
      font-family: $font-display;
      font-size: 1.2rem;
      color: $coral-500;
    }
  }

  &__body {
    padding: $space-5 $space-6;
    display: flex;
    flex-direction: column;
    gap: $space-3;

    p { font-size: 0.88rem; color: $gray-600; line-height: 1.5; }
  }

  &__warning {
    font-size: 0.82rem;
    color: $gray-600;

    strong { color: $gray-800; }
  }

  &__input {
    border: 1.5px solid $gray-200;
    border-radius: $radius-sm;
    padding: 8px $space-3;
    font-size: 0.88rem;
    font-family: $font-body;
    outline: none;
    width: 100%;

    &:focus { border-color: $coral-300; }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: $space-3;
    padding: $space-4 $space-6;
    border-top: 1.5px solid $gray-100;
    background: $gray-50;
  }
}

.back-btn {
  font-size: 0.82rem;
  color: $gray-400;
  padding: 6px $space-3;
  border-radius: $radius-pill;
  border: 1.5px solid $gray-200;

  &:hover { color: $pink-500; border-color: $pink-200; }
}

.btn {
  padding: 8px $space-5;
  border-radius: $radius-pill;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: $font-body;

  &--secondary {
    background: $white;
    color: $gray-600;
    border: 1.5px solid $gray-200;
    &:hover { background: $gray-50; }
  }

  &--danger {
    background: $coral-500;
    color: $white;
    &:hover    { background: $coral-400; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
}

.modal-enter-active,
.modal-leave-active { transition: opacity 0.15s, transform 0.15s; }
.modal-enter-from,
.modal-leave-to     { opacity: 0; transform: scale(0.96); }
</style>