// Core reflow engine: reset_content, fit_content_over_pages, content emission
import { defineCustomElement } from 'vue'
import { move_children_forward_recursively, move_children_backwards_with_merging } from '../imports/page-transition-mgmt.js'
import { new_uuid } from './utils.js'

export function setupReflowEngine(ctx) {
  const { state, props, emit, refs } = ctx

  ctx._get_editing_page_idx = function() {
    const sel = document.getSelection()
    if (!sel || !sel.anchorNode) return 0
    let node = sel.anchorNode
    while (node && node.parentElement) {
      if (node.dataset && node.dataset.isVDEPage !== undefined) {
        const idx = state.pages.findIndex(p => p.elt === node)
        return idx >= 0 ? idx : 0
      }
      node = node.parentElement
    }
    return 0
  }

  ctx.reset_content = function() {
    if(ctx._reset_in_progress) return
    ctx._reset_in_progress = true
    ctx._cancel_deferred_reflow()
    if(!props.content.length) {
      ctx._reset_in_progress = false
      emit("update:content", [""])
      return
    }
    state.pages = props.content.map((content, content_idx) => ({
      uuid: new_uuid(),
      content_idx,
      template: content.template,
      props: content.props
    }))
    ctx.update_pages_elts()
    const first_page_elt = state.pages[0].elt
    if(!refs.content.value.contains(first_page_elt)) refs.content.value.appendChild(first_page_elt)
    state.pages_height = first_page_elt.clientHeight + 1
    for(const page of state.pages) {
      if(!props.content[page.content_idx]) page.elt.innerHTML = "<div><br></div>"
      else if(typeof props.content[page.content_idx] == "string") page.elt.innerHTML = "<div>"+props.content[page.content_idx]+"</div>"
      else if(page.template) {
        const componentElement = defineCustomElement(page.template)
        customElements.define('component-'+page.uuid, componentElement)
        page.elt.appendChild(new componentElement({ modelValue: page.props }))
      }
      if(!refs.content.value.contains(page.elt)) refs.content.value.appendChild(page.elt)
    }
    ctx._pre_split_large_pages()
    state._paste_in_progress = true
    ctx._show_paste_overlay('Processando documento...')
    ctx._dirty_from_page = 0
    refs.content.value.blur()
    state.virtualization_enabled = true
    ctx.virtualize_pages()
    ctx._reset_in_progress = false
    ctx._update_page_statuses()
    if (ctx._dirty_from_page !== null) {
      ctx._schedule_deferred_reflow()
    } else {
      state._paste_in_progress = false
      ctx._hide_paste_overlay()
    }
  }

  ctx.fit_content_over_pages = function(max_pages, start_from) {
    if (max_pages === undefined) max_pages = Infinity
    if (start_from === undefined) start_from = 0
    if(!state.pages_height) return
    if(ctx._fit_in_progress) return
    ctx._fit_in_progress = true

    for(let page_idx = state.pages.length - 1; page_idx >= 0; page_idx--) {
      const page = state.pages[page_idx]
      if(!page.elt || !document.body.contains(page.elt)) state.pages.splice(page_idx, 1)
    }
    if(!state.pages.length){
      ctx._fit_in_progress = false
      emit("update:content", [""])
      return
    }

    const selection = window.getSelection()
    const start_marker = document.createElement("null")
    const end_marker = document.createElement("null")
    if(selection && selection.rangeCount && selection.anchorNode && !(selection.anchorNode.dataset && selection.anchorNode.dataset.isVDEPage != null)) {
      const range = selection.getRangeAt(0)
      range.insertNode(start_marker)
      range.collapse(false)
      range.insertNode(end_marker)
    }

    const touched_pages = new Set()
    let pages_added_or_removed = false
    let cascade_truncated = false
    let prev_page_modified_flag = (start_from > 0)
    let cascade_count = 0

    for(let page_idx = start_from; page_idx < state.pages.length; page_idx++) {
      const page = state.pages[page_idx]
      if (page.nao_renderizada && !prev_page_modified_flag) { continue }
      if (max_pages !== Infinity && cascade_count >= max_pages && prev_page_modified_flag) {
        ctx._dirty_from_page = page_idx
        cascade_truncated = true
        break
      }
      if (page.nao_renderizada) {
        if (page.cached_html != null) { page.elt.innerHTML = page.cached_html; page.cached_html = null }
        page.nao_renderizada = false
        page.elt.classList.remove('nao-renderizada')
      }
      let next_page = state.pages[page_idx + 1]
      let next_page_elt = next_page ? next_page.elt : null
      if (next_page && next_page.nao_renderizada && (prev_page_modified_flag || page.elt.innerHTML != page.prev_innerHTML)) {
        if (next_page.cached_html != null) { next_page.elt.innerHTML = next_page.cached_html; next_page.cached_html = null }
        next_page.nao_renderizada = false
        next_page.elt.classList.remove('nao-renderizada')
        next_page_elt = next_page.elt
      }
      if(!page.template && (prev_page_modified_flag || page.elt.innerHTML != page.prev_innerHTML
        || (next_page_elt && !next_page.template && !next_page.nao_renderizada && next_page_elt.innerHTML != next_page.prev_innerHTML))){
        cascade_count++
        const next_page_html_before = (next_page_elt && !next_page.nao_renderizada) ? next_page_elt.innerHTML : null
        touched_pages.add(page_idx)
        if(page.elt.clientHeight <= state.pages_height && next_page && next_page.content_idx == page.content_idx) {
          move_children_backwards_with_merging(page.elt, next_page_elt, () => !next_page_elt.childNodes.length || (page.elt.clientHeight > state.pages_height))
        }
        if(page.elt.clientHeight > state.pages_height) {
          if(!next_page || next_page.content_idx != page.content_idx) {
            next_page = { uuid: new_uuid(), content_idx: page.content_idx }
            state.pages.splice(page_idx + 1, 0, next_page)
            ctx.update_pages_elts()
            next_page_elt = next_page.elt
            pages_added_or_removed = true
          }
          move_children_forward_recursively(page.elt, next_page_elt, () => (page.elt.clientHeight <= state.pages_height), props.do_not_break)
        }
        if(next_page_elt && next_page.content_idx == page.content_idx && !next_page_elt.childNodes.length) {
          state.pages.splice(page_idx + 1, 1)
          pages_added_or_removed = true
        }
        const current_next_page = state.pages[page_idx + 1]
        const current_next_elt = current_next_page ? current_next_page.elt : null
        if (current_next_elt && next_page_html_before !== null && !current_next_page.nao_renderizada && current_next_elt.innerHTML === next_page_html_before) {
          prev_page_modified_flag = false
        } else {
          prev_page_modified_flag = true
          if (current_next_page) touched_pages.add(page_idx + 1)
        }
      } else {
        touched_pages.add(page_idx)
      }
    }
    if (!cascade_truncated) { ctx._dirty_from_page = null }
    if (pages_added_or_removed) { ctx.update_pages_elts() }
    for(const page_idx of touched_pages) {
      const page = state.pages[page_idx]
      if(page && !page.template && !page.nao_renderizada) page.elt.normalize()
    }
    if(document.body.contains(start_marker)){
      const range = document.createRange()
      range.setStart(start_marker, 0)
      if(document.body.contains(end_marker)) range.setEnd(end_marker, 0)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    if(start_marker.parentElement) start_marker.parentElement.removeChild(start_marker)
    if(end_marker.parentElement) end_marker.parentElement.removeChild(end_marker)
    for(const page_idx of touched_pages) {
      const page = state.pages[page_idx]
      if (page && !page.nao_renderizada) { page.prev_innerHTML = page.elt.innerHTML }
    }
    if (state.virtualization_enabled) { ctx.virtualize_pages() }
    ctx._fit_in_progress = false
  }

  ctx.emit_new_content = function() {
    let removed_pages_flag = false
    const new_content = props.content.map((item, content_idx) => {
      const pages = state.pages.filter(page => (page.content_idx == content_idx))
      if(!pages.length) { removed_pages_flag = true; return false }
      else if(typeof item == "string") {
        return pages.map(page => {
          if (page.nao_renderizada && page.cached_html != null) {
            const temp = document.createElement('div')
            temp.innerHTML = page.cached_html
            let elt = temp
            while(elt.children.length == 1 && elt.firstChild.tagName && elt.firstChild.tagName.toLowerCase() == "div" && !elt.firstChild.getAttribute("style")) { elt = elt.firstChild }
            return ((elt.innerHTML == "<br>" || elt.innerHTML == "<!---->") ? "" : elt.innerHTML)
          }
          let elt = page.elt
          while(elt.children.length == 1 && elt.firstChild.tagName && elt.firstChild.tagName.toLowerCase() == "div" && !elt.firstChild.getAttribute("style")) { elt = elt.firstChild }
          return ((elt.innerHTML == "<br>" || elt.innerHTML == "<!---->") ? "" : elt.innerHTML)
        }).join('')
      }
      else return { template: item.template, props: { ...item.props }}
    }).filter(item => (item !== false))
    if(!removed_pages_flag) state.prevent_next_content_update_from_parent = true
    emit("update:content", new_content)
  }
}
