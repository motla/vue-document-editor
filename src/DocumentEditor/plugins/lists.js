import { css_length_to_px } from '../core/utils.js'

export function createListsPlugin(ctx) {
  function isNumberedList(s) {
    return s && s.isList && ['decimal', 'upper-roman', 'lower-roman', 'upper-alpha', 'lower-alpha'].includes(s.listStyleType)
  }

  function isBulletedList(s) {
    return s && s.isList && ['disc', 'circle', 'square'].includes(s.listStyleType)
  }

  function applyNumberedList(styleType) {
    const s = ctx.current_text_style.value
    if (isBulletedList(s)) document.execCommand('insertUnorderedList')
    if (!isNumberedList(s)) document.execCommand('insertOrderedList')
    const sel = window.getSelection()
    if (!sel.focusNode) return
    let el = sel.focusNode.tagName ? sel.focusNode : sel.focusNode.parentElement
    while (el && el.tagName !== 'OL') el = el.parentElement
    if (el) el.style.listStyleType = styleType
  }

  function applyBulletedList(styleType) {
    const s = ctx.current_text_style.value
    if (isNumberedList(s)) document.execCommand('insertOrderedList')
    if (!isBulletedList(s)) document.execCommand('insertUnorderedList')
    const sel = window.getSelection()
    if (!sel.focusNode) return
    let el = sel.focusNode.tagName ? sel.focusNode : sel.focusNode.parentElement
    while (el && el.tagName !== 'UL') el = el.parentElement
    if (el) el.style.listStyleType = styleType
  }

  function removeList() {
    const s = ctx.current_text_style.value
    if (isNumberedList(s)) document.execCommand('insertOrderedList')
    else if (isBulletedList(s)) document.execCommand('insertUnorderedList')
  }

  // Find the nearest block element suitable for indentation (not the page itself)
  function findIndentableBlock(node) {
    let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node
    while (el) {
      if (el.dataset && el.dataset.isVDEPage !== undefined) return null
      const display = window.getComputedStyle(el).display
      if (display !== 'inline' && display !== 'inline-block') {
        return el
      }
      el = el.parentElement
    }
    return null
  }

  // Apply margin-left change to all selected block elements
  function changeBlockIndent(delta) {
    const sel = window.getSelection()
    console.log('[LISTS] changeBlockIndent(%d): rangeCount=%d, focusNode=', delta, sel.rangeCount, sel.focusNode)
    if (!sel.rangeCount) { console.warn('[LISTS] changeBlockIndent: no range!'); return }

    const blocks = []
    const seen = new Set()
    function addBlock(node) {
      const block = findIndentableBlock(node)
      if (block && !seen.has(block)) { seen.add(block); blocks.push(block) }
    }

    if (sel.isCollapsed) {
      addBlock(sel.focusNode)
    } else {
      const range = sel.getRangeAt(0)
      addBlock(range.startContainer)
      addBlock(range.endContainer)
      // Include sibling blocks between start and end
      if (blocks.length === 2 && blocks[0] !== blocks[1]) {
        let el = blocks[0].nextElementSibling
        while (el && el !== blocks[1]) {
          addBlock(el)
          el = el.nextElementSibling
        }
      }
    }

    console.log('[LISTS] changeBlockIndent: found %d blocks', blocks.length, blocks)
    if (!blocks.length) { console.warn('[LISTS] changeBlockIndent: no indentable blocks found!'); return }
    for (const block of blocks) {
      const current = css_length_to_px(block.style.marginLeft)
      const newVal = Math.max(0, current + delta)
      block.style.marginLeft = newVal ? newVal + 'px' : ''
    }
    // Trigger reflow via input event
    blocks[0].dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'formatIndent' }))
  }

  function increaseIndent() {
    const s = ctx.current_text_style.value
    console.log('[LISTS] increaseIndent called, current_text_style=', !!s, s ? { isList: s.isList } : null)
    if (s && s.isList) {
      document.execCommand("indent")
    } else {
      changeBlockIndent(40)
    }
  }

  function decreaseIndent() {
    const s = ctx.current_text_style.value
    console.log('[LISTS] decreaseIndent called, current_text_style=', !!s, s ? { isList: s.isList } : null)
    if (s && s.isList) {
      document.execCommand("outdent")
    } else {
      changeBlockIndent(-40)
    }
  }

  // Toggle first-line indent (text-indent) on the current block
  function toggleFirstLineIndent() {
    const sel = window.getSelection()
    if (!sel || !sel.focusNode) return
    const block = findIndentableBlock(sel.focusNode)
    if (!block) return
    const current = css_length_to_px(block.style.textIndent)
    block.style.textIndent = current > 0 ? '' : '40px'
    block.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'formatIndent' }))
  }

  // Check if current block has first-line indent
  function hasFirstLineIndent() {
    const sel = window.getSelection()
    if (!sel || !sel.focusNode) return false
    const block = findIndentableBlock(sel.focusNode)
    if (!block) return false
    return css_length_to_px(block.style.textIndent) > 0
  }

  return {
    name: 'lists',
    tab: 'editar',
    order: 30,
    getToolbarItems() {
      const s = ctx.current_text_style.value
      const dis = !s
      const numbered = isNumberedList(s)
      const bulleted = isBulletedList(s)
      const curType = (s && s.isList) ? s.listStyleType : ''
      const firstLineActive = !dis && hasFirstLineIndent()

      return [
        { icon: "format_list_numbered", title: "Lista numerada", active: numbered, disabled: dis, chevron: true,
          menu: [
            { text: "Nenhum", click: removeList },
            { is: "separator" },
            { html: "1. &nbsp;2. &nbsp;3.", active: curType === 'decimal', click: () => applyNumberedList('decimal') },
            { html: "I. &nbsp;II. &nbsp;III.", active: curType === 'upper-roman', click: () => applyNumberedList('upper-roman') },
            { html: "A. &nbsp;B. &nbsp;C.", active: curType === 'upper-alpha', click: () => applyNumberedList('upper-alpha') },
            { html: "a. &nbsp;b. &nbsp;c.", active: curType === 'lower-alpha', click: () => applyNumberedList('lower-alpha') },
            { html: "i. &nbsp;ii. &nbsp;iii.", active: curType === 'lower-roman', click: () => applyNumberedList('lower-roman') },
          ], menu_width: 150 },
        { icon: "format_list_bulleted", title: "Lista com marcadores", active: bulleted, disabled: dis, chevron: true,
          menu: [
            { text: "Nenhum", click: removeList },
            { is: "separator" },
            { html: "● &nbsp;&nbsp;Disco", active: curType === 'disc', click: () => applyBulletedList('disc') },
            { html: "○ &nbsp;&nbsp;Círculo", active: curType === 'circle', click: () => applyBulletedList('circle') },
            { html: "■ &nbsp;&nbsp;Quadrado", active: curType === 'square', click: () => applyBulletedList('square') },
          ], menu_width: 160 },
        { icon: "format_indent_decrease", title: "Diminuir recuo", disabled: dis, click: decreaseIndent },
        { icon: "format_indent_increase", title: "Aumentar recuo", disabled: dis, click: increaseIndent },
        { icon: "keyboard_tab", title: "Recuo na primeira linha (Tab)", active: firstLineActive, disabled: dis, click: toggleFirstLineIndent },
      ]
    }
  }
}
