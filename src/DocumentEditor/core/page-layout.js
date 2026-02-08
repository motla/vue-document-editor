// Page positioning, sizing, and DOM management
import { css_to_string } from './utils.js'

export function setupPageLayout(ctx) {
  const { state, props, refs } = ctx

  ctx.page_style = function(page_idx, allow_overflow) {
    const px_in_mm = 0.2645833333333
    const page_width = props.page_format_mm[0] / px_in_mm
    const page_spacing_mm = 10
    const page_with_plus_spacing = (page_spacing_mm + props.page_format_mm[0]) * props.zoom / px_in_mm
    const view_padding = 20
    const inner_width = state.editor_width - 2 * view_padding
    let nb_pages_x = 1, page_column, x_pos, x_ofx, left_px, top_mm, bkg_width_mm, bkg_height_mm
    if(props.display == "horizontal") {
      if(inner_width > (state.pages.length * page_with_plus_spacing)){
        nb_pages_x = Math.floor(inner_width / page_with_plus_spacing)
        left_px = inner_width / (nb_pages_x * 2) * (1 + page_idx * 2) - page_width / 2
      } else {
        nb_pages_x = state.pages.length
        left_px = page_with_plus_spacing * page_idx + page_width / 2 * (props.zoom - 1)
      }
      top_mm = 0
      bkg_width_mm = props.zoom * (props.page_format_mm[0] * nb_pages_x + (nb_pages_x - 1) * page_spacing_mm)
      bkg_height_mm = props.page_format_mm[1] * props.zoom
    } else {
      nb_pages_x = Math.floor(inner_width / page_with_plus_spacing)
      if(nb_pages_x < 1 || props.display == "vertical") nb_pages_x = 1
      page_column = (page_idx % nb_pages_x)
      x_pos = inner_width / (nb_pages_x * 2) * (1 + page_column * 2) - page_width / 2
      x_ofx = Math.max(0, (page_width * props.zoom - inner_width) / 2)
      left_px = x_pos + x_ofx
      top_mm = ((props.page_format_mm[1] + page_spacing_mm) * props.zoom) * Math.floor(page_idx / nb_pages_x)
      const nb_pages_y = Math.ceil(state.pages.length / nb_pages_x)
      bkg_width_mm = props.zoom * (props.page_format_mm[0] * nb_pages_x + (nb_pages_x - 1) * page_spacing_mm)
      bkg_height_mm = props.zoom * (props.page_format_mm[1] * nb_pages_y + (nb_pages_y - 1) * page_spacing_mm)
    }
    if(page_idx >= 0) {
      const epm = ctx.effective_page_margins.value
      const style = {
        position: "absolute",
        left: "calc("+ left_px +"px + "+ view_padding +"px)",
        top: "calc("+ top_mm +"mm + "+ view_padding +"px)",
        width: props.page_format_mm[0]+"mm",
        padding: (typeof epm == "function") ? epm(page_idx + 1, state.pages.length) : epm,
        transform: "scale("+ props.zoom +")"
      }
      style[allow_overflow ? "minHeight" : "height"] = props.page_format_mm[1]+"mm"
      return style
    } else {
      return { width: "calc("+ bkg_width_mm +"mm + "+ (2*view_padding) +"px)", height: "calc("+ bkg_height_mm +"mm + "+ (2*view_padding) +"px)" }
    }
  }

  ctx.update_pages_elts = function() {
    const deleted_pages = [...refs.content.value.children].filter((page_elt) => !state.pages.find(page => (page.elt == page_elt)))
    for(const page_elt of deleted_pages) { page_elt.remove() }
    for(const [page_idx, page] of state.pages.entries()) {
      if(!page.elt) {
        page.elt = document.createElement("div")
        page.elt.className = "page"
        page.elt.dataset.isVDEPage = ""
        const next_page = state.pages[page_idx + 1]
        refs.content.value.insertBefore(page.elt, next_page ? next_page.elt : null)
      }
      page.elt.dataset.contentIdx = page.content_idx
      if(!state.printing_mode) page.elt.style = css_to_string(ctx.page_style(page_idx, page.template ? false : true))
      page.elt.contentEditable = (props.editable && !page.template) ? true : false
    }
  }

  ctx.update_editor_width = function() {
    refs.editor.value.classList.add("hide_children")
    state.editor_width = refs.editor.value.clientWidth
    ctx.update_pages_elts()
    refs.editor.value.classList.remove("hide_children")
  }

  ctx.update_css_media_style = function() {
    ctx.css_media_style.value.innerHTML = "@media print { @page { size: "+props.page_format_mm[0]+"mm "+props.page_format_mm[1]+"mm; margin: 0 !important; } .hidden-print { display: none !important; } }"
  }
}
