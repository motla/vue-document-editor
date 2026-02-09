// Print management: before_print / after_print
import { css_to_string } from './utils.js'

export function setupPrint(ctx) {
  const { state, props, refs } = ctx

  // Async print preparation: processes all dirty pages with progress overlay, then prints
  ctx._prepare_and_print = function() {
    if (state._paste_in_progress) return
    if (ctx._dirty_from_page === null) {
      window.print()
      return
    }
    ctx._print_pending = true
    ctx._show_paste_overlay('Preparando documento para impressão...')
    ctx._cancel_deferred_reflow()
    ctx._schedule_deferred_reflow()
  }

  ctx.before_print = function() {
    if (state.editing_hf) ctx.stop_editing_hf()
    state.printing_mode = true
    ctx._cancel_deferred_reflow()
    if (ctx._dirty_from_page !== null) {
      ctx.fit_content_over_pages(Infinity, ctx._dirty_from_page)
      ctx._dirty_from_page = null
    }
    ctx._clear_page_statuses()
    for (const page of state.pages) {
      if (page.nao_renderizada && page.cached_html != null) {
        page.elt.innerHTML = page.cached_html
        page.cached_html = null
        page.nao_renderizada = false
        page.elt.classList.remove('nao-renderizada')
      }
    }
    ctx._page_body = document.body
    const print_body = document.createElement("body")
    print_body.style.margin = "0"
    print_body.style.padding = "0"
    print_body.style.background = "white"
    print_body.style.font = window.getComputedStyle(refs.editor.value).font
    print_body.className = refs.editor.value.className
    for(const [page_idx, page] of state.pages.entries()){
      page.elt.style = ""
      page.elt.style.position = "relative"
      const epm = ctx.effective_page_margins.value
      page.elt.style.padding = (typeof epm == "function") ? epm(page_idx + 1, state.pages.length) : epm
      page.elt.style.breakBefore = page_idx ? "page" : "auto"
      page.elt.style.width = "calc("+props.page_format_mm[0]+"mm - 2px)"
      page.elt.style.height = "calc("+props.page_format_mm[1]+"mm - 2px)"
      page.elt.style.boxSizing = "border-box"
      page.elt.style.overflow = "hidden"
      const overlay_elt = state.pages_overlay_refs[page.uuid]
      if(overlay_elt){
        overlay_elt.style.position = "absolute"
        overlay_elt.style.left = "0"
        overlay_elt.style.top = "0"
        overlay_elt.style.transform = "none"
        overlay_elt.style.padding = "0"
        overlay_elt.style.overflow = "hidden"
        page.elt.prepend(overlay_elt)
      }
      print_body.append(page.elt)
    }
    const return_overlay = document.createElement("div")
    return_overlay.className = "hidden-print"
    return_overlay.style.position = "fixed"
    return_overlay.style.left = "0"
    return_overlay.style.top = "0"
    return_overlay.style.right = "0"
    return_overlay.style.bottom = "0"
    return_overlay.style.display = "flex"
    return_overlay.style.alignItems = "center"
    return_overlay.style.justifyContent = "center"
    return_overlay.style.background = "rgba(255, 255, 255, 0.95)"
    return_overlay.style.cursor = "pointer"
    return_overlay.innerHTML = '<svg width="220" height="220"><path fill="rgba(0, 0, 0, 0.7)" d="M120.774,179.271v40c47.303,0,85.784-38.482,85.784-85.785c0-47.3-38.481-85.782-85.784-85.782H89.282L108.7,28.286L80.417,0L12.713,67.703l67.703,67.701l28.283-28.284L89.282,87.703h31.492c25.246,0,45.784,20.538,45.784,45.783C166.558,158.73,146.02,179.271,120.774,179.271z"/></svg>'
    return_overlay.addEventListener("click", ctx.after_print)
    print_body.append(return_overlay)
    document.body = print_body
  }

  ctx.after_print = function() {
    state.printing_mode = false
    for(const [page_idx, page] of state.pages.entries()){
      page.elt.style = css_to_string(ctx.page_style(page_idx, page.template ? false : true))
      refs.content.value.append(page.elt)
      const overlay_elt = state.pages_overlay_refs[page.uuid]
      if(overlay_elt) {
        overlay_elt.style = css_to_string(ctx.page_style(page_idx, false))
        refs.overlays.value.append(overlay_elt)
      }
    }
    document.body = ctx._page_body
    ctx.update_editor_width()
    if (state.virtualization_enabled) { ctx.virtualize_pages() }
  }
}
