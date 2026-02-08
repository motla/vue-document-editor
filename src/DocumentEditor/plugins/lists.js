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
        { icon: "format_indent_decrease", title: "Diminuir recuo", disabled: dis, click: () => document.execCommand("outdent") },
        { icon: "format_indent_increase", title: "Aumentar recuo", disabled: dis, click: () => document.execCommand("indent") },
      ]
    }
  }
}
