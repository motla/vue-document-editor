import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

export function createUndoRedoPlugin(ctx) {
  const history = ref([])       // array of per-page innerHTML snapshots
  const historyIndex = ref(-1)
  let _suppressUntil = 0        // timestamp: ignore watcher until this time
  let _debounceTimer = null      // debounce rapid keystrokes into one snapshot

  // Save a per-page innerHTML snapshot from the editor's DOM
  function savePageSnapshot() {
    const editor = ctx.editor && ctx.editor.value
    if (!editor || !editor.pages) return
    const pages = editor.pages
    const snapshot = []
    for (const page of pages) {
      if (page.nao_renderizada && page.cached_html != null) {
        snapshot.push(page.cached_html)
      } else if (page.elt) {
        snapshot.push(page.elt.innerHTML)
      }
    }
    if (!snapshot.length) return
    // Truncate any forward entries (discard redo stack on new change)
    history.value.length = historyIndex.value + 1
    history.value.push(snapshot)
    historyIndex.value = history.value.length - 1
  }

  function undo() {
    if (historyIndex.value <= 0) return
    const editor = ctx.editor && ctx.editor.value
    if (!editor || !editor.restore_pages) return
    _suppressUntil = Date.now() + 500
    clearTimeout(_debounceTimer)
    historyIndex.value--
    editor.restore_pages(history.value[historyIndex.value])
  }

  function redo() {
    if (historyIndex.value >= history.value.length - 1) return
    const editor = ctx.editor && ctx.editor.value
    if (!editor || !editor.restore_pages) return
    _suppressUntil = Date.now() + 500
    clearTimeout(_debounceTimer)
    historyIndex.value++
    editor.restore_pages(history.value[historyIndex.value])
  }

  function resetContentHistory() {
    history.value = []
    historyIndex.value = -1
    clearTimeout(_debounceTimer)
  }

  // Expose to ctx for other plugins (e.g. import-export calls resetContentHistory)
  ctx.resetContentHistory = resetContentHistory

  // Watch content changes — debounce to group rapid keystrokes
  // When content changes (from typing), save a per-page DOM snapshot
  watch(() => ctx.content.value, () => {
    // Skip changes caused by undo/redo (restore_pages emits content update)
    if (Date.now() < _suppressUntil) return

    clearTimeout(_debounceTimer)
    _debounceTimer = setTimeout(() => {
      savePageSnapshot()
    }, 500)
  }, { deep: true })

  // Save initial snapshot after editor is fully mounted and first reflow completes
  onMounted(() => {
    // Wait for initial reset_content + deferred reflow to finish
    const waitForReady = () => {
      const editor = ctx.editor && ctx.editor.value
      if (editor && editor.pages && editor.pages.length && !editor._paste_in_progress) {
        savePageSnapshot()
      } else {
        setTimeout(waitForReady, 200)
      }
    }
    setTimeout(waitForReady, 200)
  })

  // Listen for undo/redo browser events (beforeinput only — prevents native undo)
  const manage_undo_redo = (e) => {
    switch (e && e.inputType) {
      case "historyUndo": e.preventDefault(); e.stopPropagation(); undo(); break
      case "historyRedo": e.preventDefault(); e.stopPropagation(); redo(); break
    }
  }

  onMounted(() => {
    window.addEventListener("beforeinput", manage_undo_redo)
  })

  onBeforeUnmount(() => {
    window.removeEventListener("beforeinput", manage_undo_redo)
    clearTimeout(_debounceTimer)
  })

  return {
    name: 'undo-redo',
    tab: 'editar',
    order: 10,
    getToolbarItems() {
      return [
        { title: "Undo", icon: "undo", disabled: historyIndex.value <= 0, hotkey: ctx.isMacLike.value ? "command+z" : "ctrl+z", click: undo },
        { title: "Redo", icon: "redo", disabled: historyIndex.value >= history.value.length - 1, hotkey: ctx.isMacLike.value ? "shift+command+z" : "ctrl+y", click: redo },
      ]
    }
  }
}
