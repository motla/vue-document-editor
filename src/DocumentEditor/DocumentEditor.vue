<template>
  <div class="editor" ref="editor">

    <!-- Page overlays (headers, footers, page numbers, ...) -->
    <div v-if="overlay || header != null || footer != null" class="overlays" ref="overlays">
      <div v-for="(page, page_idx) in pages" class="overlay" :key="page.uuid+'-overlay'" :ref="(elt) => (pages_overlay_refs[page.uuid] = elt)"
        :style="page_style(page_idx, false)">
        <!-- Editable header zone -->
        <template v-if="header != null">
          <div v-if="editing_hf === 'header' && editing_hf_page === page_idx"
            class="hf-zone hf-header hf-active"
            :style="hf_header_style"
            contenteditable="true"
            @input="on_hf_input('header')"
            @keyup="process_current_text_style"
            @keydown.esc.prevent="stop_editing_hf"
            data-hf-label="Cabeçalho">
          </div>
          <div v-else class="hf-zone hf-header"
            :class="{ 'hf-dim': editing_hf === 'footer' }"
            :style="hf_header_style"
            v-html="header"
            @dblclick.stop="start_editing_hf('header', page_idx)">
          </div>
        </template>
        <!-- Editable footer zone -->
        <template v-if="footer != null">
          <div v-if="editing_hf === 'footer' && editing_hf_page === page_idx"
            class="hf-zone hf-footer hf-active"
            :style="hf_footer_style"
            contenteditable="true"
            @input="on_hf_input('footer')"
            @keyup="process_current_text_style"
            @keydown.esc.prevent="stop_editing_hf"
            data-hf-label="Rodapé">
          </div>
          <div v-else class="hf-zone hf-footer"
            :class="{ 'hf-dim': editing_hf === 'header' }"
            :style="hf_footer_style"
            v-html="footer"
            @dblclick.stop="start_editing_hf('footer', page_idx)">
          </div>
        </template>
        <!-- Legacy overlay content (page numbers, etc.) -->
        <div v-if="overlay" v-html="overlay(page_idx+1, pages.length)" style="pointer-events: none;"></div>
      </div>
    </div>

    <!-- Document editor -->
    <div class="content" ref="content" :contenteditable="editable && !editing_hf" :class="{ 'hf-body-dim': !!editing_hf }" :style="page_style(-1)" @input="input" @keyup="process_current_text_style" @click="on_content_click">
      <!-- This is a Vue "hoisted" static <div> which contains every page of the document and can be modified by the DOM -->
    </div>

    <!-- Items related to the document editor (widgets, ...) can be inserted here -->

    <!-- Deferred reflow progress indicator (bottom-left, non-blocking) -->
    <div class="vde-progress-indicator" ref="progress_indicator">
      <div class="vde-progress-spinner"></div>
      <span class="vde-progress-text" ref="progress_text"></span>
    </div>

    <!-- Full-screen blocking overlay for paste operations -->
    <div class="vde-paste-overlay" ref="paste_overlay">
      <div class="vde-paste-box">
        <div class="vde-paste-spinner"></div>
        <span class="vde-paste-text" ref="paste_text">Colando texto...</span>
      </div>
    </div>

  </div>
</template>

<script>
import { defineCustomElement } from 'vue';
import { move_children_forward_recursively, move_children_backwards_with_merging } from './imports/page-transition-mgmt.js';

// Simple debounce helper (no external dependency)
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  }
}

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

    // Editable header HTML content (shared across all pages)
    header: {
      type: String,
      default: undefined
    },

    // Editable footer HTML content (shared across all pages)
    footer: {
      type: String,
      default: undefined
    },

    // Pages format in mm (should be an array containing [width, height])
    page_format_mm: {
      type: Array,
      default: () => [210, 297]
    },

    // Page margins in CSS
    page_margins: {
      type: [String, Function],
      default: "10mm 15mm"
    },

    // Display zoom. Only acts on the screen display
    zoom: {
      type: Number,
      default: 1
    },

    // "Do not break" test function: should return true on elements you don't want to be split over multiple pages but rather be moved to the next page
    do_not_break: Function
  },

  data () {
    return {
      pages: [], // contains {uuid, content_idx, prev_html, template, props, elt, cached_html, nao_renderizada} for each pages of the document
      pages_overlay_refs: {}, // contains page overlay ref elements indexed by uuid
      pages_height: 0, // real measured page height in px (corresponding to page_format_mm[1])
      editor_width: 0, // real measured with of an empty editor <div> in px
      prevent_next_content_update_from_parent: false, // workaround to avoid infinite update loop
      current_text_style: false, // contains the style at caret position
      printing_mode: false, // flag set when page is rendering in printing mode
      visible_range: { start: 0, end: 5 }, // range of visible pages (viewport + buffer)
      virtualization_enabled: false, // enabled after first reset_content completes
      editing_hf: null, // null | 'header' | 'footer' - current header/footer editing mode
      editing_hf_page: null, // page index where header/footer is being edited
      hf_top_height_mm: 0, // measured header height in mm (0 = use default margin)
      hf_bottom_height_mm: 0, // measured footer height in mm (0 = use default margin)
    }
  },

  mounted () {
    // Initialize non-reactive internal properties
    this._dirty_from_page = null;
    this._deferred_raf_id = null;
    this._status_overlay_container = null;
    this._paste_in_progress = false;
    this._hf_editor_el = null; // ref to contenteditable header/footer editor element
    this._hf_measure_timer = null; // debounce timer for h/f height measurement

    this.update_editor_width();
    this.update_css_media_style();
    this.reset_content();
    // Measure header/footer heights after initial render (watchers don't fire on initial value)
    this.$nextTick(() => { this._measure_hf_heights(); });
    window.addEventListener("resize", this.update_editor_width);
    window.addEventListener("click", this.process_current_text_style);
    window.addEventListener("beforeprint", this.before_print);
    window.addEventListener("afterprint", this.after_print);

    // Setup debounced scroll handler for virtual scrolling
    this._scroll_handler = debounce(() => this.on_scroll(), 100);
    this._scroll_container = this.get_scroll_container();
    if (this._scroll_container === window) {
      window.addEventListener("scroll", this._scroll_handler);
    } else {
      this._scroll_container.addEventListener("scroll", this._scroll_handler);
    }
  },

  beforeUpdate () {
    this.pages_overlay_refs = [];
  },

  beforeUnmount () {
    window.removeEventListener("resize", this.update_editor_width);
    window.removeEventListener("click", this.process_current_text_style);
    window.removeEventListener("beforeprint", this.before_print);
    window.removeEventListener("afterprint", this.after_print);

    // Remove scroll listener
    if (this._scroll_handler) {
      if (this._scroll_container === window) {
        window.removeEventListener("scroll", this._scroll_handler);
      } else if (this._scroll_container) {
        this._scroll_container.removeEventListener("scroll", this._scroll_handler);
      }
    }
    // Clear pending input timer and deferred reflow
    if (this._input_timer) clearTimeout(this._input_timer);
    this._cancel_deferred_reflow();
  },

  computed: {
    css_media_style () { // creates a CSS <style> and returns it
      const style = document.createElement("style");
      document.head.appendChild(style);
      return style;
    },
    // Parse page_margins string into top/right/bottom/left values
    parsed_margins () {
      const m = typeof this.page_margins === 'string' ? this.page_margins : '10mm 15mm';
      const parts = m.trim().split(/\s+/);
      if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
      if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
      if (parts.length === 3) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
      return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
    },
    // Style for header zone (positioned in top margin area, grows with content)
    hf_header_style () {
      const m = this.parsed_margins;
      return {
        position: 'absolute', top: '0', left: '0', right: '0',
        minHeight: m.top, padding: '2mm ' + m.right + ' 2mm ' + m.left,
        boxSizing: 'border-box'
      };
    },
    // Style for footer zone (positioned in bottom margin area, grows with content)
    hf_footer_style () {
      const m = this.parsed_margins;
      return {
        position: 'absolute', bottom: '0', left: '0', right: '0',
        minHeight: m.bottom, padding: '2mm ' + m.right + ' 2mm ' + m.left,
        boxSizing: 'border-box'
      };
    },
    // Effective page margins accounting for h/f content height
    effective_page_margins () {
      if (typeof this.page_margins === 'function') return this.page_margins;
      if (!this.hf_top_height_mm && !this.hf_bottom_height_mm) return this.page_margins;
      const m = this.parsed_margins;
      const origTop = parseFloat(m.top) || 10;
      const origBottom = parseFloat(m.bottom) || 10;
      const effTop = this.hf_top_height_mm ? Math.max(origTop, this.hf_top_height_mm) : origTop;
      const effBottom = this.hf_bottom_height_mm ? Math.max(origBottom, this.hf_bottom_height_mm) : origBottom;
      return effTop + 'mm ' + m.right + ' ' + effBottom + 'mm ' + m.left;
    }
  },


  methods: {
    // Computes a random 5-char UUID
    new_uuid: () => Math.random().toString(36).slice(-5),

    // Gets the scrollable parent element of the editor
    get_scroll_container () {
      let el = this.$refs.editor;
      while (el) {
        const style = window.getComputedStyle(el);
        if (style.overflow === 'auto' || style.overflow === 'scroll' ||
            style.overflowY === 'auto' || style.overflowY === 'scroll') {
          return el;
        }
        el = el.parentElement;
      }
      return window;
    },

    // Calculates which pages are visible in the viewport + buffer
    calculate_visible_range () {
      const px_in_mm = 0.2645833333333;
      const page_height_px = (this.page_format_mm[1] + 10) * this.zoom / px_in_mm; // page height + spacing in px
      const container = this.get_scroll_container();
      let scroll_top, viewport_height;

      if (container === window) {
        scroll_top = window.scrollY || document.documentElement.scrollTop;
        viewport_height = window.innerHeight;
      } else {
        scroll_top = container.scrollTop;
        viewport_height = container.clientHeight;
      }

      // Calculate pages per row (for grid mode)
      const view_padding = 20;
      const inner_width = this.editor_width - 2 * view_padding;
      const page_with_plus_spacing = (10 + this.page_format_mm[0]) * this.zoom / px_in_mm;
      let nb_pages_x = 1;
      if (this.display === "horizontal") {
        nb_pages_x = this.pages.length;
      } else {
        nb_pages_x = Math.floor(inner_width / page_with_plus_spacing);
        if (nb_pages_x < 1 || this.display === "vertical") nb_pages_x = 1;
      }

      // For horizontal mode, all pages are visible if in viewport horizontally
      if (this.display === "horizontal") {
        return { start: 0, end: this.pages.length - 1 };
      }

      // Calculate first and last visible row
      const first_visible_row = Math.max(0, Math.floor((scroll_top - view_padding) / page_height_px));
      const last_visible_row = Math.floor((scroll_top + viewport_height) / page_height_px);

      // Convert rows to page indices
      const buffer = 2; // buffer pages in rows
      const start = Math.max(0, (first_visible_row - buffer) * nb_pages_x);
      const end = Math.min(this.pages.length - 1, (last_visible_row + buffer + 1) * nb_pages_x - 1);

      return { start, end };
    },

    // Virtualizes pages outside the visible range and restores pages inside it
    virtualize_pages () {
      if (!this.virtualization_enabled || this.printing_mode) return;

      const range = this.calculate_visible_range();
      this.visible_range = range;

      for (let i = 0; i < this.pages.length; i++) {
        const page = this.pages[i];
        if (!page.elt) continue;

        const is_in_range = (i >= range.start && i <= range.end);

        if (!is_in_range && !page.nao_renderizada && !page.template) {
          // Virtualize: save content and empty DOM
          page.cached_html = page.elt.innerHTML;
          page.elt.innerHTML = '';
          page.nao_renderizada = true;
          page.elt.classList.add('nao-renderizada');
        } else if (is_in_range && page.nao_renderizada) {
          // Restore: put content back in DOM
          if (page.cached_html != null) {
            page.elt.innerHTML = page.cached_html;
            page.cached_html = null;
          }
          page.nao_renderizada = false;
          page.elt.classList.remove('nao-renderizada');
        }
      }
    },

    // Scroll event handler - recalculates visible range and virtualizes/restores pages
    on_scroll () {
      if (!this.virtualization_enabled || this.printing_mode) return;
      this.virtualize_pages();
      this._update_page_statuses();
    },

    // Resets all content from the content property
    reset_content () {
      // Prevent launching this function multiple times
      if(this.reset_in_progress) return;
      this.reset_in_progress = true;
      console.log(`%c[VDE] reset_content called, content.length=${this.content.length}, paste_in_progress=${this._paste_in_progress}`, 'color: cyan; font-weight: bold');

      // Cancel any pending deferred reflow
      this._cancel_deferred_reflow();

      // If provided content is empty, initialize it first and exit
      if(!this.content.length) {
        this.reset_in_progress = false;
        this.$emit("update:content", [""]);
        return;
      }

      // Delete all pages and set one new page per content item
      this.pages = this.content.map((content, content_idx) => ({
        uuid: this.new_uuid(),
        content_idx,
        template: content.template,
        props: content.props
      }));
      this.update_pages_elts();

      // Get page height from first empty page
      const first_page_elt = this.pages[0].elt;
      if(!this.$refs.content.contains(first_page_elt)) this.$refs.content.appendChild(first_page_elt); // restore page in DOM in case it was removed
      this.pages_height = first_page_elt.clientHeight + 1; // allow one pixel precision

      // Initialize text pages
      for(const page of this.pages) {

        // set raw HTML content
        if(!this.content[page.content_idx]) page.elt.innerHTML = "<div><br></div>"; // ensure empty pages are filled with at least <div><br></div>, otherwise editing fails on Chrome
        else if(typeof this.content[page.content_idx] == "string") page.elt.innerHTML = "<div>"+this.content[page.content_idx]+"</div>";
        else if(page.template) {
          const componentElement = defineCustomElement(page.template);
          customElements.define('component-'+page.uuid, componentElement);
          page.elt.appendChild(new componentElement({ modelValue: page.props }));
        }

        // restore page in DOM in case it was removed
        if(!this.$refs.content.contains(page.elt)) this.$refs.content.appendChild(page.elt);
      }

      // Pre-split pages with massive content into roughly page-sized chunks
      // (avoids 79+ second forward-propagation when entire document is in one page)
      this._pre_split_large_pages();

      // Mark all pages as dirty and defer processing to keep UI responsive
      this._paste_in_progress = true;
      this._show_paste_overlay('Processando documento...');
      this._dirty_from_page = 0;

      // Remove the text cursor from the content, if any (its position is lost anyway)
      this.$refs.content.blur();

      // Enable virtualization and virtualize non-visible pages
      this.virtualization_enabled = true;
      this.virtualize_pages();

      // Clear "reset in progress" flag
      this.reset_in_progress = false;

      // Update statuses and schedule deferred processing for remaining pages
      this._update_page_statuses();
      console.log(`%c[VDE] reset_content done: pages=${this.pages.length}, dirty_from=${this._dirty_from_page}, paste=${this._paste_in_progress}`, 'color: cyan');
      if (this._dirty_from_page !== null) {
        this._schedule_deferred_reflow();
      } else {
        // Small document, all done immediately
        console.log(`%c[VDE] reset_content: no dirty pages, hiding overlay`, 'color: cyan');
        this._paste_in_progress = false;
        this._hide_paste_overlay();
      }
    },

    // Spreads the HTML content over several pages until it fits
    // max_pages: max number of pages to cascade through (default Infinity = no limit)
    // start_from: page index to start the loop from (default 0), used for deferred reflow continuation
    fit_content_over_pages (max_pages, start_from) {
      if (max_pages === undefined) max_pages = Infinity;
      if (start_from === undefined) start_from = 0;

      // Data variable this.pages_height must have been set before calling this function
      if(!this.pages_height) return;

      // Prevent launching this function multiple times
      if(this.fit_in_progress) return;
      this.fit_in_progress = true;

      // Check pages that were deleted from the DOM (start from the end)
      for(let page_idx = this.pages.length - 1; page_idx >= 0; page_idx--) {
        const page = this.pages[page_idx];

        // if user deleted the page from the DOM, then remove it from this.pages array
        if(!page.elt || !document.body.contains(page.elt)) this.pages.splice(page_idx, 1);
      }

      // If all the document was wiped out, start a new empty document
      if(!this.pages.length){
        this.fit_in_progress = false; // clear "fit in progress" flag
        this.$emit("update:content", [""]);
        return;
      }

      // Save current selection (or cursor position) by inserting empty HTML elements at the start and the end of it
      const selection = window.getSelection();
      const start_marker = document.createElement("null");
      const end_marker = document.createElement("null");
      // don't insert markers in case selection fails (if we are editing in components in the shadow-root it selects the page <div> as anchorNode)
      if(selection && selection.rangeCount && selection.anchorNode && !(selection.anchorNode.dataset && selection.anchorNode.dataset.isVDEPage != null)) {
        const range = selection.getRangeAt(0);
        range.insertNode(start_marker);
        range.collapse(false);
        range.insertNode(end_marker);
      }

      // Track which pages were touched during reflow (for normalize + prev_innerHTML update)
      const touched_pages = new Set();
      let pages_added_or_removed = false;
      let cascade_truncated = false;

      const _perf = { t_start: performance.now(), pages_processed: 0, pages_restored: 0, pages_skipped: 0, backward: 0, forward: 0 };

      console.log(`%c[VDE fit] START: max_pages=${max_pages}, start_from=${start_from}, total_pages=${this.pages.length}`, 'color: purple; font-weight: bold');

      // Browse every remaining page (starting from start_from for deferred continuation)
      let prev_page_modified_flag = (start_from > 0); // force cascade when continuing from a previous stop
      let cascade_count = 0;
      for(let page_idx = start_from; page_idx < this.pages.length; page_idx++) { // page length can grow inside this loop
        const page = this.pages[page_idx];

        // Skip virtualized pages unless previous page pushed content forward
        if (page.nao_renderizada && !prev_page_modified_flag) { _perf.pages_skipped++; continue; }

        // Check cascade limit BEFORE processing this page
        if (max_pages !== Infinity && cascade_count >= max_pages && prev_page_modified_flag) {
          // We've hit the cascade limit and there's still more to cascade
          this._dirty_from_page = page_idx;
          cascade_truncated = true;
          console.log(`%c[VDE fit] TRUNCATED at page ${page_idx} (cascade_count=${cascade_count}, max_pages=${max_pages})`, 'color: red; font-weight: bold');
          break;
        }

        // Lazily restore this page if virtualized and cascade reached it
        if (page.nao_renderizada) {
          if (page.cached_html != null) {
            page.elt.innerHTML = page.cached_html;
            page.cached_html = null;
          }
          page.nao_renderizada = false;
          page.elt.classList.remove('nao-renderizada');
          _perf.pages_restored++;
        }

        _perf.pages_processed++;

        let next_page = this.pages[page_idx + 1];
        let next_page_elt = next_page ? next_page.elt : null;

        // Lazily restore next page if we might need it for backward/forward propagation
        if (next_page && next_page.nao_renderizada &&
            (prev_page_modified_flag || page.elt.innerHTML != page.prev_innerHTML)) {
          if (next_page.cached_html != null) {
            next_page.elt.innerHTML = next_page.cached_html;
            next_page.cached_html = null;
          }
          next_page.nao_renderizada = false;
          next_page.elt.classList.remove('nao-renderizada');
          next_page_elt = next_page.elt;
          _perf.pages_restored++;
        }

        // check if this page, the next page, or any previous page content has been modified by the user (don't apply to template pages)
        if(!page.template && (prev_page_modified_flag || page.elt.innerHTML != page.prev_innerHTML
          || (next_page_elt && !next_page.template && !next_page.nao_renderizada && next_page_elt.innerHTML != next_page.prev_innerHTML))){

          // Count this as a cascading page
          cascade_count++;
          console.log(`[VDE fit] processing page ${page_idx} (cascade #${cascade_count}/${max_pages}) prev_modified=${prev_page_modified_flag}`);

          // Snapshot next page content before reflow to detect if content actually shifted
          const next_page_html_before = (next_page_elt && !next_page.nao_renderizada) ? next_page_elt.innerHTML : null;

          touched_pages.add(page_idx);

          // BACKWARD-PROPAGATION
          // check if content doesn't overflow, and that next page exists and has the same content_idx
          if(page.elt.clientHeight <= this.pages_height && next_page && next_page.content_idx == page.content_idx) {
            const _tb = performance.now();
            // try to append every node from the next page until it doesn't fit
            move_children_backwards_with_merging(page.elt, next_page_elt, () => !next_page_elt.childNodes.length || (page.elt.clientHeight > this.pages_height));
            _perf.backward += performance.now() - _tb;
          }

          // FORWARD-PROPAGATION
          // check if content overflows
          if(page.elt.clientHeight > this.pages_height) {

            // if there is no next page for the same content, create it
            if(!next_page || next_page.content_idx != page.content_idx) {
              next_page = { uuid: this.new_uuid(), content_idx: page.content_idx };
              this.pages.splice(page_idx + 1, 0, next_page);
              this.update_pages_elts();
              next_page_elt = next_page.elt;
              pages_added_or_removed = true;
            }

            const _tf = performance.now();
            // move the content step by step to the next page, until it fits
            move_children_forward_recursively(page.elt, next_page_elt, () => (page.elt.clientHeight <= this.pages_height), this.do_not_break);
            _perf.forward += performance.now() - _tf;
          }

          // CLEANING
          // remove next page if it is empty
          if(next_page_elt && next_page.content_idx == page.content_idx && !next_page_elt.childNodes.length) {
            this.pages.splice(page_idx + 1, 1);
            pages_added_or_removed = true;
          }

          // Early termination: if next page content didn't change, stop cascading
          const current_next_page = this.pages[page_idx + 1];
          const current_next_elt = current_next_page ? current_next_page.elt : null;
          if (current_next_elt && next_page_html_before !== null &&
              !current_next_page.nao_renderizada &&
              current_next_elt.innerHTML === next_page_html_before) {
            // Content didn't shift to/from next page - no need to continue cascade
            prev_page_modified_flag = false;
          } else {
            prev_page_modified_flag = true;
            if (current_next_page) touched_pages.add(page_idx + 1);
          }
        } else {
          // Page not modified, track it if it was restored from cache
          touched_pages.add(page_idx);
        }
      }

      // If cascade ended naturally (not truncated), mark all pages as clean
      if (!cascade_truncated) {
        this._dirty_from_page = null;
        console.log(`%c[VDE fit] END natural: cascade_count=${cascade_count}, pages_processed=${_perf.pages_processed}`, 'color: green');
      } else {
        console.log(`%c[VDE fit] END truncated: cascade_count=${cascade_count}, dirty_from=${this._dirty_from_page}`, 'color: red');
      }

      const _t_loop_end = performance.now();

      // Update pages in the DOM once (not inside the loop)
      if (pages_added_or_removed) {
        this.update_pages_elts();
      }

      // Normalize only pages that were touched during reflow
      for(const page_idx of touched_pages) {
        const page = this.pages[page_idx];
        if(page && !page.template && !page.nao_renderizada) page.elt.normalize();
      }

      const _t_normalize_end = performance.now();

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

      // Store pages HTML content (only for touched, non-virtualized pages)
      for(const page_idx of touched_pages) {
        const page = this.pages[page_idx];
        if (page && !page.nao_renderizada) {
          page.prev_innerHTML = page.elt.innerHTML;
        }
      }

      const _t_store_end = performance.now();

      // Re-virtualize pages after reflow
      if (this.virtualization_enabled) {
        this.virtualize_pages();
      }

      const _t_virtualize_end = performance.now();
      const _total = _t_virtualize_end - _perf.t_start;
      if (_total > 30) {
        console.warn(
          `[VDE fit] total: ${_total.toFixed(1)}ms | ` +
          `loop: ${(_t_loop_end - _perf.t_start).toFixed(1)}ms (processed:${_perf.pages_processed} restored:${_perf.pages_restored} skipped:${_perf.pages_skipped}) | ` +
          `backward: ${_perf.backward.toFixed(1)}ms | forward: ${_perf.forward.toFixed(1)}ms | ` +
          `normalize: ${(_t_normalize_end - _t_loop_end).toFixed(1)}ms | ` +
          `store: ${(_t_store_end - _t_normalize_end).toFixed(1)}ms | ` +
          `virtualize: ${(_t_virtualize_end - _t_store_end).toFixed(1)}ms | ` +
          `pages total: ${this.pages.length} | truncated: ${cascade_truncated} | dirty_from: ${this._dirty_from_page}`
        );
      }

      // Clear "fit in progress" flag
      this.fit_in_progress = false;
    },

    // Find which page the user is currently editing (cursor position)
    _get_editing_page_idx () {
      const sel = document.getSelection();
      if (!sel || !sel.anchorNode) return 0;
      let node = sel.anchorNode;
      while (node && node.parentElement) {
        if (node.dataset && node.dataset.isVDEPage !== undefined) {
          const idx = this.pages.findIndex(p => p.elt === node);
          return idx >= 0 ? idx : 0;
        }
        node = node.parentElement;
      }
      return 0;
    },

    // Cancel any pending deferred reflow
    _cancel_deferred_reflow () {
      if (this._deferred_raf_id) {
        cancelAnimationFrame(this._deferred_raf_id);
        this._deferred_raf_id = null;
      }
    },

    // Pre-splits pages whose content is much larger than page height into roughly page-sized chunks.
    // This avoids the extremely slow forward-propagation that occurs when one page holds an entire
    // large document (e.g., 100 pages worth of content in a single DOM element).
    _pre_split_large_pages () {
      if (!this.pages_height) return;

      let did_split = false;

      for (let pi = 0; pi < this.pages.length; pi++) {
        const page = this.pages[pi];
        if (page.template) continue;

        const scroll_h = page.elt.scrollHeight;
        const ratio = scroll_h / this.pages_height;
        if (ratio <= 3) continue; // small overflow - normal reflow handles it fine

        // Get the wrapper div (created as "<div>" + content + "</div>" in reset_content)
        const wrapper = page.elt.firstChild;
        if (!wrapper || !wrapper.children || wrapper.children.length < 2) continue;

        const children = [...wrapper.children];
        // Use actual page count from export if available, otherwise estimate from scrollHeight ratio
        const est_pages = (this._import_page_count && this._import_page_count > ratio) ? this._import_page_count : Math.ceil(ratio);
        const per_page = Math.max(1, Math.ceil(children.length / est_pages));
        const num_new_pages = Math.ceil(children.length / per_page) - 1;

        if (num_new_pages < 1) continue;

        console.log(`%c[VDE pre-split] page ${pi}: ${children.length} children, ratio ${ratio.toFixed(1)}x -> ${num_new_pages + 1} pages (${per_page} children/page)`, 'color: #ff6600; font-weight: bold');

        // Create new page objects
        const new_pages = [];
        for (let i = 0; i < num_new_pages; i++) {
          new_pages.push({ uuid: this.new_uuid(), content_idx: page.content_idx });
        }
        this.pages.splice(pi + 1, 0, ...new_pages);
        this.update_pages_elts();

        // Distribute children to new pages
        for (let g = 0; g < num_new_pages; g++) {
          const target = this.pages[pi + 1 + g];
          const new_wrapper = document.createElement('div');
          const start = (g + 1) * per_page;
          const end = Math.min((g + 2) * per_page, children.length);
          for (let ci = start; ci < end; ci++) {
            new_wrapper.appendChild(children[ci]); // moves DOM node from original page
          }
          target.elt.appendChild(new_wrapper);
        }

        pi += num_new_pages; // skip past new pages in the loop
        did_split = true;
      }

      if (did_split) {
        // Ensure DOM order matches pages array order
        for (const page of this.pages) {
          this.$refs.content.appendChild(page.elt);
        }
      }
    },

    // Schedule background processing for dirty pages (after limited cascade)
    _schedule_deferred_reflow () {
      this._cancel_deferred_reflow();
      this._deferred_raf_id = requestAnimationFrame(() => {
        setTimeout(() => {
          this._deferred_raf_id = null;
          this._deferred_reflow_step();
        }, 0);
      });
    },

    // Process one page per frame in the background to keep UI responsive
    _deferred_reflow_step () {
      if (this._dirty_from_page === null || this._dirty_from_page >= this.pages.length) {
        this._dirty_from_page = null;
        console.log(`%c[VDE deferred] all done, no more dirty pages`, 'color: green; font-weight: bold');
        this._update_page_statuses();
        this._hide_progress();
        if (this._paste_in_progress) {
          this._paste_in_progress = false;
          this._hide_paste_overlay();
        }
        // Clear import page count and emit final content
        this._import_page_count = 0;
        this.emit_new_content();
        return;
      }

      // Use known page count from export for accurate progress, fall back to current count
      const total_pages = (this._import_page_count && this._import_page_count > this.pages.length)
        ? this._import_page_count : this.pages.length;

      // Update progress indicator
      const pct = Math.round((this._dirty_from_page / total_pages) * 100);
      if (this._paste_in_progress) {
        this._show_paste_overlay(`Processando página ${this._dirty_from_page + 1} de ${total_pages} (${pct}%)`);
      } else {
        this._show_progress(this._dirty_from_page, total_pages);
      }

      console.log(`%c[VDE deferred] processing from page ${this._dirty_from_page} of ${this.pages.length} (expected ${total_pages})`, 'color: orange');
      // During paste/import, process more pages per frame (no per-page overlay overhead)
      // During normal editing, process 1 page to keep UI responsive
      const batch_size = this._paste_in_progress ? 5 : 1;
      this.fit_content_over_pages(batch_size, this._dirty_from_page);

      // Update status overlays
      this._update_page_statuses();

      // If there are more dirty pages, schedule next batch
      if (this._dirty_from_page !== null) {
        const pct2 = Math.round((this._dirty_from_page / total_pages) * 100);
        if (this._paste_in_progress) {
          this._show_paste_overlay(`Processando página ${this._dirty_from_page + 1} de ${total_pages} (${pct2}%)`);
        } else {
          this._show_progress(this._dirty_from_page, total_pages);
        }
        this._schedule_deferred_reflow();
      } else {
        this._hide_progress();
        if (this._paste_in_progress) {
          this._paste_in_progress = false;
          this._hide_paste_overlay();
        }
        // Clear import page count
        this._import_page_count = 0;
        // All done - emit updated content
        this.emit_new_content();
      }
    },

    // Show progress indicator in bottom-left corner
    _show_progress (current_page, total_pages) {
      const el = this.$refs.progress_indicator;
      const txt = this.$refs.progress_text;
      if (el) el.style.display = 'flex';
      if (txt) txt.textContent = `Atualizando página ${current_page + 1}/${total_pages}`;
    },

    // Hide progress indicator
    _hide_progress () {
      const el = this.$refs.progress_indicator;
      if (el) el.style.display = 'none';
    },

    // Show full-screen blocking overlay for paste operations
    _show_paste_overlay (text) {
      const el = this.$refs.paste_overlay;
      const txt = this.$refs.paste_text;
      console.log(`%c[VDE overlay] SHOW: "${text}" (el=${!!el})`, 'color: magenta; font-weight: bold');
      if (el) el.style.display = 'flex';
      if (txt) txt.textContent = text;
    },

    // Hide paste overlay
    _hide_paste_overlay () {
      const el = this.$refs.paste_overlay;
      console.log(`%c[VDE overlay] HIDE (el=${!!el})`, 'color: magenta');
      if (el) el.style.display = 'none';
    },

    // Calculate and apply page statuses, then render overlays
    _update_page_statuses () {
      const editing_idx = this._get_editing_page_idx();
      const visible = this.calculate_visible_range();

      for (let i = 0; i < this.pages.length; i++) {
        const page = this.pages[i];
        let status;

        if (this._dirty_from_page === null || i < this._dirty_from_page) {
          // Page already processed
          if (i === editing_idx || i === editing_idx + 1) {
            status = 'editing';
          } else {
            status = 'ready';
          }
        } else {
          // Page is dirty (needs reprocessing)
          if (i >= visible.start && i <= visible.end) {
            status = 'loading';
          } else {
            status = 'await';
          }
        }

        page.pg_status = status;
      }

      // Render visual overlays
      this._render_page_status_overlays();
    },

    // Manage status overlay DOM elements positioned over pages
    _render_page_status_overlays () {
      // Create container if it doesn't exist
      if (!this._status_overlay_container) {
        this._status_overlay_container = document.createElement('div');
        this._status_overlay_container.className = 'page-status-overlays';
        this.$refs.editor.appendChild(this._status_overlay_container);
      }

      // During paste/import operations, skip per-page overlays (paste overlay already shows progress)
      // This avoids O(n²) DOM operations: 91 steps × 90 overlay updates each = ~8000 DOM ops
      if (this._paste_in_progress) {
        this._status_overlay_container.innerHTML = '';
        return;
      }

      // Build a set of pages that need overlays
      const overlay_pages = this.pages.filter(p => p.pg_status === 'loading' || p.pg_status === 'await');
      const overlay_uuids = new Set(overlay_pages.map(p => p.uuid));

      // Remove overlays for pages that no longer need them
      const existing_overlays = [...this._status_overlay_container.children];
      for (const el of existing_overlays) {
        if (!overlay_uuids.has(el.dataset.pageUuid)) {
          el.remove();
        }
      }

      // Create/update overlays for pages that need them
      for (const [page_idx, page] of this.pages.entries()) {
        if (page.pg_status !== 'loading' && page.pg_status !== 'await') continue;

        let overlay_el = this._status_overlay_container.querySelector(`[data-page-uuid="${page.uuid}"]`);

        if (!overlay_el) {
          overlay_el = document.createElement('div');
          overlay_el.className = 'page-status-overlay';
          overlay_el.dataset.pageUuid = page.uuid;
          this._status_overlay_container.appendChild(overlay_el);
        }

        // Update class for loading vs await
        overlay_el.classList.toggle('pg-loading', page.pg_status === 'loading');
        overlay_el.classList.toggle('pg-await', page.pg_status === 'await');

        // Update inner content
        if (page.pg_status === 'loading' && !overlay_el.querySelector('.status-spinner')) {
          overlay_el.innerHTML = '<div class="status-spinner"></div>';
        } else if (page.pg_status === 'await' && !overlay_el.querySelector('.status-await-icon')) {
          overlay_el.innerHTML = '<div class="status-await-icon"></div>';
        }

        // Position overlay to match the page using page_style
        const style = this.page_style(page_idx, false);
        overlay_el.style = this.css_to_string(style);
        overlay_el.style.overflow = 'hidden';
      }
    },

    // Clear all page status overlays (e.g., before print)
    _clear_page_statuses () {
      if (this._status_overlay_container) {
        this._status_overlay_container.innerHTML = '';
      }
      for (const page of this.pages) {
        page.pg_status = 'ready';
      }
    },

    // Run the reflow + emit work after input (limited to 2 pages for instant response)
    _do_input_work () {
      const t0 = performance.now();
      // Cancel any pending deferred reflow before starting new one
      this._cancel_deferred_reflow();
      console.log(`%c[VDE] _do_input_work: calling fit_content_over_pages(max_pages=2, start_from=0)`, 'color: blue; font-weight: bold');
      this.fit_content_over_pages(2); // only process 2 pages immediately!
      const t1 = performance.now();
      console.log(`%c[VDE] _do_input_work: fit done in ${(t1-t0).toFixed(1)}ms | dirty_from_page=${this._dirty_from_page} | total_pages=${this.pages.length}`, 'color: blue');
      this.emit_new_content();
      const t2 = performance.now();
      if(this._last_input_type != "insertText") this.process_current_text_style();
      const t3 = performance.now();

      const total = t3 - t0;
      if (total > 50) {
        console.warn(`[VDE perf] input total: ${total.toFixed(1)}ms | fit: ${(t1-t0).toFixed(1)}ms | emit: ${(t2-t1).toFixed(1)}ms | style: ${(t3-t2).toFixed(1)}ms`);
      }

      // Update page status overlays
      this._update_page_statuses();

      // Schedule background processing for remaining dirty pages
      if (this._dirty_from_page !== null) {
        console.log(`%c[VDE] _do_input_work: scheduling deferred reflow from page ${this._dirty_from_page}`, 'color: orange');
        this._schedule_deferred_reflow();
      } else {
        console.log(`%c[VDE] _do_input_work: all pages clean, no deferred needed`, 'color: green');
        if (this._paste_in_progress) {
          this._paste_in_progress = false;
          this._hide_paste_overlay();
        }
      }
    },

    // Input event - debounced to prevent cascading reflows on rapid typing
    input (e) {
      if(!e) return; // check that event is set

      // Store the input type for deferred processing
      this._last_input_type = e.inputType;

      // Cancel any pending input timer
      if (this._input_timer) clearTimeout(this._input_timer);

      // Detect paste operation
      const is_paste = e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop';

      if (is_paste) {
        // Show blocking overlay immediately, then yield to browser to paint it
        this._paste_in_progress = true;
        this._show_paste_overlay('Colando texto...');
        this._input_timer = setTimeout(() => {
          this._input_timer = null;
          requestAnimationFrame(() => {
            setTimeout(() => {
              this._do_input_work();
            }, 0);
          });
        }, 10);
      } else {
        // Normal typing: debounce, no blocking overlay
        this._input_timer = setTimeout(() => {
          this._input_timer = null;
          this._do_input_work();
        }, 10);
      }
    },

    // Emit content change to parent
    emit_new_content () {
      const _t0 = performance.now();
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
            // For virtualized pages, use cached HTML
            if (page.nao_renderizada && page.cached_html != null) {
              // Parse cached_html to strip wrapper divs, same logic as below
              const temp = document.createElement('div');
              temp.innerHTML = page.cached_html;
              let elt = temp;
              while(elt.children.length == 1 && elt.firstChild.tagName && elt.firstChild.tagName.toLowerCase() == "div" && !elt.firstChild.getAttribute("style")) {
                elt = elt.firstChild;
              }
              return ((elt.innerHTML == "<br>" || elt.innerHTML == "<!---->") ? "" : elt.innerHTML);
            }
            // remove any useless <div> surrounding the content
            let elt = page.elt;
            while(elt.children.length == 1 && elt.firstChild.tagName && elt.firstChild.tagName.toLowerCase() == "div" && !elt.firstChild.getAttribute("style")) {
              elt = elt.firstChild;
            }
            return ((elt.innerHTML == "<br>" || elt.innerHTML == "<!---->") ? "" : elt.innerHTML); // treat a page containing a single <br> or an empty comment as an empty content
          }).join('');
        }
        // if item is a component, just clone the item
        else return { template: item.template, props: { ...item.props }};
      }).filter(item => (item !== false)); // remove empty items

      // avoid calling reset_content after the parent content is updated (infinite loop)
      if(!removed_pages_flag) this.prevent_next_content_update_from_parent = true;

      // send event to parent to update the synced content
      this.$emit("update:content", new_content);

      const _t1 = performance.now();
      if ((_t1 - _t0) > 30) {
        console.warn(`[VDE emit] emit_new_content: ${(_t1 - _t0).toFixed(1)}ms | pages: ${this.pages.length} virtualized: ${this.pages.filter(p => p.nao_renderizada).length}`);
      }
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
          padding: (typeof this.effective_page_margins == "function") ? this.effective_page_margins(page_idx + 1, this.pages.length) : this.effective_page_margins,
          transform: "scale("+ this.zoom +")"
        };
        style[allow_overflow ? "minHeight" : "height"] = this.page_format_mm[1]+"mm";
        return style;
      } else {
        // Content/background <div> is sized so it lets a margin around pages when scrolling at the end
        return { width: "calc("+ bkg_width_mm +"mm + "+ (2*view_padding) +"px)", height: "calc("+ bkg_height_mm +"mm + "+ (2*view_padding) +"px)" };
      }
    },

    // Utility to convert page_style to CSS string
    css_to_string: (css) => Object.entries(css).map(([k, v]) => k.replace(/[A-Z]/g, match => ("-"+match.toLowerCase()))+":"+v).join(';'),

    // Update pages <div> from this.pages data
    update_pages_elts () {
      // Removing deleted pages
      const deleted_pages = [...this.$refs.content.children].filter((page_elt) => !this.pages.find(page => (page.elt == page_elt)));
      for(const page_elt of deleted_pages) { page_elt.remove(); }

      // Adding / updating pages
      for(const [page_idx, page] of this.pages.entries()) {
        // Get either existing page_elt or create it
        if(!page.elt) {
          page.elt = document.createElement("div");
          page.elt.className = "page";
          page.elt.dataset.isVDEPage = "";
          const next_page = this.pages[page_idx + 1];
          this.$refs.content.insertBefore(page.elt, next_page ? next_page.elt : null);
        }
        // Update page properties
        page.elt.dataset.contentIdx = page.content_idx;
        if(!this.printing_mode) page.elt.style = Object.entries(this.page_style(page_idx, page.template ? false : true)).map(([k, v]) => k.replace(/[A-Z]/g, match => ("-"+match.toLowerCase()))+":"+v).join(';'); // (convert page_style to CSS string)
        page.elt.contentEditable = (this.editable && !page.template) ? true : false;
      }
    },

    // Get and store empty editor <div> width
    update_editor_width () {
      this.$refs.editor.classList.add("hide_children");
      this.editor_width = this.$refs.editor.clientWidth;
      this.update_pages_elts();
      this.$refs.editor.classList.remove("hide_children");
    },
    update_css_media_style () {
      this.css_media_style.innerHTML = "@media print { @page { size: "+this.page_format_mm[0]+"mm "+this.page_format_mm[1]+"mm; margin: 0 !important; } .hidden-print { display: none !important; } }";
    },

    // Prepare content before opening the native print box
    before_print () {
      // Exit header/footer editing mode if active
      if (this.editing_hf) this.stop_editing_hf();

      // set the printing mode flag
      this.printing_mode = true;

      // Cancel deferred reflow and process all remaining dirty pages
      this._cancel_deferred_reflow();
      if (this._dirty_from_page !== null) {
        this.fit_content_over_pages(Infinity, this._dirty_from_page);
        this._dirty_from_page = null;
      }

      // Clear status overlays for printing
      this._clear_page_statuses();

      // Restore all virtualized pages before printing
      for (const page of this.pages) {
        if (page.nao_renderizada && page.cached_html != null) {
          page.elt.innerHTML = page.cached_html;
          page.cached_html = null;
          page.nao_renderizada = false;
          page.elt.classList.remove('nao-renderizada');
        }
      }

      // store the current body aside
      this._page_body = document.body;

      // create a new body for the print and overwrite CSS
      const print_body = document.createElement("body");
      print_body.style.margin = "0";
      print_body.style.padding = "0";
      print_body.style.background = "white";
      print_body.style.font = window.getComputedStyle(this.$refs.editor).font;
      print_body.className = this.$refs.editor.className;

      // move each page to the print body
      for(const [page_idx, page] of this.pages.entries()){
        //const page_clone = page_elt.cloneNode(true);
        page.elt.style = ""; // reset page style for the clone
        page.elt.style.position = "relative";
        page.elt.style.padding = (typeof this.effective_page_margins == "function") ? this.effective_page_margins(page_idx + 1, this.pages.length) : this.effective_page_margins;
        page.elt.style.breakBefore = page_idx ? "page" : "auto";
        page.elt.style.width = "calc("+this.page_format_mm[0]+"mm - 2px)";
        page.elt.style.height = "calc("+this.page_format_mm[1]+"mm - 2px)";
        page.elt.style.boxSizing = "border-box";
        page.elt.style.overflow = "hidden";

        // add overlays if any
        const overlay_elt = this.pages_overlay_refs[page.uuid];
        if(overlay_elt){
          overlay_elt.style.position = "absolute";
          overlay_elt.style.left = "0";
          overlay_elt.style.top = "0";
          overlay_elt.style.transform = "none";
          overlay_elt.style.padding = "0";
          overlay_elt.style.overflow = "hidden";
          page.elt.prepend(overlay_elt);
        }
        
        print_body.append(page.elt);
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
      // clear the printing mode flag
      this.printing_mode = false;

      // restore pages and overlays
      for(const [page_idx, page] of this.pages.entries()){
        page.elt.style = this.css_to_string(this.page_style(page_idx, page.template ? false : true));
        this.$refs.content.append(page.elt);
        const overlay_elt = this.pages_overlay_refs[page.uuid];
        if(overlay_elt) {
          overlay_elt.style = this.css_to_string(this.page_style(page_idx, false));
          this.$refs.overlays.append(overlay_elt);
        }
      }
      document.body = this._page_body;

      // recompute editor with and reposition elements
      this.update_editor_width();

      // Re-virtualize pages after print
      if (this.virtualization_enabled) {
        this.virtualize_pages();
      }
    },

    // Start editing header or footer on a specific page
    async start_editing_hf (mode, page_idx) {
      this.editing_hf = mode;
      this.editing_hf_page = page_idx;
      await this.$nextTick();
      const el = this.$refs.overlays && this.$refs.overlays.querySelector('.hf-active[contenteditable]');
      if (el) {
        const content = (mode === 'header') ? (this.header || '') : (this.footer || '');
        el.innerHTML = content || '<div><br></div>';
        el.focus();
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        this._hf_editor_el = el;
      }
    },

    // Stop editing header/footer and save content
    stop_editing_hf () {
      if (!this.editing_hf) return;
      if (this._hf_measure_timer) { clearTimeout(this._hf_measure_timer); this._hf_measure_timer = null; }
      if (this._hf_editor_el) {
        let html = this._hf_editor_el.innerHTML;
        if (html === '<br>' || html === '<div><br></div>') html = '';
        this.$emit('update:' + this.editing_hf, html);
        this._hf_editor_el = null;
      }
      this.editing_hf = null;
      this.editing_hf_page = null;
      // Measure h/f heights and adjust margins after preview renders
      this.$nextTick(() => { this._measure_hf_heights(); });
    },

    // Handle input in header/footer editor (live sync to other pages)
    on_hf_input (mode) {
      if (this._hf_editor_el) {
        let html = this._hf_editor_el.innerHTML;
        if (html === '<br>' || html === '<div><br></div>') html = '';
        this.$emit('update:' + mode, html);
      }
      // Debounced margin measurement during editing
      if (this._hf_measure_timer) clearTimeout(this._hf_measure_timer);
      this._hf_measure_timer = setTimeout(() => { this._measure_hf_heights(); }, 300);
    },

    // Measure header/footer rendered heights and adjust effective margins if needed
    _measure_hf_heights () {
      const px_to_mm = 0.2645833333333;
      const m = this.parsed_margins;
      const origTop = parseFloat(m.top) || 10;
      const origBottom = parseFloat(m.bottom) || 10;
      let hMM = 0, fMM = 0;

      // Measure from the active editor or preview zones
      if (this.editing_hf && this._hf_editor_el) {
        const elMM = this._hf_editor_el.scrollHeight * px_to_mm + 1;
        if (this.editing_hf === 'header') { hMM = elMM; } else { fMM = elMM; }
        // Measure the other zone from preview
        if (this.$refs.overlays) {
          const other = this.$refs.overlays.querySelector(this.editing_hf === 'header' ? '.hf-footer:not(.hf-active)' : '.hf-header:not(.hf-active)');
          const otherMM = other ? other.scrollHeight * px_to_mm + 1 : 0;
          if (this.editing_hf === 'header') { fMM = otherMM; } else { hMM = otherMM; }
        }
      } else if (this.$refs.overlays) {
        const hZone = this.$refs.overlays.querySelector('.hf-header');
        const fZone = this.$refs.overlays.querySelector('.hf-footer');
        if (hZone) hMM = hZone.scrollHeight * px_to_mm + 1;
        if (fZone) fMM = fZone.scrollHeight * px_to_mm + 1;
      }

      const newTop = Math.ceil(hMM) > origTop ? Math.ceil(hMM) : 0;
      const newBottom = Math.ceil(fMM) > origBottom ? Math.ceil(fMM) : 0;

      if (newTop !== this.hf_top_height_mm || newBottom !== this.hf_bottom_height_mm) {
        this.hf_top_height_mm = newTop;
        this.hf_bottom_height_mm = newBottom;
        // Reflow pages with new effective margins (incremental to keep UI responsive)
        this.$nextTick(() => {
          this.update_pages_elts();
          this._cancel_deferred_reflow();
          // Show progress overlay and process incrementally
          if (!this._paste_in_progress) {
            this._paste_in_progress = true;
            this._show_paste_overlay('Processando documento...');
          }
          this.fit_content_over_pages(2);
          this._update_page_statuses();
          if (this._dirty_from_page !== null) {
            this._schedule_deferred_reflow();
          } else {
            this.emit_new_content();
            if (this.virtualization_enabled) this.virtualize_pages();
            this._paste_in_progress = false;
            this._hide_paste_overlay();
          }
        });
      }
    },

    // Click on body content exits header/footer editing mode
    on_content_click () {
      if (this.editing_hf) {
        this.stop_editing_hf();
      }
    }
  },

  // Watch for changes and adapt content accordingly
  watch: {
    content: {
      handler () {
        // prevent infinite loop as reset_content triggers a content update and it's async
        if(this.prevent_next_content_update_from_parent) {
          this.prevent_next_content_update_from_parent = false;
        } else this.reset_content();
      },
      deep: true
    },
    display: {
      handler () { this.update_pages_elts(); }
    },
    page_format_mm: {
      handler () {
        this.update_css_media_style();
        this.reset_content();
      }
    },
    page_margins: {
      handler () {
        this.reset_content();
      }
    },
    zoom: {
      handler () { this.update_pages_elts(); }
    },
    header: {
      handler () {
        // When header content changes externally (e.g. JSON import), re-measure heights
        if (!this.editing_hf) {
          this.$nextTick(() => { this._measure_hf_heights(); });
        }
      }
    },
    footer: {
      handler () {
        // When footer content changes externally (e.g. JSON import), re-measure heights
        if (!this.editing_hf) {
          this.$nextTick(() => { this._measure_hf_heights(); });
        }
      }
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
/* Ordered list numbering with CSS counters via ::marker */
.editor .content ol {
  counter-reset: item;
}
.editor .content ol > li {
  counter-increment: item;
}
/* === DECIMAL (default): hierarchical 1. / 1.1 / 1.1.1 === */
.editor .content ol > li::marker {
  content: counter(item) ". ";
}
.editor .content ol ol > li::marker {
  content: counters(item, ".") " ";
}
/* === UPPER-ROMAN: I. → a. → i. (Word style) === */
.editor .content ol[style*="upper-roman"] > li::marker {
  content: counter(item, upper-roman) ". ";
}
.editor .content ol[style*="upper-roman"] ol > li::marker {
  content: counter(item, lower-alpha) ". ";
}
.editor .content ol[style*="upper-roman"] ol ol > li::marker {
  content: counter(item, lower-roman) ". ";
}
/* === LOWER-ROMAN: i. → a. → 1. === */
.editor .content ol[style*="lower-roman"] > li::marker {
  content: counter(item, lower-roman) ". ";
}
.editor .content ol[style*="lower-roman"] ol > li::marker {
  content: counter(item, lower-alpha) ". ";
}
.editor .content ol[style*="lower-roman"] ol ol > li::marker {
  content: counter(item) ". ";
}
/* === UPPER-ALPHA: A. → a. → i. === */
.editor .content ol[style*="upper-alpha"] > li::marker {
  content: counter(item, upper-alpha) ". ";
}
.editor .content ol[style*="upper-alpha"] ol > li::marker {
  content: counter(item, lower-alpha) ". ";
}
.editor .content ol[style*="upper-alpha"] ol ol > li::marker {
  content: counter(item, lower-roman) ". ";
}
/* === LOWER-ALPHA: a. → i. → 1. === */
.editor .content ol[style*="lower-alpha"] > li::marker {
  content: counter(item, lower-alpha) ". ";
}
.editor .content ol[style*="lower-alpha"] ol > li::marker {
  content: counter(item, lower-roman) ". ";
}
.editor .content ol[style*="lower-alpha"] ol ol > li::marker {
  content: counter(item) ". ";
}
</style>
<style scoped>
.editor {
  display: block;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  cursor: default;
}
.editor ::-webkit-scrollbar {
  width: 16px;
  height: 16px;
}
.editor ::-webkit-scrollbar-track,
.editor ::-webkit-scrollbar-corner {
  display: none;
}
.editor ::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.5);
  border: 5px solid transparent;
  border-radius: 16px;
  background-clip: content-box;
}
.editor ::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.8);
}
.editor .hide_children > * {
  display: none;
}
.editor > .content {
  position: relative;
  outline: none;
  margin: 0;
  padding: 0;
  min-width: 100%;
  pointer-events: none;
}
.editor > .content > :deep(.page) {
  position: absolute;
  box-sizing: border-box;
  left: 50%;
  transform-origin: center top;
  background: var(--page-background, white);
  box-shadow: var(--page-box-shadow, 0 1px 3px 1px rgba(60, 64, 67, 0.15));
  border: var(--page-border);
  border-radius: var(--page-border-radius);
  transition: left 0.3s, top 0.3s;
  overflow: hidden;
  pointer-events: all;
}
.editor > .content[contenteditable],
.editor > .content :deep(*[contenteditable]) {
  cursor: text;
}
.editor > .content :deep(*[contenteditable=false]) {
  cursor: default;
}
.editor > .overlays {
  position: relative;
  margin: 0;
  padding: 0;
  min-width: 100%;
  pointer-events: none;
}
.editor > .overlays > .overlay {
  position: absolute;
  box-sizing: border-box;
  left: 50%;
  transform-origin: center top;
  transition: left 0.3s, top 0.3s;
  overflow: hidden;
  z-index: 1;
}
.editor > .page-status-overlays {
  position: relative;
  margin: 0;
  padding: 0;
  min-width: 100%;
  pointer-events: none;
}
.editor > .page-status-overlays > .page-status-overlay {
  position: absolute;
  box-sizing: border-box;
  left: 50%;
  transform-origin: center top;
  transition: left 0.3s, top 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  z-index: 2;
  border-radius: var(--page-border-radius);
  pointer-events: none;
}
.page-status-overlay.pg-loading {
  background: rgba(255, 255, 255, 0.6);
}
.page-status-overlay.pg-await {
  background: rgba(240, 240, 240, 0.7);
}
.page-status-overlay .status-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  animation: vde-spin 0.7s linear infinite;
}
.page-status-overlay .status-await-icon {
  width: 30px;
  height: 30px;
  border: 3px dashed rgba(0, 0, 0, 0.15);
  border-radius: 50%;
}
@keyframes vde-spin {
  to { transform: rotate(360deg); }
}
.editor > .vde-progress-indicator {
  display: none;
  position: fixed;
  bottom: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  align-items: center;
  gap: 10px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  pointer-events: none;
}
.editor > .vde-progress-indicator > .vde-progress-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: vde-spin 0.7s linear infinite;
}
.editor > .vde-paste-overlay {
  display: none;
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.5);
  z-index: 9999;
  align-items: center;
  justify-content: center;
  cursor: wait;
}
.editor > .vde-paste-overlay > .vde-paste-box {
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 20px 32px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 15px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
.editor > .vde-paste-overlay .vde-paste-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: vde-spin 0.7s linear infinite;
}
/* Header/Footer editable zones */
.editor > .overlays > .overlay > .hf-zone {
  pointer-events: auto;
  cursor: default;
  font-size: 10pt;
  color: #888;
  outline: none;
  width: 100%;
  overflow: visible;
}
.editor > .overlays > .overlay > .hf-zone:not(.hf-active) {
  opacity: 0.5;
}
.editor > .overlays > .overlay > .hf-zone:not(.hf-active):empty::before {
  content: 'Clique duas vezes para editar';
  color: #ccc;
  font-style: italic;
  font-size: 9pt;
}
.editor > .overlays > .overlay > .hf-active {
  opacity: 1;
  color: #333;
  cursor: text;
  background: rgba(26, 115, 232, 0.03);
  position: absolute;
  overflow: visible;
}
.editor > .overlays > .overlay > .hf-header.hf-active {
  border-bottom: 1px dashed #1a73e8;
}
.editor > .overlays > .overlay > .hf-footer.hf-active {
  border-top: 1px dashed #1a73e8;
}
.editor > .overlays > .overlay > .hf-dim {
  opacity: 0.3;
}
.editor > .overlays > .overlay > .hf-active::after {
  content: attr(data-hf-label);
  position: absolute;
  font-size: 8px;
  color: #1a73e8;
  pointer-events: none;
}
.editor > .overlays > .overlay > .hf-header.hf-active::after {
  right: 4px;
  bottom: 2px;
}
.editor > .overlays > .overlay > .hf-footer.hf-active::after {
  right: 4px;
  top: 2px;
}
.editor > .content.hf-body-dim > :deep(.page) {
  opacity: 0.4;
}
</style>