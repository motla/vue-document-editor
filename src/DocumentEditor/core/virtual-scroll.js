// Virtual scrolling: viewport-based page virtualization

export function setupVirtualScroll(ctx) {
  const { state, props, refs } = ctx

  ctx.get_scroll_container = function() {
    let el = refs.editor.value
    while (el) {
      const style = window.getComputedStyle(el)
      if (style.overflow === 'auto' || style.overflow === 'scroll' ||
          style.overflowY === 'auto' || style.overflowY === 'scroll') {
        return el
      }
      el = el.parentElement
    }
    return window
  }

  ctx.calculate_visible_range = function() {
    const px_in_mm = 0.2645833333333
    const page_height_px = (props.page_format_mm[1] + 10) * props.zoom / px_in_mm
    const container = ctx.get_scroll_container()
    let scroll_top, viewport_height
    if (container === window) {
      scroll_top = window.scrollY || document.documentElement.scrollTop
      viewport_height = window.innerHeight
    } else {
      scroll_top = container.scrollTop
      viewport_height = container.clientHeight
    }
    const view_padding = 20
    const inner_width = state.editor_width - 2 * view_padding
    const page_with_plus_spacing = (10 + props.page_format_mm[0]) * props.zoom / px_in_mm
    let nb_pages_x = 1
    if (props.display === "horizontal") {
      nb_pages_x = state.pages.length
    } else {
      nb_pages_x = Math.floor(inner_width / page_with_plus_spacing)
      if (nb_pages_x < 1 || props.display === "vertical") nb_pages_x = 1
    }
    if (props.display === "horizontal") {
      return { start: 0, end: state.pages.length - 1 }
    }
    const first_visible_row = Math.max(0, Math.floor((scroll_top - view_padding) / page_height_px))
    const last_visible_row = Math.floor((scroll_top + viewport_height) / page_height_px)
    const buffer = 2
    const start = Math.max(0, (first_visible_row - buffer) * nb_pages_x)
    const end = Math.min(state.pages.length - 1, (last_visible_row + buffer + 1) * nb_pages_x - 1)
    return { start, end }
  }

  ctx.virtualize_pages = function() {
    if (!state.virtualization_enabled || state.printing_mode) return
    const range = ctx.calculate_visible_range()
    state.visible_range = range
    for (let i = 0; i < state.pages.length; i++) {
      const page = state.pages[i]
      if (!page.elt) continue
      const is_in_range = (i >= range.start && i <= range.end)
      if (!is_in_range && !page.nao_renderizada && !page.template) {
        page.cached_html = page.elt.innerHTML
        page.elt.innerHTML = ''
        page.nao_renderizada = true
        page.elt.classList.add('nao-renderizada')
      } else if (is_in_range && page.nao_renderizada) {
        if (page.cached_html != null) {
          page.elt.innerHTML = page.cached_html
          page.cached_html = null
        }
        page.nao_renderizada = false
        page.elt.classList.remove('nao-renderizada')
      }
    }
  }

  ctx.on_scroll = function() {
    if (!state.virtualization_enabled || state.printing_mode) return
    ctx.virtualize_pages()
    ctx._update_page_statuses()
  }
}
