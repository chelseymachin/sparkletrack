<template>
  <div class="status-dropdown" ref="dropdownRef">
    <StatusBadge
      :status="issue.status"
      class="status-dropdown__trigger"
      @click="open = !open"
    />
    <div v-if="open" class="status-dropdown__menu">
      <button
        v-for="option in statusOptions"
        :key="option.value"
        class="status-dropdown__option"
        :class="{ 'status-dropdown__option--active': issue.status === option.value }"
        @click="select(option.value)"
      >
        <StatusBadge :status="option.value" />
      </button>
    </div>
    <SparkleEffect :trigger="sparkle" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import StatusBadge from './StatusBadge.vue'
import { useIssuesStore } from '../stores/issues.js'
import { useUIStore } from '../stores/ui.js'
import SparkleEffect from './SparkleEffect.vue'

const props = defineProps({
  issue: { type: Object, required: true }
})

const issuesStore = useIssuesStore()
const uiStore     = useUIStore()
const open        = ref(false)
const dropdownRef = ref(null)
const sparkle = ref(false)

const statusOptions = [
  { value: 'backlog'     },
  { value: 'todo'        },
  { value: 'in_progress' },
  { value: 'in_review'   },
  { value: 'done'        },
]

async function select(status) {
  open.value = false
  if (status === props.issue.status) return
  try {
    await issuesStore.updateIssueStatus(props.issue.id, status)

    if (status === 'done') {
      console.log('triggering sparkle')
      sparkle.value = true
      setTimeout(() => sparkle.value = false, 1500)
    }
  } catch {
    uiStore.toast.error('Failed to update status')
  }
}

// Close on outside click
function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(()  => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.status-dropdown {
  position: relative;
  display: inline-block;

  &__trigger {
    cursor: pointer;
    &:hover { opacity: 0.8; }
  }

  &__menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    background: $white;
    border: 1.5px solid $gray-100;
    border-radius: $radius-md;
    box-shadow: $shadow-md;
    z-index: 50;
    min-width: 140px;
    padding: $space-2;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__option {
    padding: $space-2 $space-3;
    border-radius: $radius-sm;
    text-align: left;
    width: 100%;

    &:hover           { background: $gray-50; }
    &--active         { background: $pink-50; }
  }
}
</style>