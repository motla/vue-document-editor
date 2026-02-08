/**
 * TableInteraction.js
 * Inline table manipulation: column/row resize, table resize handle, cell selection.
 * Called from the table plugin's onMounted/onBeforeUnmount lifecycle.
 *
 * Usage:
 *   const interaction = createTableInteraction(ctx)
 *   onMounted(() => interaction.attach())
 *   onBeforeUnmount(() => interaction.detach())
 */

const EDGE_THRESHOLD = 5 // pixels to detect border proximity
const HANDLE_SIZE = 8

export function createTableInteraction(ctx) {
  let contentEl = null
  let editorEl = null

  // --- State ---
  let hoverState = null       // { type: 'col'|'row'|'handle', table, index, rect } or null
  let dragState = null         // { type, table, index, startX, startY, startSizes, indicator } or null
  let selectionState = null    // { table, anchorRow, anchorCol, currentRow, currentCol } or null
  let mouseDownOnCell = false

  // Overlay elements
  let indicator = null         // the blue resize line (position:fixed)
  let handle = null            // the table resize handle (position:fixed)
  let resizeHandle = null      // small arrow icon on border hover (position:fixed)

  function getZoom() {
    return ctx.zoom ? ctx.zoom.value : 1
  }

  // Get max available width for a table (from its page container)
  function getMaxTableWidth(table) {
    // Walk up to find the page div (direct child of contentEl)
    let el = table
    while (el && el.parentElement !== contentEl) {
      el = el.parentElement
    }
    // el is the page div; clientWidth accounts for padding
    return el ? el.clientWidth : Infinity
  }

  // ===== Helpers =====

  function findTableFromEvent(e) {
    let el = e.target
    while (el && el !== contentEl) {
      if (el.tagName === 'TABLE') return el
      el = el.parentElement
    }
    return null
  }

  function findCellFromEvent(e) {
    let el = e.target
    while (el && el !== contentEl) {
      if (el.tagName === 'TD' || el.tagName === 'TH') return el
      el = el.parentElement
    }
    return null
  }

  function getCellRowCol(table, cell) {
    for (let r = 0; r < table.rows.length; r++) {
      for (let c = 0; c < table.rows[r].cells.length; c++) {
        if (table.rows[r].cells[c] === cell) return { row: r, col: c }
      }
    }
    return null
  }

  // ===== Resize Indicator (blue line) =====

  function createIndicator() {
    if (indicator) return indicator
    indicator = document.createElement('div')
    indicator.style.cssText = 'position:fixed;background:#1a73e8;z-index:10000;pointer-events:none;display:none'
    document.body.appendChild(indicator)
    return indicator
  }

  function showIndicator(type, x, y, length) {
    createIndicator()
    if (type === 'col') {
      indicator.style.left = x + 'px'
      indicator.style.top = y + 'px'
      indicator.style.width = '2px'
      indicator.style.height = length + 'px'
      indicator.style.cursor = 'col-resize'
    } else {
      indicator.style.left = x + 'px'
      indicator.style.top = y + 'px'
      indicator.style.width = length + 'px'
      indicator.style.height = '2px'
      indicator.style.cursor = 'row-resize'
    }
    indicator.style.display = 'block'
  }

  function hideIndicator() {
    if (indicator) indicator.style.display = 'none'
  }

  // ===== Table Resize Handle (bottom-right square) =====

  function createHandle() {
    if (handle) return handle
    handle = document.createElement('div')
    handle.style.cssText = 'position:fixed;width:' + HANDLE_SIZE + 'px;height:' + HANDLE_SIZE + 'px;background:#1a73e8;cursor:nwse-resize;z-index:10000;display:none;border-radius:1px'
    handle.addEventListener('mousedown', onHandleMouseDown)
    document.body.appendChild(handle)
    return handle
  }

  function positionHandle(table) {
    createHandle()
    const rect = table.getBoundingClientRect()

    // If table is in a wrapper, the wrapper scrolls — don't hide based on page bounds
    if (!isInWrapper(table)) {
      let pageEl = table
      while (pageEl && pageEl.parentElement !== contentEl) {
        pageEl = pageEl.parentElement
      }
      if (pageEl) {
        const pageRect = pageEl.getBoundingClientRect()
        if (rect.right > pageRect.right + 2 || rect.bottom > pageRect.bottom + 2) {
          handle.style.display = 'none'
          return
        }
      }
    }

    handle.style.left = (rect.right - HANDLE_SIZE / 2) + 'px'
    handle.style.top = (rect.bottom - HANDLE_SIZE / 2) + 'px'
    handle.style.display = 'block'
    handle._table = table
  }

  function hideHandle() {
    if (handle) handle.style.display = 'none'
  }

  // ===== Resize Handle (arrow icon on border hover, Word-style) =====

  function createResizeHandle() {
    if (resizeHandle) return resizeHandle
    resizeHandle = document.createElement('div')
    resizeHandle.style.cssText = 'position:fixed;z-index:10001;pointer-events:none;display:none;' +
      'background:white;border:1px solid #1a73e8;border-radius:3px;' +
      'color:#1a73e8;align-items:center;justify-content:center;' +
      'box-shadow:0 1px 3px rgba(0,0,0,0.25);user-select:none;font-weight:bold'
    document.body.appendChild(resizeHandle)
    return resizeHandle
  }

  function showResizeHandle(type, x, y) {
    createResizeHandle()
    if (type === 'col') {
      resizeHandle.textContent = '\u2194' // ↔
      resizeHandle.style.width = '22px'
      resizeHandle.style.height = '16px'
      resizeHandle.style.fontSize = '14px'
      resizeHandle.style.lineHeight = '14px'
      resizeHandle.style.left = (x - 11) + 'px'
      resizeHandle.style.top = (y - 8) + 'px'
      resizeHandle.style.cursor = 'col-resize'
    } else {
      resizeHandle.textContent = '\u2195' // ↕
      resizeHandle.style.width = '16px'
      resizeHandle.style.height = '22px'
      resizeHandle.style.fontSize = '14px'
      resizeHandle.style.lineHeight = '20px'
      resizeHandle.style.left = (x - 8) + 'px'
      resizeHandle.style.top = (y - 11) + 'px'
      resizeHandle.style.cursor = 'row-resize'
    }
    resizeHandle.style.display = 'flex'
  }

  function hideResizeHandle() {
    if (resizeHandle) resizeHandle.style.display = 'none'
  }

  // ===== Cell Selection =====

  function clearSelection() {
    if (!selectionState) return
    const table = selectionState.table
    for (const row of table.rows) {
      for (const cell of row.cells) {
        cell.classList.remove('vde-cell-selected')
      }
    }
    selectionState = null
  }

  function applySelection() {
    if (!selectionState) return
    const { table, anchorRow, anchorCol, currentRow, currentCol } = selectionState
    const minR = Math.min(anchorRow, currentRow)
    const maxR = Math.max(anchorRow, currentRow)
    const minC = Math.min(anchorCol, currentCol)
    const maxC = Math.max(anchorCol, currentCol)

    for (let r = 0; r < table.rows.length; r++) {
      for (let c = 0; c < table.rows[r].cells.length; c++) {
        const cell = table.rows[r].cells[c]
        if (r >= minR && r <= maxR && c >= minC && c <= maxC) {
          cell.classList.add('vde-cell-selected')
        } else {
          cell.classList.remove('vde-cell-selected')
        }
      }
    }
  }

  function getSelectedCells() {
    if (!selectionState) return []
    const { table, anchorRow, anchorCol, currentRow, currentCol } = selectionState
    const minR = Math.min(anchorRow, currentRow)
    const maxR = Math.max(anchorRow, currentRow)
    const minC = Math.min(anchorCol, currentCol)
    const maxC = Math.max(anchorCol, currentCol)
    const cells = []
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (table.rows[r] && table.rows[r].cells[c]) {
          cells.push(table.rows[r].cells[c])
        }
      }
    }
    return cells
  }

  // ===== Detect Edge Proximity =====

  function detectEdge(e) {
    const table = findTableFromEvent(e)
    if (!table) return null

    const cell = findCellFromEvent(e)
    if (!cell) return null

    const cellRect = cell.getBoundingClientRect()
    const mx = e.clientX
    const my = e.clientY

    // Check right border of cell = column resize (this cell's right edge)
    if (Math.abs(mx - cellRect.right) < EDGE_THRESHOLD) {
      const pos = getCellRowCol(table, cell)
      if (pos) {
        const tableRect = table.getBoundingClientRect()
        return { type: 'col', table, index: pos.col, edge: cellRect.right, top: tableRect.top, height: tableRect.height }
      }
    }

    // Check left border of cell = column resize (previous column's right edge)
    if (Math.abs(mx - cellRect.left) < EDGE_THRESHOLD) {
      const pos = getCellRowCol(table, cell)
      if (pos && pos.col > 0) {
        const tableRect = table.getBoundingClientRect()
        return { type: 'col', table, index: pos.col - 1, edge: cellRect.left, top: tableRect.top, height: tableRect.height }
      }
    }

    // Check bottom border of cell = row resize
    if (Math.abs(my - cellRect.bottom) < EDGE_THRESHOLD) {
      const pos = getCellRowCol(table, cell)
      if (pos) {
        const tableRect = table.getBoundingClientRect()
        return { type: 'row', table, index: pos.row, edge: cellRect.bottom, left: tableRect.left, width: tableRect.width }
      }
    }

    // Check top border of cell = row resize (previous row's bottom edge)
    if (Math.abs(my - cellRect.top) < EDGE_THRESHOLD) {
      const pos = getCellRowCol(table, cell)
      if (pos && pos.row > 0) {
        const tableRect = table.getBoundingClientRect()
        return { type: 'row', table, index: pos.row - 1, edge: cellRect.top, left: tableRect.left, width: tableRect.width }
      }
    }

    return null
  }

  // ===== Column Width Helpers =====

  function getColWidths(table) {
    // Get widths from first row cells
    const firstRow = table.rows[0]
    if (!firstRow) return []
    const widths = []
    for (const cell of firstRow.cells) {
      widths.push(cell.getBoundingClientRect().width / getZoom())
    }
    return widths
  }

  function isInWrapper(table) {
    return table.parentElement && table.parentElement.classList.contains('vde-table-wrapper')
  }

  function setColWidths(table, widths) {
    let totalWidth = widths.reduce((s, w) => s + w, 0)

    // Only clamp if NOT inside an overflow wrapper (wrapper handles overflow via scrollbar)
    if (!isInWrapper(table)) {
      const maxW = getMaxTableWidth(table)
      if (totalWidth > maxW) {
        const scale = maxW / totalWidth
        for (let i = 0; i < widths.length; i++) widths[i] *= scale
        totalWidth = maxW
      }
    }

    // Apply fixed px widths to ensure table respects them
    table.style.tableLayout = 'fixed'
    table.style.width = totalWidth + 'px'

    // Apply to each cell in first row (with colgroup-like effect when table-layout:fixed)
    const firstRow = table.rows[0]
    if (!firstRow) return
    for (let i = 0; i < firstRow.cells.length && i < widths.length; i++) {
      firstRow.cells[i].style.width = widths[i] + 'px'
    }
  }

  // ===== Row Height Helper =====

  function getRowHeights(table) {
    const heights = []
    for (const row of table.rows) {
      heights.push(row.getBoundingClientRect().height / getZoom())
    }
    return heights
  }

  // ===== Event Handlers =====

  function onMouseMove(e) {
    if (dragState) return // during drag, don't update hover

    // Detect resize edges (inside table, near cell borders)
    const edge = detectEdge(e)

    if (edge) {
      hoverState = edge
      if (edge.type === 'col') {
        contentEl.style.cursor = 'col-resize'
        showIndicator('col', edge.edge, edge.top, edge.height)
        showResizeHandle('col', edge.edge, e.clientY)
      } else if (edge.type === 'row') {
        contentEl.style.cursor = 'row-resize'
        showIndicator('row', edge.left, edge.edge, edge.width)
        showResizeHandle('row', e.clientX, edge.edge)
      }
    } else {
      hoverState = null
      contentEl.style.cursor = ''
      hideIndicator()
      hideResizeHandle()
    }

    // Show/hide table resize handle
    const table = findTableFromEvent(e)
    if (table && !dragState) {
      positionHandle(table)
    } else if (!table && !dragState) {
      hideHandle()
    }

    // Cell selection drag
    if (selectionState && mouseDownOnCell) {
      const cell = findCellFromEvent(e)
      if (cell) {
        const pos = getCellRowCol(selectionState.table, cell)
        if (pos && (pos.row !== selectionState.currentRow || pos.col !== selectionState.currentCol)) {
          selectionState.currentRow = pos.row
          selectionState.currentCol = pos.col
          applySelection()
          e.preventDefault()
        }
      }
    }
  }

  function onMouseDown(e) {
    // Column/row resize: start drag if hovering near edge
    if (hoverState && e.button === 0) {
      e.preventDefault()
      e.stopPropagation()
      startResize(hoverState, e)
      return
    }

    // Cell selection: start on left-click in a table cell
    const cell = findCellFromEvent(e)
    if (cell && e.button === 0) {
      const table = findTableFromEvent(e)
      if (table) {
        clearSelection()
        const pos = getCellRowCol(table, cell)
        if (pos) {
          selectionState = {
            table,
            anchorRow: pos.row,
            anchorCol: pos.col,
            currentRow: pos.row,
            currentCol: pos.col
          }
          mouseDownOnCell = true
          // Don't prevent default - allow cursor placement
        }
      }
    } else {
      clearSelection()
      mouseDownOnCell = false
    }
  }

  function onMouseUp(e) {
    if (dragState) {
      finishResize(e)
      return
    }

    if (mouseDownOnCell && selectionState) {
      mouseDownOnCell = false
      // If anchor == current, it's just a click - clear selection
      if (selectionState.anchorRow === selectionState.currentRow &&
          selectionState.anchorCol === selectionState.currentCol) {
        clearSelection()
      }
    }
  }

  // ===== Resize Logic =====

  function startResize(hover, e) {
    const zoom = getZoom()
    if (hover.type === 'col') {
      const widths = getColWidths(hover.table)
      dragState = {
        type: 'col',
        table: hover.table,
        index: hover.index,
        startX: e.clientX,
        startSizes: widths,
        zoom
      }
    } else if (hover.type === 'row') {
      const heights = getRowHeights(hover.table)
      dragState = {
        type: 'row',
        table: hover.table,
        index: hover.index,
        startY: e.clientY,
        startSizes: heights,
        zoom
      }
    }

    hideResizeHandle()
    document.addEventListener('mousemove', onDragMove)
    document.addEventListener('mouseup', onDragEnd)
    document.body.style.userSelect = 'none'
  }

  function onDragMove(e) {
    if (!dragState) return

    const zoom = dragState.zoom
    if (dragState.type === 'col') {
      const deltaScreen = e.clientX - dragState.startX
      const deltaCss = deltaScreen / zoom
      const newWidths = [...dragState.startSizes]
      const minW = 20 // minimum column width px

      // Resize the column at index
      newWidths[dragState.index] = Math.max(minW, dragState.startSizes[dragState.index] + deltaCss)

      setColWidths(dragState.table, newWidths)

      // Update indicator position
      const tableRect = dragState.table.getBoundingClientRect()
      // Find the right edge of the resized column
      const firstRow = dragState.table.rows[0]
      if (firstRow && firstRow.cells[dragState.index]) {
        const cellRect = firstRow.cells[dragState.index].getBoundingClientRect()
        showIndicator('col', cellRect.right, tableRect.top, tableRect.height)
      }
    } else if (dragState.type === 'row') {
      const deltaScreen = e.clientY - dragState.startY
      const deltaCss = deltaScreen / zoom
      const row = dragState.table.rows[dragState.index]
      if (row) {
        const newH = Math.max(10, dragState.startSizes[dragState.index] + deltaCss)
        row.style.height = newH + 'px'
        // Also set min-height on cells for robustness
        for (const cell of row.cells) {
          cell.style.minHeight = newH + 'px'
        }
      }

      // Update indicator
      const tableRect = dragState.table.getBoundingClientRect()
      if (row) {
        const rowRect = row.getBoundingClientRect()
        showIndicator('row', tableRect.left, rowRect.bottom, tableRect.width)
      }
    }
  }

  function onDragEnd(e) {
    document.removeEventListener('mousemove', onDragMove)
    document.removeEventListener('mouseup', onDragEnd)
    document.body.style.userSelect = ''
    dragState = null
    hideIndicator()
    hoverState = null
    if (contentEl) contentEl.style.cursor = ''
  }

  function finishResize(e) {
    onDragEnd(e)
  }

  // ===== Table Resize Handle =====

  function onHandleMouseDown(e) {
    e.preventDefault()
    e.stopPropagation()

    const table = handle._table
    if (!table) return

    const startX = e.clientX
    const zoom = getZoom()
    const startWidth = table.getBoundingClientRect().width / zoom
    const inWrapper = isInWrapper(table)
    const maxW = inWrapper ? Infinity : getMaxTableWidth(table)

    function onMove(e) {
      const deltaX = (e.clientX - startX) / zoom
      const newWidth = Math.max(50, Math.min(maxW, startWidth + deltaX))
      table.style.width = newWidth + 'px'
      positionHandle(table)
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.body.style.userSelect = 'none'
  }

  // ===== Hide overlays on scroll (reposition) =====

  function onScroll() {
    hideIndicator()
    hideHandle()
    hideResizeHandle()
    hoverState = null
  }

  // ===== Attach / Detach =====

  function attach() {
    contentEl = ctx.editor.value && ctx.editor.value.contentEl
      ? ctx.editor.value.contentEl
      : null
    editorEl = ctx.editor.value && ctx.editor.value.$el
      ? ctx.editor.value.$el
      : null

    if (!contentEl) return

    contentEl.addEventListener('mousemove', onMouseMove)
    contentEl.addEventListener('mousedown', onMouseDown, true)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('scroll', onScroll, true)
  }

  function detach() {
    if (contentEl) {
      contentEl.removeEventListener('mousemove', onMouseMove)
      contentEl.removeEventListener('mousedown', onMouseDown, true)
      contentEl.style.cursor = ''
    }
    window.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('scroll', onScroll, true)

    // Clean up overlays
    if (indicator) { indicator.remove(); indicator = null }
    if (handle) { handle.removeEventListener('mousedown', onHandleMouseDown); handle.remove(); handle = null }
    if (resizeHandle) { resizeHandle.remove(); resizeHandle = null }

    clearSelection()
    dragState = null
    hoverState = null
  }

  return {
    attach,
    detach,
    getSelectedCells,
    clearSelection
  }
}
