<template>
  <div class="label-picker" ref="pickerRef">
    <!-- Current labels -->
    <div class="label-picker__current" @click="open = !open">
      <span v-if="selectedLabels.length === 0" class="label-picker__placeholder">
        Add labels...
      </span>
      <LabelChip
        v-for="label in selectedLabels"
        :key="label.id"
        :name="label.name"
        :color="label.color"
      />
      <span class="label-picker__chevron">▾</span>
    </div>

    <!-- Dropdown -->
    <div v-if="open" class="label-picker__dropdown">
      <input
        v-model="search"
        class="label-picker__search"
        placeholder="Search labels..."
        @click.stop
      />

      <div class="label-picker__options">
        <div
          v-for="label in filteredLabels"
          :key="label.id"
          class="label-picker__option"
          :class="{ 'label-picker__option--selected': isSelected(label.id) }"
          @click="toggle(label)"
        >
          <span
            class="label-picker__swatch"
            :style="{ background: label.color }"
          ></span>
          <span class="label-picker__option-name">{{ label.name }}</span>
          <span v-if="isSelected(label.id)" class="label-picker__check">✓</span>
        </div>

        <div v-if="filteredLabels.length === 0" class="label-picker__empty">
          No labels found
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import LabelChip from './LabelChip.vue'

const props = defineProps({
  issueId:        { type: Number, required: true },
  selectedLabels: { type: Array, default: () => [] },
  availableLabels: { type: Array, default: () => [] },
})

const emit = defineEmits(['add', 'remove'])

const open      = ref(false)
const search    = ref('')
const pickerRef = ref(null)

const filteredLabels = computed(() =>
  props.availableLabels.filter(l =>
    l.name.toLowerCase().includes(search.value.toLowerCase())
  )
)

function isSelected(labelId) {
  return props.selectedLabels.some(l => l.id === labelId)
}

function toggle(label) {
  if (isSelected(label.id)) {
    emit('remove', label.id)
  } else {
    emit('add', label.id)
  }
}

function handleClickOutside(e) {
  if (pickerRef.value && !pickerRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(()  => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.label-picker {
  position: relative;

  &__current {
    display: flex;
    flex-wrap: wrap;
    gap: $space-1;
    align-items: center;
    padding: 6px $space-3;
    border: 1.5px solid $gray-200;
    border-radius: $radius-sm;
    cursor: pointer;
    min-height: 36px;
    transition: border-color 0.15s;

    &:hover { border-color: $pink-300; }
  }

  &__placeholder {
    font-size: 0.82rem;
    color: $gray-400;
  }

  &__chevron {
    margin-left: auto;
    color: $gray-400;
    font-size: 0.8rem;
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: $white;
    border: 1.5px solid $gray-100;
    border-radius: $radius-md;
    box-shadow: $shadow-md;
    z-index: 100;
    overflow: hidden;
  }

  &__search {
    width: 100%;
    padding: $space-2 $space-3;
    border: none;
    border-bottom: 1px solid $gray-100;
    font-family: $font-body;
    font-size: 0.82rem;
    outline: none;
    color: $gray-800;

    &::placeholder { color: $gray-400; }
  }

  &__options {
    max-height: 200px;
    overflow-y: auto;
  }

  &__option {
    display: flex;
    align-items: center;
    gap: $space-2;
    padding: $space-2 $space-3;
    cursor: pointer;
    font-size: 0.82rem;
    transition: background 0.1s;

    &:hover { background: $gray-50; }
    &--selected { background: $pink-50; }
  }

  &__swatch {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__option-name { flex: 1; color: $gray-800; }
  &__check { color: $pink-500; font-size: 0.8rem; }

  &__empty {
    padding: $space-3;
    text-align: center;
    font-size: 0.82rem;
    color: $gray-400;
  }
}
</style>