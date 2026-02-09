import { reactive, computed, watch, onMounted, onBeforeUpdate, onBeforeUnmount, nextTick } from 'vue'
import { debounce, css_length_to_px } from './utils.js'
import { setupPageLayout } from './page-layout.js'
import { setupVirtualScroll } from './virtual-scroll.js'
import { setupOverlays } from './overlays.js'
import { setupDeferredReflow } from './deferred-reflow.js'
import { setupReflowEngine } from './reflow-engine.js'
import { setupInputHandler } from './input-handler.js'
import { setupPrint } from './print.js'
import { setupHeaderFooter } from './header-footer.js'
import { setupRuler } from './ruler.js'

export function useEditor(props, emit, refs) {
  // ─── Reactive State ───────────────────────────────────────────────
  const state = reactive({
    pages: [],
    pages_overlay_refs: {},
    pages_height: 0,
    editor_width: 0,
    prevent_next_content_update_from_parent: false,
    current_text_style: false,
    printing_mode: false,
    visible_range: { start: 0, end: 5 },
    virtualization_enabled: false,
    editing_hf: null,
    editing_hf_page: null,
    hf_top_height_mm: 0,
    hf_bottom_height_mm: 0,
    _paste_in_progress: false,
    _import_page_count: 0,
  })

  // ─── Computed ─────────────────────────────────────────────────────
  const css_media_style = computed(() => {
    const style = document.createElement("style")
    document.head.appendChild(style)
    return style
  })

  const parsed_margins = computed(() => {
    const m = typeof props.page_margins === 'string' ? props.page_margins : '10mm 15mm'
    const parts = m.trim().split(/\s+/)
    if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] }
    if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] }
    if (parts.length === 3) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] }
    return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] }
  })

  const hf_header_style = computed(() => {
    const m = parsed_margins.value
    return {
      position: 'absolute', top: '0', left: '0', right: '0',
      minHeight: m.top, padding: '2mm ' + m.right + ' 2mm ' + m.left,
      boxSizing: 'border-box'
    }
  })

  const hf_footer_style = computed(() => {
    const m = parsed_margins.value
    return {
      position: 'absolute', bottom: '0', left: '0', right: '0',
      minHeight: m.bottom, padding: '2mm ' + m.right + ' 2mm ' + m.left,
      boxSizing: 'border-box'
    }
  })

  const effective_page_margins = computed(() => {
    if (typeof props.page_margins === 'function') return props.page_margins
    if (!state.hf_top_height_mm && !state.hf_bottom_height_mm) return props.page_margins
    const m = parsed_margins.value
    const origTop = parseFloat(m.top) || 10
    const origBottom = parseFloat(m.bottom) || 10
    const effTop = state.hf_top_height_mm ? Math.max(origTop, state.hf_top_height_mm) : origTop
    const effBottom = state.hf_bottom_height_mm ? Math.max(origBottom, state.hf_bottom_height_mm) : origBottom
    return effTop + 'mm ' + m.right + ' ' + effBottom + 'mm ' + m.left
  })

  // ─── Shared Context ───────────────────────────────────────────────
  // All sub-modules receive this object and attach their methods to it.
  // This avoids circular dependencies: each module calls ctx.otherMethod().
  const ctx = {
    state, props, emit, refs,
    // Computed refs (accessed as ctx.xxx.value)
    css_media_style,
    parsed_margins,
    effective_page_margins,
    // Non-reactive internal state
    _dirty_from_page: null,
    _deferred_raf_id: null,
    _status_overlay_container: null,
    _hf_editor_el: null,
    _hf_measure_timer: null,
    _input_timer: null,
    _last_input_type: null,
    _page_body: null,
    _reset_in_progress: false,
    _fit_in_progress: false,
    _print_pending: false,
  }

  // ─── Setup Sub-modules ────────────────────────────────────────────
  setupPageLayout(ctx)
  setupVirtualScroll(ctx)
  setupOverlays(ctx)
  setupDeferredReflow(ctx)
  setupReflowEngine(ctx)
  setupInputHandler(ctx)
  setupPrint(ctx)
  setupHeaderFooter(ctx)
  setupRuler(ctx)

  // ─── Watchers ─────────────────────────────────────────────────────
  watch(() => props.content, () => {
    if(state.prevent_next_content_update_from_parent) {
      state.prevent_next_content_update_from_parent = false
    } else ctx.reset_content()
  }, { deep: true })

  watch(() => props.display, () => { ctx.update_pages_elts() })

  watch(() => props.page_format_mm, () => {
    ctx.update_css_media_style()
    ctx.reset_content()
  })

  watch(() => props.page_margins, () => { ctx.reset_content() })
  watch(() => props.zoom, () => { ctx.update_pages_elts() })

  watch(() => props.header, () => {
    if (!state.editing_hf) { nextTick(() => { ctx._measure_hf_heights() }) }
  })

  watch(() => props.footer, () => {
    if (!state.editing_hf) { nextTick(() => { ctx._measure_hf_heights() }) }
  })

  // ─── Lifecycle ────────────────────────────────────────────────────
  let _scroll_handler = null
  let _scroll_container = null
  let _keydown_handler = null

  onMounted(() => {
    console.log('[EDITOR] onMounted: starting initialization')
    console.log('[EDITOR] onMounted: ctx.process_current_text_style is', typeof ctx.process_current_text_style)
    console.log('[EDITOR] onMounted: ctx.update_pages_elts is', typeof ctx.update_pages_elts)
    console.log('[EDITOR] onMounted: ctx._init_ruler is', typeof ctx._init_ruler)
    ctx._init_ruler()
    ctx.update_editor_width()
    ctx.update_css_media_style()
    ctx.reset_content()
    nextTick(() => { ctx._measure_hf_heights() })
    window.addEventListener("resize", ctx.update_editor_width)
    window.addEventListener("click", ctx.process_current_text_style)
    console.log('[EDITOR] onMounted: click listener registered for process_current_text_style')
    window.addEventListener("beforeprint", ctx.before_print)
    window.addEventListener("afterprint", ctx.after_print)
    _scroll_handler = debounce(() => ctx.on_scroll(), 100)
    _scroll_container = ctx.get_scroll_container()
    if (_scroll_container === window) {
      window.addEventListener("scroll", _scroll_handler)
    } else {
      _scroll_container.addEventListener("scroll", _scroll_handler)
    }
    _keydown_handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        ctx._prepare_and_print()
      }
      // Tab key: first-line indent for regular text, indent/outdent for lists
      if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const sel = document.getSelection()
        if (!sel || !sel.focusNode) return
        // Skip if cursor is in a table (table plugin handles Tab for cell navigation)
        let node = sel.focusNode.nodeType === Node.TEXT_NODE ? sel.focusNode.parentElement : sel.focusNode
        while (node) {
          if (node.tagName === 'TABLE') return
          if (node.dataset && node.dataset.isVDEPage !== undefined) break
          node = node.parentElement
        }
        // Lists: use browser indent/outdent
        if (state.current_text_style && state.current_text_style.isList) {
          e.preventDefault()
          document.execCommand(e.shiftKey ? 'outdent' : 'indent')
          return
        }
        // Regular text: apply text-indent (first-line indent)
        e.preventDefault()
        let el = sel.focusNode.nodeType === Node.TEXT_NODE ? sel.focusNode.parentElement : sel.focusNode
        while (el) {
          if (el.dataset && el.dataset.isVDEPage !== undefined) break
          const display = window.getComputedStyle(el).display
          if (display !== 'inline' && display !== 'inline-block') {
            const current = css_length_to_px(el.style.textIndent)
            const newVal = Math.max(0, current + (e.shiftKey ? -40 : 40))
            el.style.textIndent = newVal ? newVal + 'px' : ''
            el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'formatIndent' }))
            return
          }
          el = el.parentElement
        }
      }
    }
    window.addEventListener("keydown", _keydown_handler)
  })

  onBeforeUpdate(() => {
    state.pages_overlay_refs = []
  })

  onBeforeUnmount(() => {
    window.removeEventListener("resize", ctx.update_editor_width)
    window.removeEventListener("click", ctx.process_current_text_style)
    window.removeEventListener("beforeprint", ctx.before_print)
    window.removeEventListener("afterprint", ctx.after_print)
    if (_scroll_handler) {
      if (_scroll_container === window) {
        window.removeEventListener("scroll", _scroll_handler)
      } else if (_scroll_container) {
        _scroll_container.removeEventListener("scroll", _scroll_handler)
      }
    }
    if (_keydown_handler) window.removeEventListener("keydown", _keydown_handler)
    if (ctx._input_timer) clearTimeout(ctx._input_timer)
    ctx._cancel_deferred_reflow()
  })

  // ─── Return Public API ────────────────────────────────────────────
  return {
    state,
    hf_header_style,
    hf_footer_style,
    page_style: ctx.page_style,
    process_current_text_style: ctx.process_current_text_style,
    start_editing_hf: ctx.start_editing_hf,
    stop_editing_hf: ctx.stop_editing_hf,
    on_hf_input: ctx.on_hf_input,
    on_content_click: ctx.on_content_click,
    onInput: ctx.onInput,
    reset_content: ctx.reset_content,
    restore_pages: ctx.restore_pages,
    _show_paste_overlay: ctx._show_paste_overlay,
    _hide_paste_overlay: ctx._hide_paste_overlay,
  }
}
