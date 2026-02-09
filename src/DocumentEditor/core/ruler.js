// Word-style horizontal ruler with indent markers and margin zones
import { css_length_to_px } from './utils.js'

export function setupRuler(ctx) {
  const { state, props, refs } = ctx
  const px_in_mm = 0.2645833333333

  let _track, _marginLeftEl, _marginRightEl, _ticksContainer
  let _firstLineMarker, _leftIndentMarker, _leftRectMarker, _rightIndentMarker
  let _current_block = null
  let _dragging = false

  // ── Wrap existing functions to add ruler sync ──────────────────
  // IMPORTANT: try-catch prevents ruler errors from breaking core editor
  const _orig_process_style = ctx.process_current_text_style
  console.log('[RULER] setupRuler: wrapping process_current_text_style, original is', typeof _orig_process_style)
  if (typeof _orig_process_style !== 'function') {
    console.error('[RULER] CRITICAL: process_current_text_style is NOT a function!', _orig_process_style)
  }
  ctx.process_current_text_style = function() {
    _orig_process_style()
    try { ctx.sync_ruler_markers() } catch(e) { console.warn('[RULER] sync_ruler_markers error:', e) }
  }

  const _orig_update_pages = ctx.update_pages_elts
  console.log('[RULER] setupRuler: wrapping update_pages_elts, original is', typeof _orig_update_pages)
  if (typeof _orig_update_pages !== 'function') {
    console.error('[RULER] CRITICAL: update_pages_elts is NOT a function!', _orig_update_pages)
  }
  ctx.update_pages_elts = function() {
    _orig_update_pages()
    try { ctx.update_ruler() } catch(e) { console.warn('[RULER] update_ruler error:', e) }
  }

  // ── Calculate ruler track position matching first page ─────────
  function _calc_track_position() {
    const page_width = props.page_format_mm[0] / px_in_mm
    const page_spacing_mm = 10
    const page_with_plus_spacing = (page_spacing_mm + props.page_format_mm[0]) * props.zoom / px_in_mm
    const view_padding = 20
    const inner_width = state.editor_width - 2 * view_padding
    let left_px

    if (props.display === "horizontal") {
      if (inner_width > (state.pages.length * page_with_plus_spacing)) {
        const nb_pages_x = Math.floor(inner_width / page_with_plus_spacing)
        left_px = inner_width / (nb_pages_x * 2) - page_width / 2
      } else {
        left_px = page_width / 2 * (props.zoom - 1)
      }
    } else {
      let nb_pages_x = Math.floor(inner_width / page_with_plus_spacing)
      if (nb_pages_x < 1 || props.display === "vertical") nb_pages_x = 1
      const x_pos = inner_width / (nb_pages_x * 2) - page_width / 2
      const x_ofx = Math.max(0, (page_width * props.zoom - inner_width) / 2)
      left_px = x_pos + x_ofx
    }

    const page_css_left = left_px + view_padding
    const visual_left = page_css_left + page_width * (1 - props.zoom) / 2
    const visual_width = page_width * props.zoom
    return { left: visual_left, width: visual_width }
  }

  // ── Parse page margins to unzoomed CSS px ──────────────────────
  function _margins_px() {
    const m = ctx.parsed_margins.value
    return {
      left: parseFloat(m.left) / px_in_mm,
      right: parseFloat(m.right) / px_in_mm,
    }
  }

  // ── Find nearest block element from cursor ─────────────────────
  function _find_block(node) {
    let el = node && node.nodeType === Node.TEXT_NODE ? node.parentElement : node
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

  // ── Check if selection is inside our editor ────────────────────
  function _selection_in_editor() {
    const sel = window.getSelection()
    if (!sel || !sel.focusNode) return false
    const contentEl = refs.content && refs.content.value
    if (!contentEl) return false
    return contentEl.contains(sel.focusNode)
  }

  // ── Initialize ruler DOM ───────────────────────────────────────
  ctx._init_ruler = function() {
    const bar = refs.ruler_bar && refs.ruler_bar.value
    console.log('[RULER] _init_ruler called, bar=', !!bar, '_track=', !!_track)
    if (!bar) { console.warn('[RULER] _init_ruler: ruler_bar ref is null!'); return }
    // Use closure variable _track as guard (survives HMR correctly)
    if (_track) { console.log('[RULER] _init_ruler: already initialized (skipping)'); return }

    // Clear any stale children from previous HMR cycle
    bar.innerHTML = ''
    console.log('[RULER] _init_ruler: creating ruler DOM elements')

    _track = document.createElement('div')
    _track.className = 'vde-ruler-track'
    bar.appendChild(_track)

    _marginLeftEl = document.createElement('div')
    _marginLeftEl.className = 'vde-ruler-margin vde-ruler-margin-left'
    _marginLeftEl.addEventListener('mousedown', (e) => ctx._ruler_start_margin_drag('left', e))
    _track.appendChild(_marginLeftEl)

    _marginRightEl = document.createElement('div')
    _marginRightEl.className = 'vde-ruler-margin vde-ruler-margin-right'
    _marginRightEl.addEventListener('mousedown', (e) => ctx._ruler_start_margin_drag('right', e))
    _track.appendChild(_marginRightEl)

    _ticksContainer = document.createElement('div')
    _ticksContainer.className = 'vde-ruler-ticks'
    _track.appendChild(_ticksContainer)

    _firstLineMarker = document.createElement('div')
    _firstLineMarker.className = 'vde-ruler-marker vde-marker-first-line'
    _firstLineMarker.title = 'Recuo da primeira linha'
    _firstLineMarker.addEventListener('mousedown', (e) => ctx._ruler_start_drag('first-line', e))
    _track.appendChild(_firstLineMarker)

    _leftIndentMarker = document.createElement('div')
    _leftIndentMarker.className = 'vde-ruler-marker vde-marker-left-indent'
    _leftIndentMarker.title = 'Recuo esquerdo'
    _leftIndentMarker.addEventListener('mousedown', (e) => ctx._ruler_start_drag('left-indent', e))
    _track.appendChild(_leftIndentMarker)

    _leftRectMarker = document.createElement('div')
    _leftRectMarker.className = 'vde-ruler-marker vde-marker-left-rect'
    _leftRectMarker.title = 'Recuo esquerdo'
    _leftRectMarker.addEventListener('mousedown', (e) => ctx._ruler_start_drag('left-rect', e))
    _track.appendChild(_leftRectMarker)

    _rightIndentMarker = document.createElement('div')
    _rightIndentMarker.className = 'vde-ruler-marker vde-marker-right-indent'
    _rightIndentMarker.title = 'Recuo direito'
    _rightIndentMarker.addEventListener('mousedown', (e) => ctx._ruler_start_drag('right-indent', e))
    _track.appendChild(_rightIndentMarker)
  }

  // ── Update ruler position and ticks ────────────────────────────
  ctx.update_ruler = function() {
    if (!_track) return
    const pos = _calc_track_position()
    _track.style.left = pos.left + 'px'
    _track.style.width = pos.width + 'px'

    const margins = _margins_px()
    _marginLeftEl.style.width = (margins.left * props.zoom) + 'px'
    _marginRightEl.style.width = (margins.right * props.zoom) + 'px'

    _generate_ticks(pos.width)
    ctx.sync_ruler_markers()
  }

  function _generate_ticks(trackWidth) {
    _ticksContainer.innerHTML = ''
    const total_cm = props.page_format_mm[0] / 10
    const cm_px = 10 / px_in_mm * props.zoom

    for (let cm = 0; cm <= total_cm; cm++) {
      const x = cm * cm_px
      if (x > trackWidth + 1) break

      const tick = document.createElement('div')
      tick.className = 'vde-tick vde-tick-cm'
      tick.style.left = x + 'px'
      _ticksContainer.appendChild(tick)

      if (cm > 0) {
        const label = document.createElement('div')
        label.className = 'vde-tick-label'
        label.textContent = cm
        label.style.left = x + 'px'
        _ticksContainer.appendChild(label)
      }

      if (cm < total_cm) {
        const hx = x + cm_px / 2
        if (hx <= trackWidth + 1) {
          const htick = document.createElement('div')
          htick.className = 'vde-tick vde-tick-half'
          htick.style.left = hx + 'px'
          _ticksContainer.appendChild(htick)
        }
      }
    }
  }

  // ── Accumulated offset from parent elements (e.g. <ol> padding) ──
  function _parent_offsets(block) {
    let left = 0, right = 0
    let el = block.parentElement
    while (el && !(el.dataset && el.dataset.isVDEPage !== undefined)) {
      const cs = window.getComputedStyle(el)
      left += (parseFloat(cs.marginLeft) || 0) + (parseFloat(cs.paddingLeft) || 0)
      right += (parseFloat(cs.marginRight) || 0) + (parseFloat(cs.paddingRight) || 0)
      el = el.parentElement
    }
    return { left, right }
  }

  // ── Sync markers with current paragraph ────────────────────────
  ctx.sync_ruler_markers = function() {
    if (!_track || _dragging) {
      console.log('[RULER] sync_ruler_markers: skip (track=%s, dragging=%s)', !!_track, _dragging)
      return
    }

    // Only sync when selection is inside our editor
    if (!_selection_in_editor()) {
      _current_block = null
      _set_markers_visible(false)
      return
    }

    const sel = window.getSelection()
    _current_block = _find_block(sel.focusNode)
    if (!_current_block) {
      console.log('[RULER] sync_ruler_markers: no block found for focusNode', sel.focusNode)
      _set_markers_visible(false)
      return
    }

    _set_markers_visible(true)
    const margins = _margins_px()
    const zoom = props.zoom
    const lm = margins.left * zoom
    const rm = margins.right * zoom
    const tw = parseFloat(_track.style.width) || 0

    const po = _parent_offsets(_current_block)
    const pol = po.left * zoom
    const por = po.right * zoom
    const ml = css_length_to_px(_current_block.style.marginLeft) * zoom
    const ti = css_length_to_px(_current_block.style.textIndent) * zoom
    const mr = css_length_to_px(_current_block.style.marginRight) * zoom

    _firstLineMarker.style.left = (lm + pol + ml + ti) + 'px'
    _leftIndentMarker.style.left = (lm + pol + ml) + 'px'
    _leftRectMarker.style.left = (lm + pol + ml) + 'px'
    _rightIndentMarker.style.left = (tw - rm - por - mr) + 'px'
  }

  function _set_markers_visible(visible) {
    const d = visible ? '' : 'none'
    if (_firstLineMarker) _firstLineMarker.style.display = d
    if (_leftIndentMarker) _leftIndentMarker.style.display = d
    if (_leftRectMarker) _leftRectMarker.style.display = d
    if (_rightIndentMarker) _rightIndentMarker.style.display = d
  }

  // ── Drag indent markers ────────────────────────────────────────
  ctx._ruler_start_drag = function(type, e) {
    e.preventDefault()
    e.stopPropagation()
    if (!_current_block) return

    const startX = e.clientX
    const zoom = props.zoom
    const margins = _margins_px()
    const tw = parseFloat(_track.style.width) || 0
    const lm = margins.left * zoom
    const rm = margins.right * zoom
    const po = _parent_offsets(_current_block)
    const pol = po.left * zoom
    const por = po.right * zoom
    const startML = css_length_to_px(_current_block.style.marginLeft)
    const startTI = css_length_to_px(_current_block.style.textIndent)
    const startMR = css_length_to_px(_current_block.style.marginRight)

    _dragging = true
    const guide = document.createElement('div')
    guide.className = 'vde-ruler-guide'
    guide.style.left = e.clientX + 'px'
    document.body.appendChild(guide)

    function onMove(ev) {
      const dx = ev.clientX - startX
      const dxPage = dx / zoom
      guide.style.left = ev.clientX + 'px'

      if (type === 'first-line') {
        const newTI = startTI + dxPage
        _firstLineMarker.style.left = (lm + pol + startML * zoom + newTI * zoom) + 'px'
      } else if (type === 'left-indent') {
        const newML = Math.max(0, startML + dxPage)
        _leftIndentMarker.style.left = (lm + pol + newML * zoom) + 'px'
        _leftRectMarker.style.left = (lm + pol + newML * zoom) + 'px'
        _firstLineMarker.style.left = (lm + pol + newML * zoom + startTI * zoom) + 'px'
      } else if (type === 'left-rect') {
        const newML = Math.max(0, startML + dxPage)
        _leftIndentMarker.style.left = (lm + pol + newML * zoom) + 'px'
        _leftRectMarker.style.left = (lm + pol + newML * zoom) + 'px'
        _firstLineMarker.style.left = (lm + pol + newML * zoom + startTI * zoom) + 'px'
      } else if (type === 'right-indent') {
        const newMR = Math.max(0, startMR - dxPage)
        _rightIndentMarker.style.left = (tw - rm - por - newMR * zoom) + 'px'
      }
    }

    function onUp(ev) {
      _dragging = false
      guide.remove()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)

      const dx = ev.clientX - startX
      const dxPage = dx / zoom

      if (type === 'first-line') {
        const v = Math.round(startTI + dxPage)
        _current_block.style.textIndent = v ? v + 'px' : ''
      } else if (type === 'left-indent' || type === 'left-rect') {
        const v = Math.max(0, Math.round(startML + dxPage))
        _current_block.style.marginLeft = v ? v + 'px' : ''
      } else if (type === 'right-indent') {
        const v = Math.max(0, Math.round(startMR - dxPage))
        _current_block.style.marginRight = v ? v + 'px' : ''
      }

      _current_block.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'formatIndent' }))
      ctx.sync_ruler_markers()
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ── Drag margin zones ──────────────────────────────────────────
  ctx._ruler_start_margin_drag = function(side, e) {
    e.preventDefault()
    e.stopPropagation()

    const startX = e.clientX
    const zoom = props.zoom
    const margins = _margins_px()
    const startPx = side === 'left' ? margins.left : margins.right
    const el = side === 'left' ? _marginLeftEl : _marginRightEl

    _dragging = true
    const guide = document.createElement('div')
    guide.className = 'vde-ruler-guide vde-ruler-guide-margin'
    guide.style.left = e.clientX + 'px'
    document.body.appendChild(guide)

    function onMove(ev) {
      const dx = ev.clientX - startX
      const dxPage = dx / zoom
      guide.style.left = ev.clientX + 'px'

      const newPx = side === 'left'
        ? Math.max(0, startPx + dxPage)
        : Math.max(0, startPx - dxPage)
      el.style.width = (newPx * zoom) + 'px'
    }

    function onUp(ev) {
      _dragging = false
      guide.remove()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)

      const dx = ev.clientX - startX
      const dxPage = dx / zoom
      let newMm = side === 'left'
        ? (startPx + dxPage) * px_in_mm
        : (startPx - dxPage) * px_in_mm
      newMm = Math.max(5, Math.round(newMm * 10) / 10)

      const m = ctx.parsed_margins.value
      const top = parseFloat(m.top) || 10
      const right = side === 'right' ? newMm : (parseFloat(m.right) || 15)
      const bottom = parseFloat(m.bottom) || 10
      const left = side === 'left' ? newMm : (parseFloat(m.left) || 15)

      ctx.emit('update:page_margins', `${top}mm ${right}mm ${bottom}mm ${left}mm`)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }
}
