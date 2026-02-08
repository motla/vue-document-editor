// Deferred reflow: background page processing with rAF+setTimeout pattern
import { new_uuid } from './utils.js'

export function setupDeferredReflow(ctx) {
  const { state, refs } = ctx

  ctx._cancel_deferred_reflow = function() {
    if (ctx._deferred_raf_id) {
      cancelAnimationFrame(ctx._deferred_raf_id)
      ctx._deferred_raf_id = null
    }
  }

  // Pre-splits pages whose content is much larger than page height into roughly page-sized chunks
  ctx._pre_split_large_pages = function() {
    if (!state.pages_height) return
    let did_split = false
    for (let pi = 0; pi < state.pages.length; pi++) {
      const page = state.pages[pi]
      if (page.template) continue
      const scroll_h = page.elt.scrollHeight
      const ratio = scroll_h / state.pages_height
      if (ratio <= 3) continue
      const wrapper = page.elt.firstChild
      if (!wrapper || !wrapper.children || wrapper.children.length < 2) continue
      const children = [...wrapper.children]
      const est_pages = (state._import_page_count && state._import_page_count > ratio) ? state._import_page_count : Math.ceil(ratio)
      const per_page = Math.max(1, Math.ceil(children.length / est_pages))
      const num_new_pages = Math.ceil(children.length / per_page) - 1
      if (num_new_pages < 1) continue
      const new_pages = []
      for (let i = 0; i < num_new_pages; i++) {
        new_pages.push({ uuid: new_uuid(), content_idx: page.content_idx })
      }
      state.pages.splice(pi + 1, 0, ...new_pages)
      ctx.update_pages_elts()
      for (let g = 0; g < num_new_pages; g++) {
        const target = state.pages[pi + 1 + g]
        const new_wrapper = document.createElement('div')
        const start = (g + 1) * per_page
        const end = Math.min((g + 2) * per_page, children.length)
        for (let ci = start; ci < end; ci++) {
          new_wrapper.appendChild(children[ci])
        }
        target.elt.appendChild(new_wrapper)
      }
      pi += num_new_pages
      did_split = true
    }
    if (did_split) {
      for (const page of state.pages) {
        refs.content.value.appendChild(page.elt)
      }
    }
  }

  ctx._schedule_deferred_reflow = function() {
    ctx._cancel_deferred_reflow()
    ctx._deferred_raf_id = requestAnimationFrame(() => {
      setTimeout(() => {
        ctx._deferred_raf_id = null
        ctx._deferred_reflow_step()
      }, 0)
    })
  }

  ctx._deferred_reflow_step = function() {
    if (ctx._dirty_from_page === null || ctx._dirty_from_page >= state.pages.length) {
      ctx._dirty_from_page = null
      ctx._update_page_statuses()
      ctx._hide_progress()
      if (state._paste_in_progress) {
        state._paste_in_progress = false
        ctx._hide_paste_overlay()
      }
      state._import_page_count = 0
      ctx.emit_new_content()
      return
    }
    const total_pages = (state._import_page_count && state._import_page_count > state.pages.length)
      ? state._import_page_count : state.pages.length
    const pct = Math.round((ctx._dirty_from_page / total_pages) * 100)
    if (state._paste_in_progress) {
      ctx._show_paste_overlay(`Processando página ${ctx._dirty_from_page + 1} de ${total_pages} (${pct}%)`)
    } else {
      ctx._show_progress(ctx._dirty_from_page, total_pages)
    }
    const batch_size = state._paste_in_progress ? 5 : 1
    ctx.fit_content_over_pages(batch_size, ctx._dirty_from_page)
    ctx._update_page_statuses()
    if (ctx._dirty_from_page !== null) {
      const pct2 = Math.round((ctx._dirty_from_page / total_pages) * 100)
      if (state._paste_in_progress) {
        ctx._show_paste_overlay(`Processando página ${ctx._dirty_from_page + 1} de ${total_pages} (${pct2}%)`)
      } else {
        ctx._show_progress(ctx._dirty_from_page, total_pages)
      }
      ctx._schedule_deferred_reflow()
    } else {
      ctx._hide_progress()
      if (state._paste_in_progress) {
        state._paste_in_progress = false
        ctx._hide_paste_overlay()
      }
      state._import_page_count = 0
      ctx.emit_new_content()
    }
  }
}
