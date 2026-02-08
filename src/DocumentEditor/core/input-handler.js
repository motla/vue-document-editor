// Input handling (keystrokes, paste) and text style detection

export function setupInputHandler(ctx) {
  const { state } = ctx

  ctx.process_current_text_style = function() {
    let style = false
    const sel = window.getSelection()
    if(sel.focusNode) {
      const element = sel.focusNode.tagName ? sel.focusNode : sel.focusNode.parentElement
      if(element && element.isContentEditable) {
        style = window.getComputedStyle(element)
        style.textDecorationStack = []
        style.headerLevel = 0
        style.isList = false
        let parent = element
        while(parent){
          const parent_style = window.getComputedStyle(parent)
          style.textDecorationStack.push(parent_style.textDecoration)
          if(parent_style.display == "list-item") style.isList = true
          if(!style.headerLevel){
            for(let i = 1; i <= 6; i++){
              if(parent.tagName.toUpperCase() == "H"+i) { style.headerLevel = i; break }
            }
          }
          parent = parent.parentElement
        }
      }
    }
    state.current_text_style = style
  }

  ctx._do_input_work = function() {
    ctx._cancel_deferred_reflow()
    ctx.fit_content_over_pages(2)
    ctx.emit_new_content()
    if(ctx._last_input_type != "insertText") ctx.process_current_text_style()
    ctx._update_page_statuses()
    if (ctx._dirty_from_page !== null) {
      ctx._schedule_deferred_reflow()
    } else {
      if (state._paste_in_progress) {
        state._paste_in_progress = false
        ctx._hide_paste_overlay()
      }
    }
  }

  ctx.onInput = function(e) {
    if(!e) return
    ctx._last_input_type = e.inputType
    if (ctx._input_timer) clearTimeout(ctx._input_timer)
    const is_paste = e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop'
    if (is_paste) {
      state._paste_in_progress = true
      ctx._show_paste_overlay('Colando texto...')
      ctx._input_timer = setTimeout(() => {
        ctx._input_timer = null
        requestAnimationFrame(() => { setTimeout(() => { ctx._do_input_work() }, 0) })
      }, 10)
    } else {
      ctx._input_timer = setTimeout(() => { ctx._input_timer = null; ctx._do_input_work() }, 10)
    }
  }
}
