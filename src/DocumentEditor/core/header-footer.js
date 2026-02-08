// Header/Footer editing: inline contenteditable h/f zones
import { nextTick } from 'vue'

export function setupHeaderFooter(ctx) {
  const { state, props, emit, refs } = ctx

  ctx.start_editing_hf = async function(mode, page_idx) {
    state.editing_hf = mode
    state.editing_hf_page = page_idx
    await nextTick()
    const el = refs.overlays.value && refs.overlays.value.querySelector('.hf-active[contenteditable]')
    if (el) {
      const content = (mode === 'header') ? (props.header || '') : (props.footer || '')
      el.innerHTML = content || '<div><br></div>'
      el.focus()
      const sel = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(el)
      range.collapse(false)
      sel.removeAllRanges()
      sel.addRange(range)
      ctx._hf_editor_el = el
    }
  }

  ctx.stop_editing_hf = function() {
    if (!state.editing_hf) return
    if (ctx._hf_measure_timer) { clearTimeout(ctx._hf_measure_timer); ctx._hf_measure_timer = null }
    if (ctx._hf_editor_el) {
      let html = ctx._hf_editor_el.innerHTML
      if (html === '<br>' || html === '<div><br></div>') html = ''
      emit('update:' + state.editing_hf, html)
      ctx._hf_editor_el = null
    }
    state.editing_hf = null
    state.editing_hf_page = null
    nextTick(() => { ctx._measure_hf_heights() })
  }

  ctx.on_hf_input = function(mode) {
    if (ctx._hf_editor_el) {
      let html = ctx._hf_editor_el.innerHTML
      if (html === '<br>' || html === '<div><br></div>') html = ''
      emit('update:' + mode, html)
    }
    if (ctx._hf_measure_timer) clearTimeout(ctx._hf_measure_timer)
    ctx._hf_measure_timer = setTimeout(() => { ctx._measure_hf_heights() }, 300)
  }

  ctx._measure_hf_heights = function() {
    const px_to_mm = 0.2645833333333
    const m = ctx.parsed_margins.value
    const origTop = parseFloat(m.top) || 10
    const origBottom = parseFloat(m.bottom) || 10
    let hMM = 0, fMM = 0
    if (state.editing_hf && ctx._hf_editor_el) {
      const elMM = ctx._hf_editor_el.scrollHeight * px_to_mm + 1
      if (state.editing_hf === 'header') { hMM = elMM } else { fMM = elMM }
      if (refs.overlays.value) {
        const other = refs.overlays.value.querySelector(state.editing_hf === 'header' ? '.hf-footer:not(.hf-active)' : '.hf-header:not(.hf-active)')
        const otherMM = other ? other.scrollHeight * px_to_mm + 1 : 0
        if (state.editing_hf === 'header') { fMM = otherMM } else { hMM = otherMM }
      }
    } else if (refs.overlays.value) {
      const hZone = refs.overlays.value.querySelector('.hf-header')
      const fZone = refs.overlays.value.querySelector('.hf-footer')
      if (hZone) hMM = hZone.scrollHeight * px_to_mm + 1
      if (fZone) fMM = fZone.scrollHeight * px_to_mm + 1
    }
    const newTop = Math.ceil(hMM) > origTop ? Math.ceil(hMM) : 0
    const newBottom = Math.ceil(fMM) > origBottom ? Math.ceil(fMM) : 0
    if (newTop !== state.hf_top_height_mm || newBottom !== state.hf_bottom_height_mm) {
      state.hf_top_height_mm = newTop
      state.hf_bottom_height_mm = newBottom
      nextTick(() => {
        ctx.update_pages_elts()
        ctx._cancel_deferred_reflow()
        if (!state._paste_in_progress) {
          state._paste_in_progress = true
          ctx._show_paste_overlay('Processando documento...')
        }
        ctx.fit_content_over_pages(2)
        ctx._update_page_statuses()
        if (ctx._dirty_from_page !== null) {
          ctx._schedule_deferred_reflow()
        } else {
          ctx.emit_new_content()
          if (state.virtualization_enabled) ctx.virtualize_pages()
          state._paste_in_progress = false
          ctx._hide_paste_overlay()
        }
      })
    }
  }

  ctx.on_content_click = function() {
    if (state.editing_hf) { ctx.stop_editing_hf() }
  }
}
