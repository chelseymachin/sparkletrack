<template>
  <div class="editor" :class="{ 'editor--focused': editor?.isFocused }">
    <div v-if="editor" class="editor__toolbar">
      <button
        class="toolbar-btn"
        :class="{ 'toolbar-btn--active': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        class="toolbar-btn"
        :class="{ 'toolbar-btn--active': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        class="toolbar-btn"
        :class="{ 'toolbar-btn--active': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
        title="Bullet list"
      >
        ≡
      </button>
      <button
        class="toolbar-btn"
        :class="{ 'toolbar-btn--active': editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()"
        title="Ordered list"
      >
        1.
      </button>
      <button
        class="toolbar-btn"
        :class="{ 'toolbar-btn--active': editor.isActive('code') }"
        @click="editor.chain().focus().toggleCode().run()"
        title="Inline code"
      >
        &lt;/&gt;
      </button>
      <button
        class="toolbar-btn"
        :class="{ 'toolbar-btn--active': editor.isActive('codeBlock') }"
        @click="editor.chain().focus().toggleCodeBlock().run()"
        title="Code block"
      >
        { }
      </button>
      <div class="toolbar-divider"></div>
      <button class="toolbar-btn toolbar-btn--save" @click="$emit('save', editor.getHTML())">
        Save
      </button>
    </div>
    <EditorContent :editor="editor" class="editor__content" />
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Add a description...' },
})

const emit = defineEmits(['update:modelValue', 'save'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: props.placeholder }),
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

// Sync external value changes
watch(() => props.modelValue, (newVal) => {
  if (editor.value && editor.value.getHTML() !== newVal) {
    editor.value.commands.setContent(newVal, false)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style lang="scss" scoped>
@use '../styles/tokens' as *;

.editor {
  border: 1.5px solid $gray-200;
  border-radius: $radius-md;
  overflow: hidden;
  transition: border-color 0.15s;

  &--focused { border-color: $pink-400; }

  &__toolbar {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: $space-2 $space-3;
    border-bottom: 1px solid $gray-100;
    background: $gray-50;
    flex-wrap: wrap;
  }

  &__content {
    padding: $space-4;
    min-height: 120px;
    font-size: 0.9rem;
    color: $gray-800;
    line-height: 1.6;

    // Tiptap content styles
    :deep(.ProseMirror) {
      outline: none;
      min-height: 100px;

      p { margin: 0 0 $space-2; }
      strong { font-weight: 700; }
      em { font-style: italic; }

      ul, ol {
        padding-left: $space-5;
        margin: $space-2 0;
      }

      code {
        background: $gray-100;
        border-radius: 4px;
        padding: 1px 6px;
        font-family: $font-mono;
        font-size: 0.85em;
      }

      pre {
        background: $gray-800;
        color: $white;
        border-radius: $radius-sm;
        padding: $space-4;
        font-family: $font-mono;
        font-size: 0.85em;
        overflow-x: auto;
        margin: $space-3 0;

        code {
          background: none;
          padding: 0;
          color: inherit;
        }
      }

      p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        color: $gray-400;
        pointer-events: none;
        float: left;
        height: 0;
      }
    }
  }
}

.toolbar-btn {
  padding: 4px 8px;
  border-radius: $radius-sm;
  font-size: 0.8rem;
  color: $gray-500;
  transition: background 0.1s, color 0.1s;
  min-width: 28px;
  text-align: center;

  &:hover { background: $gray-200; color: $gray-800; }
  &--active { background: $pink-100; color: $pink-500; }
  &--save {
    margin-left: auto;
    background: $pink-500;
    color: $white;
    padding: 4px $space-3;
    font-weight: 600;
    &:hover { background: $pink-400; }
  }
}

.toolbar-divider {
  width: 1px;
  height: 18px;
  background: $gray-200;
  margin: 0 $space-2;
}
</style>