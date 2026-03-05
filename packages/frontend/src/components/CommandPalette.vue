<template>
  <Teleport to="body">
    <Transition name="palette">
      <div v-if="uiStore.searchOpen" class="palette-overlay" @click.self="close">
        <div class="palette">
          <div class="palette__search">
            <span class="palette__icon">🔍</span>
            <input
              ref="inputRef"
              v-model="query"
              class="palette__input"
              placeholder="Search issues, projects..."
              @keydown.escape="close"
              @keydown.down.prevent="moveDown"
              @keydown.up.prevent="moveUp"
              @keydown.enter="selectActive"
            />
            <kbd class="palette__esc">esc</kbd>
          </div>

          <div v-if="loading" class="palette__loading">Searching...</div>

          <div v-else-if="query.length >= 2" class="palette__results">
            <!-- Issues -->
            <div v-if="results.issues?.length" class="palette__group">
              <div class="palette__group-label">Issues</div>
              <div
                v-for="(issue, i) in results.issues"
                :key="`issue-${issue.id}`"
                class="palette__item"
                :class="{ 'palette__item--active': activeIndex === i }"
                @click="goToIssue(issue)"
                @mouseenter="activeIndex = i"
              >
                <span
                  class="palette__item-key"
                  :style="{ color: issue.projectColor }"
                >
                  {{ issue.fullKey }}
                </span>
                <span class="palette__item-title">{{ issue.title }}</span>
                <StatusBadge :status="issue.status" />
              </div>
            </div>

            <!-- Projects -->
            <div v-if="results.projects?.length" class="palette__group">
              <div class="palette__group-label">Projects</div>
              <div
                v-for="(project, i) in results.projects"
                :key="`project-${project.id}`"
                class="palette__item"
                :class="{ 'palette__item--active': activeIndex === results.issues.length + i }"
                @click="goToProject(project)"
                @mouseenter="activeIndex = results.issues.length + i"
              >
                <span class="palette__item-icon">{{ project.icon }}</span>
                <span class="palette__item-title">{{ project.name }}</span>
                <span
                  class="palette__item-prefix"
                  :style="{ color: project.color }"
                >
                  {{ project.prefix }}
                </span>
              </div>
            </div>

            <div
              v-if="!results.issues?.length && !results.projects?.length"
              class="palette__empty"
            >
              No results for "{{ query }}"
            </div>
          </div>

          <!-- Shortcuts hint -->
          <div class="palette__footer">
            <span><kbd>↑↓</kbd> navigate</span>
            <span><kbd>↵</kbd> select</span>
            <span><kbd>esc</kbd> close</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '../stores/ui.js'
import StatusBadge from './StatusBadge.vue'
import api from '../api/axios.js'

const router  = useRouter()
const uiStore = useUIStore()

const query       = ref('')
const results     = ref({ issues: [], projects: [] })
const loading     = ref(false)
const activeIndex = ref(0)
const inputRef    = ref(null)

let debounceTimer = null

watch(query, (val) => {
  clearTimeout(debounceTimer)
  activeIndex.value = 0
  if (val.length < 2) {
    results.value = { issues: [], projects: [] }
    return
  }
  loading.value = true
  debounceTimer = setTimeout(async () => {
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(val)}`)
      results.value = res.data
    } finally {
      loading.value = false
    }
  }, 200)
})

// Focus input when palette opens
watch(() => uiStore.searchOpen, async (open) => {
  if (open) {
    query.value = ''
    results.value = { issues: [], projects: [] }
    await nextTick()
    inputRef.value?.focus()
  }
})

const totalResults = () =>
  (results.value.issues?.length ?? 0) + (results.value.projects?.length ?? 0)

function moveDown() {
  activeIndex.value = (activeIndex.value + 1) % Math.max(totalResults(), 1)
}

function moveUp() {
  activeIndex.value = (activeIndex.value - 1 + Math.max(totalResults(), 1)) % Math.max(totalResults(), 1)
}

function selectActive() {
  const issueCount = results.value.issues?.length ?? 0
  if (activeIndex.value < issueCount) {
    goToIssue(results.value.issues[activeIndex.value])
  } else {
    const projectIdx = activeIndex.value - issueCount
    if (results.value.projects?.[projectIdx]) {
      goToProject(results.value.projects[projectIdx])
    }
  }
}

function goToIssue(issue) {
  router.push(`/issues/${issue.fullKey}`)
  close()
}

function goToProject(project) {
  router.push(`/projects/${project.id}/board`)
  close()
}

function close() {
  uiStore.searchOpen = false
}
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.palette-overlay {
  position: fixed;
  inset: 0;
  background: rgba(45, 31, 74, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

.palette {
  width: 560px;
  background: $white;
  border-radius: $radius-lg;
  border: 1.5px solid $gray-100;
  box-shadow: 0 24px 64px rgba(45, 31, 74, 0.2);
  overflow: hidden;

  &__search {
    display: flex;
    align-items: center;
    gap: $space-3;
    padding: $space-4 $space-5;
    border-bottom: 1.5px solid $gray-100;
  }

  &__icon { font-size: 1rem; flex-shrink: 0; }

  &__input {
    flex: 1;
    font-family: $font-body;
    font-size: 1rem;
    color: $gray-800;
    border: none;
    outline: none;
    background: transparent;

    &::placeholder { color: $gray-400; }
  }

  &__esc {
    font-size: 0.68rem;
    background: $gray-100;
    color: $gray-400;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: $font-mono;
  }

  &__loading {
    padding: $space-4 $space-5;
    font-size: 0.85rem;
    color: $gray-400;
    text-align: center;
  }

  &__results { max-height: 360px; overflow-y: auto; }

  &__group { padding: $space-2 0; }

  &__group-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: $gray-400;
    padding: $space-2 $space-5;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: $space-3;
    padding: $space-3 $space-5;
    cursor: pointer;
    transition: background 0.1s;

    &:hover,
    &--active { background: $pink-50; }

    &-key {
      font-family: $font-mono;
      font-size: 0.75rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    &-title {
      flex: 1;
      font-size: 0.88rem;
      color: $gray-800;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &-icon { flex-shrink: 0; }

    &-prefix {
      font-family: $font-mono;
      font-size: 0.68rem;
      font-weight: 700;
    }
  }

  &__empty {
    padding: $space-6;
    text-align: center;
    font-size: 0.85rem;
    color: $gray-400;
  }

  &__footer {
    display: flex;
    gap: $space-5;
    padding: $space-3 $space-5;
    border-top: 1.5px solid $gray-100;
    background: $gray-50;

    span {
      display: flex;
      align-items: center;
      gap: $space-1;
      font-size: 0.72rem;
      color: $gray-400;
    }

    kbd {
      background: $white;
      border: 1px solid $gray-200;
      border-radius: 4px;
      padding: 1px 5px;
      font-family: $font-mono;
      font-size: 0.68rem;
      color: $gray-600;
    }
  }
}

// Transition
.palette-enter-active,
.palette-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.palette-enter-from,
.palette-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>