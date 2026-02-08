import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

export function createUndoRedoPlugin(ctx) {
  const undo_count = ref(-1)
  const content_history = ref([])
  let _mute = false

  function undo() {
    if (undo_count.value > 0) {
      _mute = true
      ctx.content.value = content_history.value[--undo_count.value]
    }
  }

  function redo() {
    if (content_history.value.length - undo_count.value - 1 > 0) {
      _mute = true
      ctx.content.value = content_history.value[++undo_count.value]
    }
  }

  function resetContentHistory() {
    content_history.value = []
    undo_count.value = -1
  }

  // Expose to ctx for other plugins (e.g. import-export calls resetContentHistory)
  ctx.resetContentHistory = resetContentHistory

  // Watch content changes for history
  watch(() => ctx.content.value, (new_content) => {
    if (!_mute) {
      content_history.value[++undo_count.value] = new_content
      content_history.value.length = undo_count.value + 1
    }
    _mute = false
  }, { immediate: true, deep: true })

  // Listen for undo/redo browser events
  const manage_undo_redo = (e) => {
    switch (e && e.inputType) {
      case "historyUndo": e.preventDefault(); e.stopPropagation(); undo(); break
      case "historyRedo": e.preventDefault(); e.stopPropagation(); redo(); break
    }
  }

  onMounted(() => {
    window.addEventListener("beforeinput", manage_undo_redo)
    window.addEventListener("input", manage_undo_redo)
  })

  onBeforeUnmount(() => {
    window.removeEventListener("beforeinput", manage_undo_redo)
    window.removeEventListener("input", manage_undo_redo)
  })

  return {
    name: 'undo-redo',
    tab: 'editar',
    order: 10,
    getToolbarItems() {
      return [
        { title: "Undo", icon: "undo", disabled: undo_count.value <= 0, hotkey: ctx.isMacLike.value ? "command+z" : "ctrl+z", click: undo },
        { title: "Redo", icon: "redo", disabled: content_history.value.length - undo_count.value - 1 <= 0, hotkey: ctx.isMacLike.value ? "shift+command+z" : "ctrl+y", click: redo },
      ]
    }
  }
}
