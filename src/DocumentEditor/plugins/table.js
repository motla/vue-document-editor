import { markRaw, onMounted, onBeforeUnmount } from 'vue'
import TableSizePicker from './table/TableSizePicker.vue'
import { createTableInteraction } from './table/TableInteraction.js'

const RawTableSizePicker = markRaw(TableSizePicker)

export function createTablePlugin(ctx) {
  const interaction = createTableInteraction(ctx)

  // ===== Helpers =====

  function getTableContext() {
    const sel = window.getSelection()
    if (!sel || !sel.focusNode) return null
    let el = sel.focusNode.nodeType === 1 ? sel.focusNode : sel.focusNode.parentElement
    let td = null, tr = null, table = null
    while (el) {
      if (!td && (el.tagName === 'TD' || el.tagName === 'TH')) td = el
      if (!tr && el.tagName === 'TR') tr = el
      if (el.tagName === 'TABLE') { table = el; break }
      if (el.contentEditable === 'true') break
      el = el.parentElement
    }
    if (!table || !tr || !td) return null
    return { table, tr, td }
  }

  function placeCursorIn(el) {
    const sel = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
  }

  function colorSwatch(color, label) {
    if (!color) return '<span style="display:inline-block;width:14px;height:14px;border:1px solid #ccc;vertical-align:middle;margin-right:6px;border-radius:2px"></span> ' + label
    return '<span style="display:inline-block;width:14px;height:14px;background:' + color + ';border:1px solid #ccc;vertical-align:middle;margin-right:6px;border-radius:2px"></span> ' + label
  }

  // ===== Insert Table =====

  function insertTable(rows, cols) {
    let html = '<div class="vde-table-wrapper" style="overflow-x:auto;max-width:100%">'
    html += '<table style="border-collapse:collapse;width:100%;table-layout:auto">'
    for (let r = 0; r < rows; r++) {
      html += '<tr>'
      for (let c = 0; c < cols; c++) {
        html += '<td style="border:1px solid #ccc;padding:6px;min-width:20px"><br></td>'
      }
      html += '</tr>'
    }
    html += '</table></div><div><br></div>'
    document.execCommand('insertHTML', false, html)
  }

  function insertTableCustom() {
    const input = prompt('Linhas \u00d7 Colunas (ex: 4x3)', '3x3')
    if (!input) return
    const parts = input.split(/[x\u00d7,\s]+/)
    const rows = parseInt(parts[0]) || 3
    const cols = parseInt(parts[1]) || 3
    insertTable(Math.min(rows, 50), Math.min(cols, 20))
  }

  // ===== Row Operations =====

  function insertRowAbove() {
    const tctx = getTableContext()
    if (!tctx) return
    const colCount = tctx.tr.cells.length
    const newRow = tctx.table.insertRow(tctx.tr.rowIndex)
    for (let i = 0; i < colCount; i++) {
      const cell = newRow.insertCell()
      cell.style.cssText = 'border:1px solid #ccc;padding:6px;min-width:20px'
      cell.innerHTML = '<br>'
    }
    placeCursorIn(newRow.cells[0])
  }

  function insertRowBelow() {
    const tctx = getTableContext()
    if (!tctx) return
    const colCount = tctx.tr.cells.length
    const newRow = tctx.table.insertRow(tctx.tr.rowIndex + 1)
    for (let i = 0; i < colCount; i++) {
      const cell = newRow.insertCell()
      cell.style.cssText = 'border:1px solid #ccc;padding:6px;min-width:20px'
      cell.innerHTML = '<br>'
    }
    placeCursorIn(newRow.cells[0])
  }

  function deleteRow() {
    const tctx = getTableContext()
    if (!tctx) return
    if (tctx.table.rows.length <= 1) { deleteTable(); return }
    const idx = tctx.tr.rowIndex
    tctx.table.deleteRow(idx)
    const row = tctx.table.rows[Math.min(idx, tctx.table.rows.length - 1)]
    if (row && row.cells[0]) placeCursorIn(row.cells[0])
  }

  // ===== Column Operations =====

  function insertColLeft() {
    const tctx = getTableContext()
    if (!tctx) return
    const ci = tctx.td.cellIndex
    for (const row of tctx.table.rows) {
      const cell = row.insertCell(Math.min(ci, row.cells.length))
      cell.style.cssText = 'border:1px solid #ccc;padding:6px;min-width:20px'
      cell.innerHTML = '<br>'
    }
  }

  function insertColRight() {
    const tctx = getTableContext()
    if (!tctx) return
    const ci = tctx.td.cellIndex
    for (const row of tctx.table.rows) {
      const idx = Math.min(ci + 1, row.cells.length)
      const cell = row.insertCell(idx)
      cell.style.cssText = 'border:1px solid #ccc;padding:6px;min-width:20px'
      cell.innerHTML = '<br>'
    }
  }

  function deleteCol() {
    const tctx = getTableContext()
    if (!tctx) return
    if (tctx.table.rows[0].cells.length <= 1) { deleteTable(); return }
    const ci = tctx.td.cellIndex
    for (const row of tctx.table.rows) {
      if (ci < row.cells.length) row.deleteCell(ci)
    }
  }

  // ===== Merge / Split =====

  function mergeRight() {
    const tctx = getTableContext()
    if (!tctx) return
    const next = tctx.td.nextElementSibling
    if (!next || (next.tagName !== 'TD' && next.tagName !== 'TH')) return
    const content = next.innerHTML
    if (content && content !== '<br>') tctx.td.innerHTML += content
    tctx.td.colSpan = (tctx.td.colSpan || 1) + (next.colSpan || 1)
    next.remove()
    placeCursorIn(tctx.td)
  }

  function mergeDown() {
    const tctx = getTableContext()
    if (!tctx) return
    const nextRow = tctx.tr.nextElementSibling
    if (!nextRow) return
    const ci = tctx.td.cellIndex
    if (ci >= nextRow.cells.length) return
    const below = nextRow.cells[ci]
    const content = below.innerHTML
    if (content && content !== '<br>') tctx.td.innerHTML += content
    tctx.td.rowSpan = (tctx.td.rowSpan || 1) + (below.rowSpan || 1)
    below.remove()
    if (nextRow.cells.length === 0) nextRow.remove()
    placeCursorIn(tctx.td)
  }

  function mergeSelectedCells() {
    const cells = interaction.getSelectedCells()
    if (cells.length < 2) return
    // Find bounding rectangle in terms of cellIndex/rowIndex
    const tctx = getTableContext()
    if (!tctx) return

    const first = cells[0]
    // Merge all content into first cell
    for (let i = 1; i < cells.length; i++) {
      const c = cells[i]
      const html = c.innerHTML
      if (html && html !== '<br>') first.innerHTML += html
    }

    // Determine span from selection
    const selCells = interaction.getSelectedCells()
    // Get row/col range
    let minR = Infinity, maxR = -1, minC = Infinity, maxC = -1
    for (const c of selCells) {
      for (let r = 0; r < tctx.table.rows.length; r++) {
        for (let ci = 0; ci < tctx.table.rows[r].cells.length; ci++) {
          if (tctx.table.rows[r].cells[ci] === c) {
            if (r < minR) minR = r
            if (r > maxR) maxR = r
            if (ci < minC) minC = ci
            if (ci > maxC) maxC = ci
          }
        }
      }
    }

    // Set colspan/rowspan on first cell
    const colSpan = maxC - minC + 1
    const rowSpan = maxR - minR + 1
    if (colSpan > 1) first.colSpan = colSpan
    if (rowSpan > 1) first.rowSpan = rowSpan

    // Remove other cells (reverse order to avoid index shifting)
    for (let i = cells.length - 1; i >= 1; i--) {
      const c = cells[i]
      const parentRow = c.parentElement
      c.remove()
      if (parentRow && parentRow.cells.length === 0) parentRow.remove()
    }

    interaction.clearSelection()
    placeCursorIn(first)
  }

  function splitCell() {
    const tctx = getTableContext()
    if (!tctx) return
    const cs = tctx.td.colSpan || 1
    const rs = tctx.td.rowSpan || 1
    if (cs <= 1 && rs <= 1) return

    if (cs > 1) {
      tctx.td.colSpan = 1
      for (let i = 1; i < cs; i++) {
        const nc = document.createElement(tctx.td.tagName.toLowerCase())
        nc.style.cssText = tctx.td.style.cssText
        nc.rowSpan = rs
        nc.innerHTML = '<br>'
        tctx.td.after(nc)
      }
    }
    if (rs > 1) {
      const rowIdx = tctx.tr.rowIndex
      tctx.td.rowSpan = 1
      for (let i = 1; i < rs; i++) {
        const targetRow = tctx.table.rows[rowIdx + i]
        if (!targetRow) break
        const ci = tctx.td.cellIndex
        const colsToAdd = tctx.td.colSpan || 1
        for (let j = 0; j < colsToAdd; j++) {
          const nc = document.createElement(tctx.td.tagName.toLowerCase())
          nc.style.cssText = tctx.td.style.cssText
          nc.innerHTML = '<br>'
          if (ci < targetRow.cells.length) targetRow.cells[ci].before(nc)
          else targetRow.appendChild(nc)
        }
      }
    }
  }

  // ===== Table Properties =====

  function setTableBorder(px, color) {
    const tctx = getTableContext()
    if (!tctx) return
    const border = px > 0 ? px + 'px solid ' + (color || '#333') : 'none'
    for (const row of tctx.table.rows) {
      for (const cell of row.cells) cell.style.border = border
    }
  }

  function setTableWidth(width) {
    const tctx = getTableContext()
    if (!tctx) return
    tctx.table.style.width = width
    // Reset to auto layout when using percentage/auto widths
    if (width === 'auto' || width.includes('%')) {
      tctx.table.style.tableLayout = 'auto'
    }
  }

  // ===== Column Width Operations =====

  function distributeColumnsEvenly() {
    const tctx = getTableContext()
    if (!tctx) return
    const colCount = tctx.table.rows[0] ? tctx.table.rows[0].cells.length : 0
    if (colCount === 0) return
    const pct = (100 / colCount).toFixed(1) + '%'
    tctx.table.style.tableLayout = 'fixed'
    tctx.table.style.width = '100%'
    for (const row of tctx.table.rows) {
      for (const cell of row.cells) {
        cell.style.width = pct
      }
    }
  }

  function autoFitColumns() {
    const tctx = getTableContext()
    if (!tctx) return
    // Remove fixed widths, let browser auto-size based on content
    tctx.table.style.tableLayout = 'auto'
    tctx.table.style.width = '100%'
    for (const row of tctx.table.rows) {
      for (const cell of row.cells) {
        cell.style.width = ''
      }
    }
  }

  function lockAllColumnWidths(table) {
    // Snapshot all current rendered widths and set them explicitly on first row
    // This prevents other columns from being redistributed when one changes
    const firstRow = table.rows[0]
    if (!firstRow) return
    const widths = []
    for (const cell of firstRow.cells) {
      widths.push(cell.getBoundingClientRect().width)
    }
    const tableWidth = table.getBoundingClientRect().width
    // Convert to percentages relative to table width
    for (let i = 0; i < firstRow.cells.length; i++) {
      const pct = ((widths[i] / tableWidth) * 100).toFixed(2)
      firstRow.cells[i].style.width = pct + '%'
    }
  }

  function setCurrentColWidth(width) {
    const tctx = getTableContext()
    if (!tctx) return
    const ci = tctx.td.cellIndex
    // First, lock ALL column widths so they don't redistribute
    lockAllColumnWidths(tctx.table)
    // Switch to fixed layout so column widths are respected
    tctx.table.style.tableLayout = 'fixed'
    if (!tctx.table.style.width || tctx.table.style.width === 'auto') {
      tctx.table.style.width = '100%'
    }
    // Now set the target column width
    const firstRow = tctx.table.rows[0]
    if (firstRow && firstRow.cells[ci]) {
      firstRow.cells[ci].style.width = width
    }
  }

  function setTableAlign(align) {
    const tctx = getTableContext()
    if (!tctx) return
    if (align === 'center') {
      tctx.table.style.marginLeft = 'auto'
      tctx.table.style.marginRight = 'auto'
    } else if (align === 'right') {
      tctx.table.style.marginLeft = 'auto'
      tctx.table.style.marginRight = '0'
    } else {
      tctx.table.style.marginLeft = '0'
      tctx.table.style.marginRight = 'auto'
    }
  }

  function setCellPadding(padding) {
    const tctx = getTableContext()
    if (!tctx) return
    for (const row of tctx.table.rows) {
      for (const cell of row.cells) cell.style.padding = padding
    }
  }

  function toggleHeaderRow() {
    const tctx = getTableContext()
    if (!tctx) return
    const firstRow = tctx.table.rows[0]
    if (!firstRow) return
    const isHeader = firstRow.cells[0] && firstRow.cells[0].tagName === 'TH'
    for (let i = firstRow.cells.length - 1; i >= 0; i--) {
      const old = firstRow.cells[i]
      const nc = document.createElement(isHeader ? 'td' : 'th')
      nc.innerHTML = old.innerHTML
      nc.style.cssText = old.style.cssText
      nc.colSpan = old.colSpan
      nc.rowSpan = old.rowSpan
      if (!isHeader) {
        nc.style.fontWeight = 'bold'
        nc.style.backgroundColor = '#f5f5f5'
      } else {
        nc.style.fontWeight = ''
        nc.style.backgroundColor = ''
      }
      old.replaceWith(nc)
    }
  }

  function setCellBgColor(color) {
    const tctx = getTableContext()
    if (!tctx || !tctx.td) return
    tctx.td.style.backgroundColor = color || ''
  }

  // ===== Delete Table =====

  function deleteTable() {
    const tctx = getTableContext()
    if (!tctx) return
    const p = document.createElement('div')
    p.innerHTML = '<br>'
    // If table is inside a wrapper div, remove the wrapper too
    const wrapper = tctx.table.parentElement
    if (wrapper && wrapper.classList.contains('vde-table-wrapper')) {
      wrapper.parentNode.insertBefore(p, wrapper)
      wrapper.remove()
    } else {
      tctx.table.parentNode.insertBefore(p, tctx.table)
      tctx.table.remove()
    }
    placeCursorIn(p)
  }

  // ===== Paste Normalization =====
  // Word/external tables come with fixed px/pt widths that overflow the page.
  // After paste, detect overflowing tables and normalize their widths.

  function wrapTableInScrollDiv(table) {
    // Skip if already wrapped
    if (table.parentElement && table.parentElement.classList.contains('vde-table-wrapper')) return
    const wrapper = document.createElement('div')
    wrapper.className = 'vde-table-wrapper'
    wrapper.style.overflowX = 'auto'
    wrapper.style.maxWidth = '100%'
    table.parentNode.insertBefore(wrapper, table)
    wrapper.appendChild(table)
  }

  function normalizePastedTable(table) {
    if (!table.parentElement) return
    // Remove nowrap from cells (Word artifact that prevents text wrapping)
    for (const row of table.rows) {
      for (const cell of row.cells) {
        cell.removeAttribute('nowrap')
        if (cell.style.whiteSpace === 'nowrap') cell.style.whiteSpace = ''
      }
    }
    // Wrap in scrollable div — no width changes
    wrapTableInScrollDiv(table)
  }

  function onPaste(e) {
    const html = (e.clipboardData || window.clipboardData || {}).getData('text/html')
    if (!html || (!html.includes('<table') && !html.includes('<TABLE'))) return

    // Wait for browser to insert content, then normalize overflowing tables
    setTimeout(() => {
      const contentEl = ctx.editor.value && ctx.editor.value.contentEl
      if (!contentEl) return
      for (const table of contentEl.querySelectorAll('table')) {
        normalizePastedTable(table)
      }
    }, 200)
  }

  // ===== Tab Key Navigation =====

  function onKeyDown(e) {
    if (e.key !== 'Tab') return
    const tctx = getTableContext()
    if (!tctx) return
    e.preventDefault()

    const cells = []
    for (const row of tctx.table.rows) {
      for (const cell of row.cells) cells.push(cell)
    }
    const idx = cells.indexOf(tctx.td)
    if (idx < 0) return

    if (e.shiftKey) {
      // Previous cell
      if (idx > 0) placeCursorIn(cells[idx - 1])
    } else {
      if (idx < cells.length - 1) {
        // Next cell
        placeCursorIn(cells[idx + 1])
      } else {
        // Last cell: insert new row and move there
        insertRowBelow()
      }
    }
  }

  let _contentElForPaste = null

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
    // Defer interaction attach to next tick so editor ref is ready
    setTimeout(() => {
      interaction.attach()
      _contentElForPaste = ctx.editor.value && ctx.editor.value.contentEl
      if (_contentElForPaste) {
        _contentElForPaste.addEventListener('paste', onPaste)
      }
    }, 0)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown)
    if (_contentElForPaste) {
      _contentElForPaste.removeEventListener('paste', onPaste)
    }
    interaction.detach()
  })

  // ===== Toolbar =====

  return {
    name: 'table',
    tabs: ['inserir', 'editar'],
    order: 20,
    getToolbarItems(tab) {
      const s = ctx.current_text_style.value
      const dis = !s

      // Tab "inserir": only the grid picker to insert new tables
      if (tab === 'inserir') {
        const gridItem = { is: RawTableSizePicker, onSelect: insertTable }
        const customItem = { text: "Personalizado...", click: insertTableCustom }
        return [{
          icon: "border_all", title: "Tabela", disabled: dis, chevron: true,
          menu: [gridItem, { is: "separator" }, customItem],
          menu_width: 200
        }]
      }

      // Tab "editar": table editing operations (only shown when cursor is in a table)
      if (tab === 'editar') {
        const tctx = dis ? null : getTableContext()
        if (!tctx) return []

        const canMergeRight = tctx.td && tctx.td.nextElementSibling
        const canMergeDown = tctx.tr && tctx.tr.nextElementSibling
        const hasSpan = tctx.td && ((tctx.td.colSpan || 1) > 1 || (tctx.td.rowSpan || 1) > 1)
        const hasSelection = interaction.getSelectedCells().length >= 2
        const isHeader = tctx.table.rows[0] && tctx.table.rows[0].cells[0] && tctx.table.rows[0].cells[0].tagName === 'TH'

        return [{
          icon: "border_all", title: "Tabela", chevron: true,
          menu: [
            { text: "Linha", chevron: true, menu: [
              { text: "Inserir acima", click: insertRowAbove },
              { text: "Inserir abaixo", click: insertRowBelow },
              { is: "separator" },
              { text: "Excluir linha", click: deleteRow },
            ], menu_width: 160 },
            { text: "Coluna", chevron: true, menu: [
              { text: "Inserir \u00e0 esquerda", click: insertColLeft },
              { text: "Inserir \u00e0 direita", click: insertColRight },
              { is: "separator" },
              { text: "Excluir coluna", click: deleteCol },
            ], menu_width: 170 },
            { text: "Mesclar / Dividir", chevron: true, menu: [
              { text: "Mesclar sele\u00e7\u00e3o", disabled: !hasSelection, click: mergeSelectedCells },
              { text: "Mesclar \u00e0 direita", disabled: !canMergeRight, click: mergeRight },
              { text: "Mesclar abaixo", disabled: !canMergeDown, click: mergeDown },
              { is: "separator" },
              { text: "Dividir c\u00e9lula", disabled: !hasSpan, click: splitCell },
            ], menu_width: 180 },
            { is: "separator" },
            { text: isHeader ? "Remover cabe\u00e7alho" : "Linha de cabe\u00e7alho", click: toggleHeaderRow },
            { text: "Bordas", chevron: true, menu: [
              { text: "Fina (1px)", click: () => setTableBorder(1, '#ccc') },
              { text: "M\u00e9dia (2px)", click: () => setTableBorder(2, '#999') },
              { text: "Grossa (3px)", click: () => setTableBorder(3, '#333') },
              { text: "Sem borda", click: () => setTableBorder(0) },
            ], menu_width: 140 },
            { text: "Largura da tabela", chevron: true, menu: [
              { text: "Auto", click: () => setTableWidth('auto') },
              { text: "50%", click: () => setTableWidth('50%') },
              { text: "75%", click: () => setTableWidth('75%') },
              { text: "100%", click: () => setTableWidth('100%') },
            ], menu_width: 100 },
            { text: "Colunas", chevron: true, menu: [
              { text: "Ajustar ao conte\u00fado", click: autoFitColumns },
              { text: "Distribuir igualmente", click: distributeColumnsEvenly },
              { is: "separator" },
              { text: "Coluna atual: estreita", click: () => setCurrentColWidth('8%') },
              { text: "Coluna atual: m\u00e9dia", click: () => setCurrentColWidth('15%') },
              { text: "Coluna atual: larga", click: () => setCurrentColWidth('30%') },
              { text: "Coluna atual: extra larga", click: () => setCurrentColWidth('50%') },
            ], menu_width: 200 },
            { text: "Alinhamento", chevron: true, menu: [
              { text: "Esquerda", click: () => setTableAlign('left') },
              { text: "Centro", click: () => setTableAlign('center') },
              { text: "Direita", click: () => setTableAlign('right') },
            ], menu_width: 120 },
            { text: "Padding", chevron: true, menu: [
              { text: "Compacto (2px)", click: () => setCellPadding('2px') },
              { text: "Normal (6px)", click: () => setCellPadding('6px') },
              { text: "Espa\u00e7oso (10px)", click: () => setCellPadding('10px') },
              { text: "Largo (16px)", click: () => setCellPadding('16px') },
            ], menu_width: 150 },
            { text: "Cor da c\u00e9lula", chevron: true, menu: [
              { html: colorSwatch('', 'Sem cor'), click: () => setCellBgColor('') },
              { html: colorSwatch('#fff9c4', 'Amarelo'), click: () => setCellBgColor('#fff9c4') },
              { html: colorSwatch('#c8e6c9', 'Verde'), click: () => setCellBgColor('#c8e6c9') },
              { html: colorSwatch('#bbdefb', 'Azul'), click: () => setCellBgColor('#bbdefb') },
              { html: colorSwatch('#ffcdd2', 'Vermelho'), click: () => setCellBgColor('#ffcdd2') },
              { html: colorSwatch('#f5f5f5', 'Cinza'), click: () => setCellBgColor('#f5f5f5') },
              { html: colorSwatch('#e1bee7', 'Roxo'), click: () => setCellBgColor('#e1bee7') },
              { html: colorSwatch('#ffe0b2', 'Laranja'), click: () => setCellBgColor('#ffe0b2') },
            ], menu_width: 150 },
            { is: "separator" },
            { text: "Excluir tabela", icon: "delete", click: deleteTable },
          ],
          menu_width: 190
        }]
      }

      return []
    }
  }
}
