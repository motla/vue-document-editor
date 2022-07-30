<template>
  <div class="editor" ref="editor">

    <!-- Page overlays (headers, footers, page numbers, ...) -->
    <div v-if="overlay" class="overlays">
      <div v-for="(page, page_idx) in pages" class="overlay" :key="page.uuid+'-overlay'" :ref="(elt) => (pages_overlay_refs[page.uuid] = elt)"
        v-html="overlay(page_idx+1, pages.length)" :style="page_style(page_idx, false)">
      </div>
    </div>

    <!-- Document editor -->
    <div class="content" ref="content" :contenteditable="editable" :style="page_style(-1)" @input="input" @keyup="process_current_text_style" @keydown="keydown">
      <!-- Contains every page of the document (can be modified by the DOM afterwards) -->
      <div v-for="(page, page_idx) in pages" class="page"
        :key="page.uuid" :ref="(elt) => (pages_refs[page.uuid] = elt)" :data-content-idx="page.content_idx" :data-page-idx="page_idx"
        :style="page_style(page_idx, page.template ? false : true)" :contenteditable="(editable && !page.template) ? true : false" >
        <component v-if="page.template" :is="page.template" v-model="page.props" />
      </div>
    </div>

    <!-- maybe new items (widgets, ...) will be inserted here in the future -->

  </div>
</template>

<script>
import { move_children_forward_recursively, move_children_backwards_with_merging } from './imports/page-transition-mgmt.js';

export default {

  props: {
    // This contains the initial content of the document that can be synced
    // It must be an Array: each array item is a new set of pages containing the
    // item (string or component). You can see that as predefined page breaks.
    // See the Demo.vue file for a good usage example.
    content: {
      type: Array,
      required: true
    },

    // Display mode of the pages
    display: {
      type: String,
      default: "grid" // ["grid", "horizontal", "vertical"]
    },

    // Sets whether document text can be modified
    editable: {
      type: Boolean,
      default: true
    },

    // Overlay function returning page headers and footers in HTML
    overlay: Function,

    // Pages format in mm (should be an array containing [width, height])
    page_format_mm: {
      type: Array,
      default: () => [210, 297]
    },

    // Page margins in CSS
    page_margins: {
      type: String,
      default: "10mm 15mm"
    },

    // Display zoom. Only acts on the screen display
    zoom: {
      type: Number,
      default: 1.0
    }
  },

  data () {
    return {
      pages: [], // contains {uuid, content_idx, prev_html, template, props} for each pages of the document
      pages_refs: {}, // contains page ref elements indexed by uuid
      pages_overlay_refs: {}, // contains page overlay ref elements indexed by uuid
      pages_height: 0, // real measured page height in px (corresponding to page_format_mm[1])
      editor_width: 0, // real measured with of an empty editor <div> in px
      prevent_next_content_update_from_parent: false, // workaround to avoid infinite update loop
      current_text_style: false, // contains the style at caret position
    }
  },

  mounted () {
    this.update_editor_width();
    this.update_css_media_style();
    this.reset_content();
    window.addEventListener("resize", this.update_editor_width);
    window.addEventListener("click", this.process_current_text_style);
    window.addEventListener("beforeprint", this.before_print);
    window.addEventListener("afterprint", this.after_print);
  },

  beforeUpdate () {
    this.pages_refs = [];
    this.pages_overlay_refs = [];
  },

  beforeUnmount () {
    window.removeEventListener("resize", this.update_editor_width);
    window.removeEventListener("click", this.process_current_text_style);
    window.removeEventListener("beforeprint", this.before_print);
    window.removeEventListener("afterprint", this.after_print);
  },

  computed: {
    css_media_style () { // creates a CSS <style> and returns it
      const style = document.createElement("style");
      document.head.appendChild(style);
      return style;
    }
  },


  methods: {
    // Computes a random 5-char UUID
    new_uuid: () => Math.random().toString(36).slice(-5),

    // Resets all content from the content property
    async reset_content () {
      // If provided content is empty, initialize it first and exit
      if(!this.content.length) { this.$emit("update:content", [""]); return; }

      // Delete all pages and set one new page per content item
      this.pages = this.content.length ? this.content.map((content, content_idx) => ({
        uuid: this.new_uuid(),
        content_idx,
        template: content.template,
        props: content.props
      })) : [{ uuid: this.new_uuid(), content_idx: 0 }]; // if content is empty

      // Get page height from first empty page
      await this.$nextTick(); // wait for DOM update
      const first_page_elt = this.pages_refs[this.pages[0].uuid];
      if(!this.$refs.content.contains(first_page_elt)) this.$refs.content.appendChild(first_page_elt); // restore page in DOM in case it was removed
      this.pages_height = first_page_elt.clientHeight + 1; // allow one pixel precision

      // Initialize text pages
      for(const page of this.pages) {
        const page_elt = this.pages_refs[page.uuid];

        // set raw HTML content
        if(!this.content[page.content_idx]) page_elt.innerHTML = "<div><br></div>";
        else if(typeof this.content[page.content_idx] == "string") page_elt.innerHTML = "<div>"+this.content[page.content_idx]+"</div>";
        // (else content is a component that is set in Vue.js <template>)

        // restore page in DOM in case it was removed
        if(!this.$refs.content.contains(page_elt)) this.$refs.content.appendChild(page_elt);
      }

      // Spread content over several pages if it overflows
      await this.fit_content_over_pages();

      // Remove the text cursor from the content, if any (its position is lost anyway)
      this.$refs.content.blur();
    },

    // Spreads the HTML content over several pages until it fits
    async fit_content_over_pages () {
      // Data variable this.pages_height must have been set before calling this function
      if(!this.pages_height) return;

      // Check that pages were not deleted from the DOM (start from the end)
      for(let page_idx = this.pages.length - 1; page_idx >= 0; page_idx--) {
        const page = this.pages[page_idx];
        const page_elt = this.pages_refs[page.uuid];

        // if user deleted the page from the DOM, then remove it from this.pages array
        if(!page_elt || !document.body.contains(page_elt)) this.pages.splice(page_idx, 1);
      }

      // If all the document was wiped out, start a new empty document
      if(!this.pages.length){
        this.reset_content();
        return;
      }

      // Save current selection by inserting empty HTML elements at the start and the end of it
      const selection = window.getSelection();
      const start_marker = document.createElement("null");
      const end_marker = document.createElement("null");
      if(selection.rangeCount) {
        const range = selection.getRangeAt(0);
        range.insertNode(start_marker);
        range.collapse(false);
        range.insertNode(end_marker);
      }

      // Browse every remaining page
      let prev_page_modified_flag = false;
      for(let page_idx = 0; page_idx < this.pages.length; page_idx++) { // page length can grow inside this loop
        const page = this.pages[page_idx];
        const page_elt = this.pages_refs[page.uuid];
        let next_page = this.pages[page_idx + 1];
        let next_page_elt = next_page ? this.pages_refs[next_page.uuid] : null;

        // check if this page, the next page, or any previous page content has been modified by the user (don't apply to template pages)
        if(!page.template && (prev_page_modified_flag || page_elt.innerHTML != page.prev_innerHTML
          || (next_page_elt && !next_page.template && next_page_elt.innerHTML != next_page.prev_innerHTML))){
          prev_page_modified_flag = true;

          // BACKWARD-PROPAGATION
          // check if content doesn't overflow, and that next page exists and has the same content_idx
          if(page_elt.clientHeight <= this.pages_height && next_page && next_page.content_idx == page.content_idx) {

            // try to append every node from the next page until it doesn't fit
            move_children_backwards_with_merging(page_elt, next_page_elt, () => !next_page_elt.childNodes.length || (page_elt.clientHeight > this.pages_height));

            // remove next page if it is empty
            if(!next_page_elt.childNodes.length) this.pages.splice(page_idx + 1, 1);
          }

          // FORWARD-PROPAGATION
          // check if content overflows
          if(page_elt.clientHeight > this.pages_height) {

            // if there is no next page for the same content, create it
            if(!next_page || next_page.content_idx != page.content_idx) {
              next_page = { uuid: this.new_uuid(), content_idx: page.content_idx };
              this.pages.splice(page_idx + 1, 0, next_page);
              await this.$nextTick(); // wait for DOM update
              next_page_elt = this.pages_refs[next_page.uuid];
            }

            // move the content step by step to the next page, until it fits
            move_children_forward_recursively(page_elt, next_page_elt, () => (page_elt.clientHeight <= this.pages_height));
          }
        }
      }
      

      // Restore selection and remove empty elements
      if(document.body.contains(start_marker)){
        const range = document.createRange();
        range.setStart(start_marker, 0);
        if(document.body.contains(end_marker)) range.setEnd(end_marker, 0);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      if(start_marker.parentElement) start_marker.parentElement.removeChild(start_marker);
      if(end_marker.parentElement) end_marker.parentElement.removeChild(end_marker);

      // Normalize and store current page HTML content
      for(const page of this.pages) {
        const page_elt = this.pages_refs[page.uuid];
        if(!page.template) page_elt.normalize(); // normalize HTML (merge text nodes) - don't touch template pages or it can break Vue
        page.prev_innerHTML = page_elt.innerHTML; // store current pages innerHTML for next call
      }
    },

    // Input event
    async input (e) {
      if(!e) return; // check that event is set
      await this.fit_content_over_pages(); // fit content according to modifications
      this.emit_new_content(); // emit content modification
      if(e.inputType != "insertText") this.process_current_text_style(); // update current style if it has changed
    },

    // Keydown event
    keydown (e) {
      // if the document is empty, prevent removing the first page container with a backspace input (keycode 8)
      // which is now the default behavior for web browsers
      if(e.keyCode == 8 && this.content.length <= 1) {
        const is_text = (this.content[0] && typeof(this.content[0]) == "string") ? this.content[0].replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '') : false;
        if(!is_text) e.preventDefault();
      }
    },

    // Emit content change to parent
    emit_new_content () {
      let removed_pages_flag = false; // flag to call reset_content if some pages were removed by the user

      // process the new content
      const new_content = this.content.map((item, content_idx) => {
        // select pages that correspond to this content item (represented by its index in the array)
        const pages = this.pages.filter(page => (page.content_idx == content_idx));

        // if there are no pages representing this content (because deleted by the user), mark item as false to remove it
        if(!pages.length) {
          removed_pages_flag = true;
          return false;
        }

        // if item is a string, concatenate each page content and set that
        else if(typeof item == "string") {
          return pages.map(page => {
            // remove any useless <div> surrounding the content
            let elt = this.pages_refs[page.uuid];
            while(elt.children.length == 1 && elt.firstChild.tagName && elt.firstChild.tagName.toLowerCase() == "div" && !elt.firstChild.getAttribute("style")) {
              elt = elt.firstChild;
            }
            return elt.innerHTML;
          }).join('') || false;
        }

        // if item is a component, just clone the item
        else return { template: item.template, props: { ...item.props }};
      }).filter(item => (item != false)); // remove empty items

      // avoid calling reset_content after the parent content is updated (infinite loop)
      if(!removed_pages_flag) this.prevent_next_content_update_from_parent = true;

      // send event to parent to update the synced content
      this.$emit("update:content", new_content);
    },

    // Sets current_text_style with CSS style at caret position
    process_current_text_style () {
      let style = false;
      const sel = window.getSelection();
      if(sel.focusNode) {
        const element = sel.focusNode.tagName ? sel.focusNode : sel.focusNode.parentElement;
        if(element && element.isContentEditable) {
          style = window.getComputedStyle(element);

          // compute additional properties
          style.textDecorationStack = []; // array of text-decoration strings from parent elements
          style.headerLevel = 0;
          style.isList = false;
          let parent = element;
          while(parent){
            const parent_style = window.getComputedStyle(parent);
            // stack CSS text-decoration as it is not overridden by children
            style.textDecorationStack.push(parent_style.textDecoration);
            // check if one parent is a list-item
            if(parent_style.display == "list-item") style.isList = true;
            // get first header level, if any
            if(!style.headerLevel){
              for(let i = 1; i <= 6; i++){
                if(parent.tagName.toUpperCase() == "H"+i) {
                  style.headerLevel = i;
                  break;
                }
              }
            }
            parent = parent.parentElement;
          }
        }
      }
      this.current_text_style = style;
    },

    // Process the specific style (position and size) of each page <div> and content <div>
    page_style (page_idx, allow_overflow) {
      const px_in_mm = 0.2645833333333;
      const page_width = this.page_format_mm[0] / px_in_mm;
      const page_spacing_mm = 10;
      const page_with_plus_spacing = (page_spacing_mm + this.page_format_mm[0]) * this.zoom / px_in_mm;
      const view_padding = 20;
      const inner_width = this.editor_width - 2 * view_padding;
      let nb_pages_x = 1, page_column, x_pos, x_ofx, left_px, top_mm, bkg_width_mm, bkg_height_mm;
      if(this.display == "horizontal") {
        if(inner_width > (this.pages.length * page_with_plus_spacing)){
          nb_pages_x = Math.floor(inner_width / page_with_plus_spacing);
          left_px = inner_width / (nb_pages_x * 2) * (1 + page_idx * 2) - page_width / 2;
        } else {
          nb_pages_x = this.pages.length;
          left_px = page_with_plus_spacing * page_idx + page_width / 2 * (this.zoom - 1);
        }
        top_mm = 0;
        bkg_width_mm = this.zoom * (this.page_format_mm[0] * nb_pages_x + (nb_pages_x - 1) * page_spacing_mm);
        bkg_height_mm = this.page_format_mm[1] * this.zoom;
      } else { // "grid", vertical
        nb_pages_x = Math.floor(inner_width / page_with_plus_spacing);
        if(nb_pages_x < 1 || this.display == "vertical") nb_pages_x = 1;
        page_column = (page_idx % nb_pages_x);
        x_pos = inner_width / (nb_pages_x * 2) * (1 + page_column * 2) - page_width / 2;
        x_ofx = Math.max(0, (page_width * this.zoom - inner_width) / 2);
        left_px = x_pos + x_ofx;
        top_mm = ((this.page_format_mm[1] + page_spacing_mm) * this.zoom) * Math.floor(page_idx / nb_pages_x);
        const nb_pages_y = Math.ceil(this.pages.length / nb_pages_x);
        bkg_width_mm = this.zoom * (this.page_format_mm[0] * nb_pages_x + (nb_pages_x - 1) * page_spacing_mm);
        bkg_height_mm = this.zoom * (this.page_format_mm[1] * nb_pages_y + (nb_pages_y - 1) * page_spacing_mm);
      }
      if(page_idx >= 0) {
        const style = {
          position: "absolute",
          left: "calc("+ left_px +"px + "+ view_padding +"px)",
          top: "calc("+ top_mm +"mm + "+ view_padding +"px)",
          width: this.page_format_mm[0]+"mm",
          // "height" is set below
          padding: this.page_margins,
          transform: "scale("+ this.zoom +")"
        }
        style[allow_overflow ? "minHeight" : "height"] = this.page_format_mm[1]+"mm";
        return style;
      } else {
        // Content/background <div> is sized so it lets a margin around pages when scrolling at the end
        return { width: "calc("+ bkg_width_mm +"mm + "+ (2*view_padding) +"px)", height: "calc("+ bkg_height_mm +"mm + "+ (2*view_padding) +"px)" };
      }
    },

    // Get and store empty editor <div> width
    update_editor_width () {
      this.$refs.editor.classList.add("hide_children");
      this.editor_width = this.$refs.editor.clientWidth;
      this.$refs.editor.classList.remove("hide_children");
    },
    update_css_media_style () {
      this.css_media_style.innerHTML = "@media print { @page { size: "+this.page_format_mm[0]+"mm "+this.page_format_mm[1]+"mm; margin: 0 !important; } .hidden-print { display: none !important; } }";
    },

    // Prepare content before opening the native print box
    before_print () {
      // store the current body aside
      this._page_body = document.body;

      // create a new body for the print and overwrite CSS
      const print_body = document.createElement("body");
      print_body.style.margin = "0";
      print_body.style.padding = "0";
      print_body.style.background = "white";

      // clone each page to the print body
      for(const [page_idx, page] of this.pages.entries()){
        const page_elt = this.pages_refs[page.uuid];
        const page_clone = page_elt.cloneNode(true);
        page_clone.style = ""; // reset page style for the clone
        page_clone.style.position = "relative";
        page_clone.style.padding = this.page_margins;
        page_clone.style.breakBefore = page_idx ? "page" : "auto";

        // add overlays if any
        const overlay_elts = this.pages_overlay_refs[page.uuid];
        if(overlay_elts){
          const overlay_clone = overlay_elts.cloneNode(true);
          overlay_clone.style.position = "absolute";
          overlay_clone.style.left = "0";
          overlay_clone.style.top = "0";
          overlay_clone.style.transform = "none";
          overlay_clone.style.padding = "0";
          overlay_clone.style.overflow = "hidden";
          page_clone.prepend(overlay_clone);
        }
        
        print_body.append(page_clone);
      }

      // display a return arrow to let the user restore the original body in case the navigator doesn't call after_print() (it happens sometimes in Chrome)
      const return_overlay = document.createElement("div");
      return_overlay.className = "hidden-print"; // css managed in update_css_media_style method
      return_overlay.style.position = "fixed";
      return_overlay.style.left = "0";
      return_overlay.style.top = "0";
      return_overlay.style.right = "0";
      return_overlay.style.bottom = "0";
      return_overlay.style.display = "flex";
      return_overlay.style.alignItems = "center";
      return_overlay.style.justifyContent = "center";
      return_overlay.style.background = "rgba(255, 255, 255, 0.95)";
      return_overlay.style.cursor = "pointer";
      return_overlay.innerHTML = '<svg width="220" height="220"><path fill="rgba(0, 0, 0, 0.7)" d="M120.774,179.271v40c47.303,0,85.784-38.482,85.784-85.785c0-47.3-38.481-85.782-85.784-85.782H89.282L108.7,28.286L80.417,0L12.713,67.703l67.703,67.701l28.283-28.284L89.282,87.703h31.492c25.246,0,45.784,20.538,45.784,45.783C166.558,158.73,146.02,179.271,120.774,179.271z"/></svg>'
      return_overlay.addEventListener("click", this.after_print);
      print_body.append(return_overlay);

      // replace current body by the print body
      document.body = print_body;
    },

    // Restore content after closing the native print box
    after_print () {
      document.body = this._page_body;
      this.update_editor_width();
    }
  },

  // Watch for changes and adapt content accordingly
  watch: {
    page_format_mm: {
      async handler () {
        this.update_css_media_style();
        await this.reset_content();
      }
    },
    page_margins: {
      async handler () {
        await this.reset_content();
      }
    },
    content: {
      async handler () {
        // prevent infinite loop as reset_content triggers a content update and it's async
        if(this.prevent_next_content_update_from_parent) {
          this.prevent_next_content_update_from_parent = false;
        } else await this.reset_content();
      },
      deep: true
    }
  }

}
</script>

<style>
body {
  /* Enable printing of background colors */
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
</style>
<style lang="scss" scoped>
  @import "./imports/doc-editor-default-styles.scss";
</style>