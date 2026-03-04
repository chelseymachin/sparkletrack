<template>
  <div class="label-manager">
    <div class="label-manager__header">
      <h3>Labels</h3>
      <button class="btn btn--primary btn--sm" @click="showCreate = true">
        + New Label
      </button>
    </div>

    <!-- Create form -->
    <div v-if="showCreate" class="label-form">
      <input
        v-model="newLabel.name"
        class="label-form__input"
        placeholder="Label name"
      />
      <div class="label-form__colors">
        <button
          v-for="color in colorOptions"
          :key="color"
          class="color-swatch"
          :class="{ 'color-swatch--active': newLabel.color === color }"
          :style="{ background: color }"
          @click="newLabel.color = color"
        />
      </div>
      <div class="label-form__actions">
        <button class="btn btn--primary btn--sm" @click="createLabel">Create</button>
        <button class="btn btn--secondary btn--sm" @click="showCreate = false">Cancel</button>
      </div>
    </div>

    <!-- Label list -->
    <div class="label-list">
      <div
        v-for="label in labelsStore.labels"
        :key="label.id"
        class="label-item"
      >
        <LabelChip :name="label.name" :color="label.color" />
        <button
          class="label-item__delete"
          @click="labelsStore.deleteLabel(label.id)"
        >
          ✕
        </button>
      </div>
      <div v-if="labelsStore.labels.length === 0" class="label-list__empty">
        No labels yet. Create one above.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useLabelsStore } from '../stores/labels.js'
import LabelChip from './LabelChip.vue'

const props = defineProps({
  projectId: { type: Number, required: true }
})

const labelsStore = useLabelsStore()

const showCreate = ref(false)
const newLabel = reactive({ name: '', color: '#ff5eab' })

const colorOptions = [
  '#ff5eab', '#eb2d8f', '#9955ff', '#7722e8',
  '#1ab87a', '#f0a800', '#e84420', '#5c4d7a',
]

onMounted(() => {
  labelsStore.fetchLabels(props.projectId)
})

async function createLabel() {
  if (!newLabel.name.trim()) return
  await labelsStore.createLabel(props.projectId, { ...newLabel })
  newLabel.name = ''
  newLabel.color = '#ff5eab'
  showCreate.value = false
}
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.label-manager {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-4;

    h3 {
      font-family: $font-display;
      font-size: 1.1rem;
      color: $gray-800;
    }
  }
}

.label-form {
  background: $gray-50;
  border: 1.5px solid $gray-100;
  border-radius: $radius-md;
  padding: $space-4;
  margin-bottom: $space-4;
  display: flex;
  flex-direction: column;
  gap: $space-3;

  &__input {
    border: 1.5px solid $gray-200;
    border-radius: $radius-sm;
    padding: 8px $space-3;
    font-size: 0.88rem;
    font-family: $font-body;
    outline: none;

    &:focus { border-color: $pink-400; }
  }

  &__colors {
    display: flex;
    gap: $space-2;
  }

  &__actions {
    display: flex;
    gap: $space-2;
  }
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: transform 0.1s, border-color 0.1s;

  &:hover { transform: scale(1.1); }
  &--active { border-color: $gray-800; }
}

.label-list {
  display: flex;
  flex-direction: column;
  gap: $space-2;

  &__empty {
    font-size: 0.82rem;
    color: $gray-400;
    font-style: italic;
  }
}

.label-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-2 $space-3;
  border: 1px solid $gray-100;
  border-radius: $radius-sm;
  background: $white;

  &__delete {
    font-size: 0.75rem;
    color: $gray-400;
    padding: 2px 6px;
    border-radius: 4px;
    opacity: 0;

    .label-item:hover & { opacity: 1; }
    &:hover { color: $coral-500; background: $coral-100; }
  }
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