<template>
  <div class="main">

    <!-- Top bar -->
    <div class="toolbar-container">
      <div class="tab-bar">
        <button v-for="tab in tabs" :key="tab.id"
          :class="{ active: current_tab === tab.id }"
          @click="current_tab = tab.id">{{ tab.label }}</button>
      </div>
      <vue-file-toolbar-menu :content="menu" class="bar" />
    </div>

    <!-- Document editor -->
    <vue-document-editor class="editor" ref="editorRef"
      v-model:content="content"
      v-model:header="header_content"
      v-model:footer="footer_content"
      :overlay="overlay"
      :zoom="zoom"
      :page_format_mm="page_format_mm"
      v-model:page_margins="page_margins"
      :display="display" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import VueFileToolbarMenu from 'vue-file-toolbar-menu'
import VueDocumentEditor from '../DocumentEditor/DocumentEditor.vue'
import { createPluginManager } from '../DocumentEditor/plugins/plugin-api.js'
import { createUndoRedoPlugin } from '../DocumentEditor/plugins/undo-redo.js'
import { createTextFormattingPlugin } from '../DocumentEditor/plugins/text-formatting.js'
import { createListsPlugin } from '../DocumentEditor/plugins/lists.js'
import { createLineSpacingPlugin } from '../DocumentEditor/plugins/line-spacing.js'
import { createHeadersPlugin } from '../DocumentEditor/plugins/headers.js'
import { createPageBreakPlugin } from '../DocumentEditor/plugins/page-break.js'
import { createPrintPlugin } from '../DocumentEditor/plugins/print.js'
import { createImportExportPlugin } from '../DocumentEditor/plugins/import-export.js'
import { createZoomPlugin } from '../DocumentEditor/plugins/zoom.js'
import { createPageSettingsPlugin } from '../DocumentEditor/plugins/page-settings.js'
import { createTablePlugin } from '../DocumentEditor/plugins/table.js'

// State
const editorRef = ref(null)
const content = ref([''])
const header_content = ref('<div style="text-align: center;"><span style="font-size: 10pt;"><b><br></b></span></div><div style="text-align: center;"><span style="font-size: 10pt;"><b><br></b></span></div><div style="text-align: center;"><span style="font-size: 10pt;"><b>3DSIGNER INFORM\u00c1TICA</b></span></div><div style="text-align: center;">www.eltonsits.com.br</div>')
const footer_content = ref('<div style="text-align: center;"><span style="font-size: 10pt;">www.eltonsites.com.br</span></div>')
const zoom = ref(1)
const zoom_min = ref(0.10)
const zoom_max = ref(5.0)
const page_format_mm = ref([210, 297])
const page_margins = ref("10mm 15mm")
const display = ref("grid")
const current_tab = ref("editar")
const mounted = ref(false)

// Computed
const current_text_style = computed(() => mounted.value && editorRef.value ? editorRef.value.current_text_style : false)
const isMacLike = computed(() => /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform))

// Plugin context shared by all plugins
const ctx = {
  editor: editorRef, content, header_content, footer_content,
  page_format_mm, page_margins, zoom, zoom_min, zoom_max,
  display, mounted, current_text_style, isMacLike,
}

// Register all plugins
const pluginManager = createPluginManager()
pluginManager.register(createUndoRedoPlugin(ctx))
pluginManager.register(createTextFormattingPlugin(ctx))
pluginManager.register(createListsPlugin(ctx))
pluginManager.register(createLineSpacingPlugin(ctx))
pluginManager.register(createHeadersPlugin(ctx))
pluginManager.register(createPageBreakPlugin(ctx))
pluginManager.register(createTablePlugin(ctx))
pluginManager.register(createPrintPlugin())
pluginManager.register(createImportExportPlugin(ctx))
pluginManager.register(createPageSettingsPlugin(ctx))
pluginManager.register(createZoomPlugin(ctx))

// Tab configuration
const tabLabels = { editar: 'Editar', inserir: 'Inserir', configurar: 'Configurar', exportar: 'Importar/Exportar' }
const tabs = computed(() => pluginManager.getTabs().map(id => ({ id, label: tabLabels[id] || id })))

// Toolbar menu from active tab's plugins
const menu = computed(() => pluginManager.getToolbarItems(current_tab.value))

// Page overlay (page numbers)
function overlay(page, total) {
  return '<div style="position: absolute; bottom: 1mm; ' + ((page % 2) ? 'right' : 'left') + ': 10mm; font-size: 8pt; color: #aaa;">P\u00e1gina ' + page + ' de ' + total + '</div>'
}

onMounted(() => { mounted.value = true })
onBeforeUnmount(() => { pluginManager.destroy() })
</script>

<style>
html {
  height: 100%;
}
body {
  margin: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: black;
  background: rgb(248, 249, 250);
}
::-webkit-scrollbar {
  width: 16px;
  height: 16px;
}
::-webkit-scrollbar-track, ::-webkit-scrollbar-corner {
  display: none;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.5);
  border: 5px solid transparent;
  border-radius: 16px;
  background-clip: content-box;
}
::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.8);
}
/* Toolbar: allow dropdowns to overflow */
.toolbar-container .bar {
  flex-wrap: nowrap !important;
  overflow: visible;
}
</style>

<style scoped>
  .main {
    width: fit-content;
    min-width: 100%;
  }
  .toolbar-container {
    position: sticky;
    left: 0;
    top: 0;
    width: calc(100vw - 16px);
    z-index: 1000;
    background: rgba(248, 249, 250, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: solid 1px #e0e0e0;
  }
  .tab-bar {
    display: flex;
    padding: 4px 8px 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .tab-bar::-webkit-scrollbar {
    display: none;
  }
  .tab-bar button {
    padding: 6px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
    color: #444;
    border-bottom: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .tab-bar button:hover {
    color: #188038;
  }
  .tab-bar button.active {
    color: #188038;
    border-bottom-color: #188038;
    font-weight: 600;
  }
  .bar {
    --bar-button-active-color: #188038;
    --bar-button-open-color: #188038;
    --bar-button-active-bkg: #e6f4ea;
    --bar-button-open-bkg: #e6f4ea;
  }
</style>
