export function createLineSpacingPlugin(ctx) {
  function _getBlockElement() {
    const sel = window.getSelection()
    if (!sel.focusNode) return null
    let el = sel.focusNode.tagName ? sel.focusNode : sel.focusNode.parentElement
    while (el) {
      if (el.contentEditable === 'true') return null
      const d = window.getComputedStyle(el).display
      if (d === 'block' || d === 'list-item') return el
      el = el.parentElement
    }
    return null
  }

  function _getSelectedBlockElements() {
    const sel = window.getSelection()
    if (!sel.rangeCount) return []
    const range = sel.getRangeAt(0)
    if (range.collapsed) {
      const el = _getBlockElement()
      return el ? [el] : []
    }
    let root = range.commonAncestorContainer
    if (root.nodeType !== 1) root = root.parentElement
    const blocks = []
    const collect = (parent) => {
      for (const child of parent.children) {
        if (!range.intersectsNode(child)) continue
        const d = window.getComputedStyle(child).display
        if (d !== 'block' && d !== 'list-item') continue
        let hasNestedBlock = false
        for (const gc of child.children) {
          if (!range.intersectsNode(gc)) continue
          const gd = window.getComputedStyle(gc).display
          if (gd === 'block' || gd === 'list-item') { hasNestedBlock = true; break }
        }
        if (hasNestedBlock) collect(child)
        else blocks.push(child)
      }
    }
    collect(root)
    if (!blocks.length && root.contentEditable !== 'true') {
      const d = window.getComputedStyle(root).display
      if (d === 'block' || d === 'list-item') return [root]
    }
    return blocks
  }

  function curLineHeight() {
    const s = ctx.current_text_style.value
    if (!s) return 1
    const blockEl = _getBlockElement()
    if (!blockEl) return 1
    const mt = parseFloat(window.getComputedStyle(blockEl).marginTop) || 0
    const fs = parseFloat(s.fontSize) || 16
    return Math.round((mt / fs + 1) * 100) / 100
  }

  function applyLineSpacing(value) {
    const blocks = _getSelectedBlockElements()
    const margin = parseFloat(value) - 1
    blocks.forEach(el => { el.style.marginTop = margin > 0 ? margin + 'em' : '0' })
  }

  function toggleSpaceBefore() {
    const blocks = _getSelectedBlockElements()
    if (!blocks.length) return
    const current = parseFloat(window.getComputedStyle(blocks[0]).marginTop) || 0
    const newVal = current > 0 ? '0' : '12pt'
    blocks.forEach(el => { el.style.marginTop = newVal })
  }

  function toggleSpaceAfter() {
    const blocks = _getSelectedBlockElements()
    if (!blocks.length) return
    const current = parseFloat(window.getComputedStyle(blocks[0]).marginBottom) || 0
    const newVal = current > 0 ? '0' : '12pt'
    blocks.forEach(el => { el.style.marginBottom = newVal })
  }

  function sortSelectedLines() {
    const sel = window.getSelection()
    if (!sel.rangeCount) return
    const range = sel.getRangeAt(0)
    const container = range.commonAncestorContainer.nodeType === 1
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement
    const lines = container.innerHTML.split(/<br\s*\/?>/i).filter(l => l.trim())
    if (lines.length < 2) return
    lines.sort((a, b) => a.replace(/<[^>]+>/g, '').localeCompare(b.replace(/<[^>]+>/g, ''), 'pt'))
    container.innerHTML = lines.join('<br>')
  }

  return {
    name: 'line-spacing',
    tab: 'editar',
    order: 40,
    getToolbarItems() {
      const s = ctx.current_text_style.value
      const dis = !s
      const lh = curLineHeight()
      const blockEl = ctx.mounted.value ? _getBlockElement() : null
      const spaceBefore = blockEl ? parseFloat(window.getComputedStyle(blockEl).marginTop) || 0 : 0
      const spaceAfter = blockEl ? parseFloat(window.getComputedStyle(blockEl).marginBottom) || 0 : 0

      return [
        { icon: "format_line_spacing", title: "Espaçamento", disabled: dis, chevron: true,
          menu: [
            { text: "1,0", active: Math.abs(lh - 1) < 0.08, click: () => applyLineSpacing('1') },
            { text: "1,15", active: Math.abs(lh - 1.15) < 0.08, click: () => applyLineSpacing('1.15') },
            { text: "1,5", active: Math.abs(lh - 1.5) < 0.08, click: () => applyLineSpacing('1.5') },
            { text: "2,0", active: Math.abs(lh - 2) < 0.08, click: () => applyLineSpacing('2') },
            { text: "2,5", active: Math.abs(lh - 2.5) < 0.08, click: () => applyLineSpacing('2.5') },
            { text: "3,0", active: Math.abs(lh - 3) < 0.08, click: () => applyLineSpacing('3') },
            { is: "separator" },
            { text: spaceBefore > 0 ? "Remover espaço antes do parágrafo" : "Adicionar espaço antes do parágrafo", click: toggleSpaceBefore },
            { text: spaceAfter > 0 ? "Remover espaço depois do parágrafo" : "Adicionar espaço depois do parágrafo", click: toggleSpaceAfter },
          ], menu_width: 280 },
        { html: "<b style='font-size:13px'>A</b><b style='font-size:9px'>↓</b><b style='font-size:13px'>Z</b>", title: "Classificar A-Z", disabled: dis, click: sortSelectedLines },
      ]
    }
  }
}
