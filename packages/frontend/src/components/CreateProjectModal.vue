<template>
  <Teleport to="body">
    <div v-if="uiStore.createProjectModalOpen" class="modal-backdrop" @click.self="uiStore.closeCreateProject()">
      <div class="modal">
        <div class="modal__header">
          <h2>New Project 🌸</h2>
          <button class="modal__close" @click="uiStore.closeCreateProject()">✕</button>
        </div>

        <div class="modal__body">
          <!-- Name -->
          <div class="field">
            <label class="field__label">Project Name *</label>
            <input
              v-model="form.name"
              class="field__input"
              :class="{ 'field__input--error': errors.name }"
              placeholder="e.g. SparkleApp"
              @input="suggestPrefix"
            />
            <span v-if="errors.name" class="field__error">{{ errors.name }}</span>
          </div>

          <!-- Prefix -->
          <div class="field">
            <label class="field__label">
              Prefix *
              <span class="field__hint">2–6 uppercase letters, auto-suggested</span>
            </label>
            <div class="field__row">
              <input
                v-model="form.prefix"
                class="field__input field__input--mono"
                :class="{ 'field__input--error': errors.prefix }"
                placeholder="SPARK"
                maxlength="6"
                @input="form.prefix = form.prefix.toUpperCase()"
              />
              <span v-if="prefixAvailable === true" class="field__available">✓ Available</span>
              <span v-if="prefixAvailable === false" class="field__taken">✕ Taken</span>
            </div>
            <span v-if="errors.prefix" class="field__error">{{ errors.prefix }}</span>
          </div>

          <!-- Description -->
          <div class="field">
            <label class="field__label">Description <span class="field__hint">optional</span></label>
            <textarea
              v-model="form.description"
              class="field__input field__input--textarea"
              placeholder="What is this project about?"
              rows="2"
            />
          </div>

          <!-- Color -->
          <div class="field">
            <label class="field__label">Color</label>
            <div class="color-picker">
              <button
                v-for="color in colorOptions"
                :key="color"
                class="color-swatch"
                :class="{ 'color-swatch--active': form.color === color }"
                :style="{ background: color }"
                @click="form.color = color"
              />
            </div>
          </div>

          <!-- Icon -->
          <div class="field">
            <label class="field__label">Icon</label>
            <div class="icon-picker">
              <button
                v-for="emoji in iconOptions"
                :key="emoji"
                class="icon-option"
                :class="{ 'icon-option--active': form.icon === emoji }"
                @click="form.icon = emoji"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>

        <div class="modal__footer">
          <button class="btn btn--secondary" @click="uiStore.closeCreateProject()">Cancel</button>
          <button class="btn btn--primary" :disabled="submitting" @click="submit">
            {{ submitting ? 'Creating...' : 'Create Project 🌸' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUIStore } from '../stores/ui.js'
import { useProjectsStore } from '../stores/projects.js'

const uiStore = useUIStore()
const projectsStore = useProjectsStore()

const colorOptions = [
  '#ff5eab', '#eb2d8f', '#9955ff', '#7722e8',
  '#1ab87a', '#f0a800', '#e84420', '#5c4d7a',
]

const iconOptions = ['🌸', '💜', '✨', '🎀', '⚡', '🦋', '🌙', '💫', '🎯', '🔥', '🌈', '💎']

const form = reactive({
  name: '',
  prefix: '',
  description: '',
  color: '#ff5eab',
  icon: '🌸',
})

const errors = reactive({})
const submitting = ref(false)
const prefixAvailable = ref(null)

// Auto-suggest prefix from project name
function suggestPrefix() {
  if (!form.name) return
  const suggested = form.name
    .toUpperCase()
    .replace(/[^A-Z]/g, '')  // strip non-letters
    .slice(0, 5)
  form.prefix = suggested
  prefixAvailable.value = null

  // Check availability against existing projects
  checkPrefixAvailability()
}

function checkPrefixAvailability() {
  if (form.prefix.length < 2) {
    prefixAvailable.value = null
    return
  }
  const taken = projectsStore.projects.some(p => p.prefix === form.prefix)
  prefixAvailable.value = !taken
}

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])
  let valid = true

  if (!form.name.trim()) {
    errors.name = 'Project name is required'
    valid = false
  }
  if (!form.prefix) {
    errors.prefix = 'Prefix is required'
    valid = false
  } else if (form.prefix.length < 2 || form.prefix.length > 6) {
    errors.prefix = 'Prefix must be 2–6 characters'
    valid = false
  } else if (!/^[A-Z]+$/.test(form.prefix)) {
    errors.prefix = 'Prefix must be uppercase letters only'
    valid = false
  }

  return valid
}

async function submit() {
  if (!validate()) return

  submitting.value = true
  try {
    await projectsStore.createProject({ ...form })
    uiStore.toast.success(`Project "${form.name}" created! 🌸`)
    uiStore.closeCreateProject()
    // Reset form
    Object.assign(form, { name: '', prefix: '', description: '', color: '#ff5eab', icon: '🌸' })
    prefixAvailable.value = null
  } catch (e) {
    // Handle duplicate prefix error from API
    if (e.response?.status === 409) {
      errors.prefix = `"${form.prefix}" is already taken`
    } else {
      uiStore.toast.error('Something went wrong. Please try again.')
    }
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
      color: $gray-800;
    }
  }

  &__close {
    color: $gray-400;
    font-size: 1rem;
    padding: $space-1;
    border-radius: $radius-sm;
    &:hover { background: $gray-100; color: $gray-800; }
  }

  &__body {
    padding: $space-5 $space-6;
    display: flex;
    flex-direction: column;
    gap: $space-5;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: $space-3;
    padding: $space-4 $space-6 $space-6;
    border-top: 1px solid $gray-100;
  }
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
    transition: border-color 0.15s;
    outline: none;

    &:focus { border-color: $pink-400; }
    &--error { border-color: $coral-500; }
    &--mono { font-family: $font-mono; font-weight: 700; color: $pink-500; width: 120px; }
    &--textarea { resize: vertical; min-height: 60px; }
  }

  &__row {
    display: flex;
    align-items: center;
    gap: $space-3;
  }

  &__error    { font-size: 0.76rem; color: $coral-500; }
  &__available { font-size: 0.76rem; color: $mint-500; font-weight: 600; }
  &__taken     { font-size: 0.76rem; color: $coral-500; font-weight: 600; }
}

.color-picker {
  display: flex;
  gap: $space-2;
  flex-wrap: wrap;
}

.color-swatch {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2.5px solid transparent;
  transition: transform 0.1s, border-color 0.1s;

  &:hover { transform: scale(1.1); }
  &--active { border-color: $gray-800; transform: scale(1.1); }
}

.icon-picker {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
}

.icon-option {
  width: 36px;
  height: 36px;
  border-radius: $radius-sm;
  border: 1.5px solid $gray-200;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.1s, background 0.1s;

  &:hover { border-color: $pink-300; background: $pink-50; }
  &--active { border-color: $pink-400; background: $pink-100; }
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
    &:hover { background: $pink-400; }
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