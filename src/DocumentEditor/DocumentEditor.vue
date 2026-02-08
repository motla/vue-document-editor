<template>
  <div class="editor" ref="editor">

    <!-- Page overlays (headers, footers, page numbers, ...) -->
    <div v-if="overlay || header != null || footer != null" class="overlays" ref="overlays">
      <div v-for="(page, page_idx) in state.pages" class="overlay" :key="page.uuid+'-overlay'" :ref="(elt) => (state.pages_overlay_refs[page.uuid] = elt)"
        :style="page_style(page_idx, false)">
        <!-- Editable header zone -->
        <template v-if="header != null">
          <div v-if="state.editing_hf === 'header' && state.editing_hf_page === page_idx"
            class="hf-zone hf-header hf-active"
            :style="hf_header_style"
            contenteditable="true"
            @input="on_hf_input('header')"
            @keyup="process_current_text_style"
            @keydown.esc.prevent="stop_editing_hf"
            data-hf-label="Cabeçalho">
          </div>
          <div v-else class="hf-zone hf-header"
            :class="{ 'hf-dim': state.editing_hf === 'footer' }"
            :style="hf_header_style"
            v-html="header"
            @dblclick.stop="start_editing_hf('header', page_idx)">
          </div>
        </template>
        <!-- Editable footer zone -->
        <template v-if="footer != null">
          <div v-if="state.editing_hf === 'footer' && state.editing_hf_page === page_idx"
            class="hf-zone hf-footer hf-active"
            :style="hf_footer_style"
            contenteditable="true"
            @input="on_hf_input('footer')"
            @keyup="process_current_text_style"
            @keydown.esc.prevent="stop_editing_hf"
            data-hf-label="Rodapé">
          </div>
          <div v-else class="hf-zone hf-footer"
            :class="{ 'hf-dim': state.editing_hf === 'header' }"
            :style="hf_footer_style"
            v-html="footer"
            @dblclick.stop="start_editing_hf('footer', page_idx)">
          </div>
        </template>
        <!-- Legacy overlay content (page numbers, etc.) -->
        <div v-if="overlay" v-html="overlay(page_idx+1, state.pages.length)" style="pointer-events: none;"></div>
      </div>
    </div>

    <!-- Document editor -->
    <div class="content" ref="content" :contenteditable="editable && !state.editing_hf" :class="{ 'hf-body-dim': !!state.editing_hf }" :style="page_style(-1)" @input="onInput" @keyup="process_current_text_style" @click="on_content_click">
      <!-- This is a Vue "hoisted" static <div> which contains every page of the document and can be modified by the DOM -->
    </div>

    <!-- Items related to the document editor (widgets, ...) can be inserted here -->

    <!-- Deferred reflow progress indicator (bottom-left, non-blocking) -->
    <div class="vde-progress-indicator" ref="progress_indicator">
      <div class="vde-progress-spinner"></div>
      <span class="vde-progress-text" ref="progress_text"></span>
    </div>

    <!-- Full-screen blocking overlay for paste operations -->
    <div class="vde-paste-overlay" ref="paste_overlay">
      <div class="vde-paste-box">
        <div class="vde-paste-spinner"></div>
        <span class="vde-paste-text" ref="paste_text">Colando texto...</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, toRef } from 'vue'
import { useEditor } from './core/use-editor.js'

const props = defineProps({
  content: { type: Array, required: true },
  display: { type: String, default: "grid" },
  editable: { type: Boolean, default: true },
  overlay: Function,
  header: { type: String, default: undefined },
  footer: { type: String, default: undefined },
  page_format_mm: { type: Array, default: () => [210, 297] },
  page_margins: { type: [String, Function], default: "10mm 15mm" },
  zoom: { type: Number, default: 1 },
  do_not_break: Function
})

const emit = defineEmits(['update:content', 'update:header', 'update:footer'])

// Template refs
const editor = ref(null)
const content = ref(null)
const overlays = ref(null)
const progress_indicator = ref(null)
const progress_text = ref(null)
const paste_overlay = ref(null)
const paste_text = ref(null)

// Composable
const {
  state,
  hf_header_style,
  hf_footer_style,
  page_style,
  process_current_text_style,
  start_editing_hf,
  stop_editing_hf,
  on_hf_input,
  on_content_click,
  onInput,
  reset_content,
  restore_pages,
  _show_paste_overlay,
  _hide_paste_overlay,
} = useEditor(props, emit, {
  editor, content, overlays,
  progress_indicator, progress_text,
  paste_overlay, paste_text
})

// Expose for parent (Demo.vue) access via $refs.editor
defineExpose({
  current_text_style: toRef(state, 'current_text_style'),
  pages: toRef(state, 'pages'),
  _paste_in_progress: toRef(state, '_paste_in_progress'),
  _import_page_count: toRef(state, '_import_page_count'),
  _show_paste_overlay,
  _hide_paste_overlay,
  reset_content,
  restore_pages,
  contentEl: content,
  overlaysEl: overlays,
})
</script>

<style>
body {
  /* Enable printing of background colors */
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
/* Ordered list numbering with CSS counters via ::marker */
.editor .content ol {
  counter-reset: item;
}
.editor .content ol > li {
  counter-increment: item;
}
/* === DECIMAL (default): hierarchical 1. / 1.1 / 1.1.1 === */
.editor .content ol > li::marker {
  content: counter(item) ". ";
}
.editor .content ol ol > li::marker {
  content: counters(item, ".") " ";
}
/* === UPPER-ROMAN: I. → a. → i. (Word style) === */
.editor .content ol[style*="upper-roman"] > li::marker {
  content: counter(item, upper-roman) ". ";
}
.editor .content ol[style*="upper-roman"] ol > li::marker {
  content: counter(item, lower-alpha) ". ";
}
.editor .content ol[style*="upper-roman"] ol ol > li::marker {
  content: counter(item, lower-roman) ". ";
}
/* === LOWER-ROMAN: i. → a. → 1. === */
.editor .content ol[style*="lower-roman"] > li::marker {
  content: counter(item, lower-roman) ". ";
}
.editor .content ol[style*="lower-roman"] ol > li::marker {
  content: counter(item, lower-alpha) ". ";
}
.editor .content ol[style*="lower-roman"] ol ol > li::marker {
  content: counter(item) ". ";
}
/* === UPPER-ALPHA: A. → a. → i. === */
.editor .content ol[style*="upper-alpha"] > li::marker {
  content: counter(item, upper-alpha) ". ";
}
.editor .content ol[style*="upper-alpha"] ol > li::marker {
  content: counter(item, lower-alpha) ". ";
}
.editor .content ol[style*="upper-alpha"] ol ol > li::marker {
  content: counter(item, lower-roman) ". ";
}
/* === LOWER-ALPHA: a. → i. → 1. === */
.editor .content ol[style*="lower-alpha"] > li::marker {
  content: counter(item, lower-alpha) ". ";
}
.editor .content ol[style*="lower-alpha"] ol > li::marker {
  content: counter(item, lower-roman) ". ";
}
.editor .content ol[style*="lower-alpha"] ol ol > li::marker {
  content: counter(item) ". ";
}
/* === Table wrapper (scrollable container) === */
.editor .content .vde-table-wrapper {
  overflow-x: auto;
  max-width: 100%;
}
.editor .content .vde-table-wrapper table {
  max-width: none; /* wrapper handles overflow via scrollbar */
}
/* === Table cells === */
.editor .content table td,
.editor .content table th {
  position: relative;
  box-sizing: border-box; /* width = total (content+padding+border), matches getBoundingClientRect */
}
/* === Table cell selection === */
.editor .content td.vde-cell-selected,
.editor .content th.vde-cell-selected {
  background-color: rgba(26, 115, 232, 0.15) !important;
  outline: 2px solid #1a73e8;
  outline-offset: -2px;
}
</style>
<style scoped>
.editor {
  display: block;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  cursor: default;
}
.editor ::-webkit-scrollbar {
  width: 16px;
  height: 16px;
}
.editor ::-webkit-scrollbar-track,
.editor ::-webkit-scrollbar-corner {
  display: none;
}
.editor ::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.5);
  border: 5px solid transparent;
  border-radius: 16px;
  background-clip: content-box;
}
.editor ::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.8);
}
.editor .hide_children > * {
  display: none;
}
.editor > .content {
  position: relative;
  outline: none;
  margin: 0;
  padding: 0;
  min-width: 100%;
  pointer-events: none;
}
.editor > .content > :deep(.page) {
  position: absolute;
  box-sizing: border-box;
  left: 50%;
  transform-origin: center top;
  background: var(--page-background, white);
  box-shadow: var(--page-box-shadow, 0 1px 3px 1px rgba(60, 64, 67, 0.15));
  border: var(--page-border);
  border-radius: var(--page-border-radius);
  transition: left 0.3s, top 0.3s;
  overflow: hidden;
  pointer-events: all;
}
.editor > .content[contenteditable],
.editor > .content :deep(*[contenteditable]) {
  cursor: text;
}
.editor > .content :deep(*[contenteditable=false]) {
  cursor: default;
}
.editor > .overlays {
  position: relative;
  margin: 0;
  padding: 0;
  min-width: 100%;
  pointer-events: none;
}
.editor > .overlays > .overlay {
  position: absolute;
  box-sizing: border-box;
  left: 50%;
  transform-origin: center top;
  transition: left 0.3s, top 0.3s;
  overflow: hidden;
  z-index: 1;
}
.editor > .page-status-overlays {
  position: relative;
  margin: 0;
  padding: 0;
  min-width: 100%;
  pointer-events: none;
}
.editor > .page-status-overlays > .page-status-overlay {
  position: absolute;
  box-sizing: border-box;
  left: 50%;
  transform-origin: center top;
  transition: left 0.3s, top 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  z-index: 2;
  border-radius: var(--page-border-radius);
  pointer-events: none;
}
.page-status-overlay.pg-loading {
  background: rgba(255, 255, 255, 0.6);
}
.page-status-overlay.pg-await {
  background: rgba(240, 240, 240, 0.7);
}
.page-status-overlay .status-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  animation: vde-spin 0.7s linear infinite;
}
.page-status-overlay .status-await-icon {
  width: 30px;
  height: 30px;
  border: 3px dashed rgba(0, 0, 0, 0.15);
  border-radius: 50%;
}
@keyframes vde-spin {
  to { transform: rotate(360deg); }
}
.editor > .vde-progress-indicator {
  display: none;
  position: fixed;
  bottom: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  align-items: center;
  gap: 10px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  pointer-events: none;
}
.editor > .vde-progress-indicator > .vde-progress-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: vde-spin 0.7s linear infinite;
}
.editor > .vde-paste-overlay {
  display: none;
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.5);
  z-index: 9999;
  align-items: center;
  justify-content: center;
  cursor: wait;
}
.editor > .vde-paste-overlay > .vde-paste-box {
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 20px 32px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 15px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
.editor > .vde-paste-overlay .vde-paste-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: vde-spin 0.7s linear infinite;
}
/* Header/Footer editable zones */
.editor > .overlays > .overlay > .hf-zone {
  pointer-events: auto;
  cursor: default;
  font-size: 10pt;
  color: #888;
  outline: none;
  width: 100%;
  overflow: visible;
}
.editor > .overlays > .overlay > .hf-zone:not(.hf-active) {
  opacity: 0.5;
}
.editor > .overlays > .overlay > .hf-zone:not(.hf-active):empty::before {
  content: 'Clique duas vezes para editar';
  color: #ccc;
  font-style: italic;
  font-size: 9pt;
}
.editor > .overlays > .overlay > .hf-active {
  opacity: 1;
  color: #333;
  cursor: text;
  background: rgba(26, 115, 232, 0.03);
  position: absolute;
  overflow: visible;
}
.editor > .overlays > .overlay > .hf-header.hf-active {
  border-bottom: 1px dashed #1a73e8;
}
.editor > .overlays > .overlay > .hf-footer.hf-active {
  border-top: 1px dashed #1a73e8;
}
.editor > .overlays > .overlay > .hf-dim {
  opacity: 0.3;
}
.editor > .overlays > .overlay > .hf-active::after {
  content: attr(data-hf-label);
  position: absolute;
  font-size: 8px;
  color: #1a73e8;
  pointer-events: none;
}
.editor > .overlays > .overlay > .hf-header.hf-active::after {
  right: 4px;
  bottom: 2px;
}
.editor > .overlays > .overlay > .hf-footer.hf-active::after {
  right: 4px;
  top: 2px;
}
.editor > .content.hf-body-dim > :deep(.page) {
  opacity: 0.4;
}
</style>
