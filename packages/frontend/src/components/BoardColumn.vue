<template>
  <div class="board-column">
    <!-- Column header -->
    <div class="board-column__header">
      <div class="board-column__title">
        <span class="board-column__dot" :style="{ background: color }"></span>
        <span class="board-column__label">{{ label }}</span>
        <span class="board-column__count" :style="{ background: color + '22', color: color }">
          {{ issues.length }}
        </span>
      </div>
    </div>

    <!-- Draggable issue cards -->
    <draggable
      v-model="localIssues"
      group="issues"
      item-key="id"
      class="board-column__cards"
      ghost-class="card-ghost"
      drag-class="card-dragging"
      @end="onDragEnd"
      @add="onAdd"
    >
      <template #item="{ element }">
        <IssueCard
          :issue="element"
          :project-color="projectColor"
          class="board-column__card"
        />
      </template>
    </draggable>

    <!-- Add issue button -->
    <button class="board-column__add" @click="$emit('add-issue', status)">
      + Add Issue
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import IssueCard from './IssueCard.vue'

const props = defineProps({
  status:       { type: String, required: true },
  label:        { type: String, required: true },
  color:        { type: String, required: true },
  issues:       { type: Array,  default: () => [] },
  projectColor: { type: String, default: '#ff5eab' },
})

const emit = defineEmits(['update:issues', 'drag-end', 'add-issue', 'card-added'])

// Local copy of issues so draggable can mutate it
const localIssues = ref([...props.issues])

// Keep local in sync when parent updates (e.g. after fetch)
watch(() => props.issues, (newIssues) => {
  localIssues.value = [...newIssues]
}, { deep: true })

function onDragEnd(event) {
  emit('drag-end', {
    status:      props.status,
    localIssues: localIssues.value,
    draggedId:   event.item?._underlying_vm_?.id,
    added:       event.added !== undefined,
    event,
  })
}

function onAdd(event) {
  const draggedId = event.item?._underlying_vm_?.id
  emit('card-added', {
    status:      props.status,
    draggedId,
    localIssues: localIssues.value,
  })
}

</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.board-column {
  min-width: 240px;
  max-width: 240px;
  display: flex;
  flex-direction: column;
  gap: $space-3;

  &__header {
    padding: 0 $space-1;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: $space-2;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__label {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: $gray-600;
  }

  &__count {
    font-size: 0.68rem;
    font-weight: 700;
    padding: 1px 7px;
    border-radius: $radius-pill;
    margin-left: $space-1;
  }

  &__cards {
    display: flex;
    flex-direction: column;
    gap: $space-2;
    min-height: 60px; // so empty columns are still droppable
    flex: 1;
  }

  &__card {
    // ensures ghost sizing matches real card
  }

  &__add {
    font-size: 0.78rem;
    color: $gray-400;
    padding: $space-2 $space-3;
    border-radius: $radius-sm;
    border: 1.5px dashed $gray-200;
    width: 100%;
    text-align: left;
    transition: color 0.15s, border-color 0.15s, background 0.15s;

    &:hover {
      color: $pink-400;
      border-color: $pink-300;
      background: $pink-50;
    }
  }
}

// Drag ghost styling
:global(.card-ghost) {
  opacity: 0.4;
  border: 1.5px dashed #ff5eab !important;
  background: #fff0f6 !important;
}

:global(.card-dragging) {
  box-shadow: 0 8px 24px rgba(122, 40, 180, 0.2) !important;
  transform: rotate(1deg) !important;
}
</style>