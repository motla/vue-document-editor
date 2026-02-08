// Progress indicators, paste overlays, and page status overlays
import { css_to_string } from './utils.js'

export function setupOverlays(ctx) {
  const { state, refs } = ctx

  ctx._show_progress = function(current_page, total_pages) {
    const el = refs.progress_indicator.value
    const txt = refs.progress_text.value
    if (el) el.style.display = 'flex'
    if (txt) txt.textContent = `Atualizando página ${current_page + 1}/${total_pages}`
  }

  ctx._hide_progress = function() {
    const el = refs.progress_indicator.value
    if (el) el.style.display = 'none'
  }

  ctx._show_paste_overlay = function(text) {
    const el = refs.paste_overlay.value
    const txt = refs.paste_text.value
    if (el) el.style.display = 'flex'
    if (txt) txt.textContent = text
  }

  ctx._hide_paste_overlay = function() {
    const el = refs.paste_overlay.value
    if (el) el.style.display = 'none'
  }

  ctx._update_page_statuses = function() {
    const editing_idx = ctx._get_editing_page_idx()
    const visible = ctx.calculate_visible_range()
    for (let i = 0; i < state.pages.length; i++) {
      const page = state.pages[i]
      let status
      if (ctx._dirty_from_page === null || i < ctx._dirty_from_page) {
        if (i === editing_idx || i === editing_idx + 1) {
          status = 'editing'
        } else {
          status = 'ready'
        }
      } else {
        if (i >= visible.start && i <= visible.end) {
          status = 'loading'
        } else {
          status = 'await'
        }
      }
      page.pg_status = status
    }
    ctx._render_page_status_overlays()
  }

  ctx._render_page_status_overlays = function() {
    if (!ctx._status_overlay_container) {
      ctx._status_overlay_container = document.createElement('div')
      ctx._status_overlay_container.className = 'page-status-overlays'
      refs.editor.value.appendChild(ctx._status_overlay_container)
    }
    if (state._paste_in_progress) {
      ctx._status_overlay_container.innerHTML = ''
      return
    }
    const overlay_pages = state.pages.filter(p => p.pg_status === 'loading' || p.pg_status === 'await')
    const overlay_uuids = new Set(overlay_pages.map(p => p.uuid))
    const existing_overlays = [...ctx._status_overlay_container.children]
    for (const el of existing_overlays) {
      if (!overlay_uuids.has(el.dataset.pageUuid)) {
        el.remove()
      }
    }
    for (const [page_idx, page] of state.pages.entries()) {
      if (page.pg_status !== 'loading' && page.pg_status !== 'await') continue
      let overlay_el = ctx._status_overlay_container.querySelector(`[data-page-uuid="${page.uuid}"]`)
      if (!overlay_el) {
        overlay_el = document.createElement('div')
        overlay_el.className = 'page-status-overlay'
        overlay_el.dataset.pageUuid = page.uuid
        ctx._status_overlay_container.appendChild(overlay_el)
      }
      overlay_el.classList.toggle('pg-loading', page.pg_status === 'loading')
      overlay_el.classList.toggle('pg-await', page.pg_status === 'await')
      if (page.pg_status === 'loading' && !overlay_el.querySelector('.status-spinner')) {
        overlay_el.innerHTML = '<div class="status-spinner"></div>'
      } else if (page.pg_status === 'await' && !overlay_el.querySelector('.status-await-icon')) {
        overlay_el.innerHTML = '<div class="status-await-icon"></div>'
      }
      const style = ctx.page_style(page_idx, false)
      overlay_el.style = css_to_string(style)
      overlay_el.style.overflow = 'hidden'
    }
  }

  ctx._clear_page_statuses = function() {
    if (ctx._status_overlay_container) {
      ctx._status_overlay_container.innerHTML = ''
    }
    for (const page of state.pages) {
      page.pg_status = 'ready'
    }
  }
}
