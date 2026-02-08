<template>
  <div class="main">

    <!-- Top bar -->
    <div class="toolbar-container">
      <div class="tab-bar">
        <button :class="{ active: current_tab === 'editar' }" @click="current_tab = 'editar'">Editar</button>
        <button :class="{ active: current_tab === 'inserir' }" @click="current_tab = 'inserir'">Inserir</button>
        <button :class="{ active: current_tab === 'configurar' }" @click="current_tab = 'configurar'">Configurar</button>
        <button :class="{ active: current_tab === 'exportar' }" @click="current_tab = 'exportar'">Exportar</button>
      </div>
      <vue-file-toolbar-menu :content="menu" class="bar" />
    </div>

    <!-- Document editor -->
    <vue-document-editor class="editor" ref="editor"
      v-model:content="content"
      v-model:header="header_content"
      v-model:footer="footer_content"
      :overlay="overlay"
      :zoom="zoom"
      :page_format_mm="page_format_mm"
      :page_margins="page_margins"
      :display="display" />

  </div>
</template>

<script>
import VueFileToolbarMenu from 'vue-file-toolbar-menu';
import VueDocumentEditor from '../DocumentEditor/DocumentEditor.vue'; // set from 'vue-document-editor' in your application
import InvoiceTemplate from './InvoiceTemplate.ce.vue';
import { markRaw } from 'vue';

export default {
  components: { VueDocumentEditor, VueFileToolbarMenu },

  data () {
    return {
      // This is where the pages content is stored and synced
      content: [
        ''
      ],
      zoom: 1,
      zoom_min: 0.10,
      zoom_max: 5.0,
      page_format_mm: [210, 297],
      page_margins: "10mm 15mm",
      header_content: '<strong>MYCOMPANY</strong> example.com',
      footer_content: 'MY COMPANY - example.com',
      current_tab: "editar",
      display: "grid", // ["grid", "vertical", "horizontal"]
      mounted: false, // will be true after this component is mounted
      undo_count: -1, // contains the number of times user can undo (= current position in content_history)
      content_history: [] // contains the content states for undo/redo operations
    }
  },

  created () {
    // Initialize gesture flags
    let start_zoom_gesture = false;
    let start_dist_touch = false;
    let start_zoom_touch = false;

    // Manage ctrl+scroll zoom (or trackpad pinch)
    window.addEventListener("wheel", (e) => {
      if(e.ctrlKey){
        e.preventDefault();
        this.zoom = Math.min(Math.max(this.zoom - e.deltaY * 0.01, this.zoom_min), this.zoom_max);
      }
    }, { passive: false });

    // Manage trackpad pinch on Safari
    window.addEventListener("gesturestart", (e) => {
      e.preventDefault();
      start_zoom_gesture = this.zoom;
    });
    window.addEventListener("gesturechange", (e) => {
      e.preventDefault();
      if(!start_zoom_touch){
        this.zoom = Math.min(Math.max(start_zoom_gesture * e.scale, this.zoom_min), this.zoom_max);
      }
    });
    window.addEventListener("gestureend", () => {
      start_zoom_gesture = false;
    });

    // Manage pinch to zoom for touch devices
    window.addEventListener("touchstart", (e) => {
      if (e.touches.length == 2) {
        e.preventDefault();
        start_dist_touch = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        start_zoom_touch = this.zoom;
      }
    }, { passive: false });
    window.addEventListener("touchmove", (e) => {
      if (start_dist_touch && start_zoom_touch) {
        e.preventDefault();
        let zoom = start_zoom_touch * Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        ) / start_dist_touch;
        this.zoom = Math.min(Math.max(zoom, this.zoom_min), this.zoom_max);
      }
    }, { passive: false });
    window.addEventListener("touchend", () => {
      start_dist_touch = false;
      start_zoom_touch = false;
    }, { passive: false });

    // Manage history undo/redo events
    const manage_undo_redo = (e) => {
      switch(e && e.inputType){
        case "historyUndo": e.preventDefault(); e.stopPropagation(); this.undo(); break;
        case "historyRedo": e.preventDefault(); e.stopPropagation(); this.redo(); break;
      }
    }
    window.addEventListener("beforeinput", manage_undo_redo);
    window.addEventListener("input", manage_undo_redo); // in case of beforeinput event is not implemented (Firefox)

    // If your component is susceptible to be destroyed, don't forget to
    // use window.removeEventListener in the Vue.js beforeUnmount handler
  },

  mounted () { this.mounted = true; },

  computed: {

    // Menu content based on active tab
    menu () {
      if (this.current_tab === 'inserir') return this.menu_inserir;
      if (this.current_tab === 'configurar') return this.menu_configurar;
      if (this.current_tab === 'exportar') return this.menu_exportar;
      return this.menu_editar;
    },

    // Tab "Editar" - text formatting tools
    menu_editar () {
      return [
        { title: "Undo", icon: "undo", disabled: !this.can_undo, hotkey: this.isMacLike ? "command+z" : "ctrl+z", click: () => this.undo() },
        { title: "Redo", icon: "redo", disabled: !this.can_redo, hotkey: this.isMacLike ? "shift+command+z" : "ctrl+y", click: () => this.redo() },
        { is: "separator" },
        {
          text: this.curFontFamily,
          title: "Fonte",
          disabled: !this.current_text_style,
          chevron: true,
          menu: [
            'Arial', 'Arial Black', 'Calibri', 'Cambria', 'Candara', 'Century Gothic',
            'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New',
            'Georgia', 'Impact', 'Lucida Console', 'Palatino Linotype', 'Segoe UI',
            'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'
          ].map(font => ({
            text: font,
            style: { fontFamily: font },
            active: this.curFontFamily === font,
            click: () => document.execCommand('fontName', false, font)
          })),
          menu_width: 200,
          menu_height: 300
        },
        {
          text: this.curFontSize + '',
          title: "Tamanho da fonte",
          disabled: !this.current_text_style,
          chevron: true,
          menu: this.font_sizes.map(size => ({
            text: size + '',
            active: this.curFontSize === size,
            click: () => this.applyFontSize(size)
          })),
          menu_width: 60,
          menu_height: 280
        },
        { html: "<b style='font-size:14px'>A</b><b style='font-size:8px;vertical-align:super'>▲</b>", title: "Aumentar fonte", disabled: !this.current_text_style, click: () => this.increaseFontSize() },
        { html: "<b style='font-size:14px'>A</b><b style='font-size:8px;vertical-align:sub'>▼</b>", title: "Diminuir fonte", disabled: !this.current_text_style, click: () => this.decreaseFontSize() },
        { is: "separator" },
        { icon: "format_align_left", title: "Align left", active: this.isLeftAligned, disabled: !this.current_text_style, hotkey: this.isMacLike ? "shift+command+l" : "ctrl+shift+l", click: () => document.execCommand("justifyLeft") },
        { icon: "format_align_center", title: "Align center", active: this.isCentered, disabled: !this.current_text_style, hotkey: this.isMacLike ? "shift+command+e" : "ctrl+shift+e", click: () => document.execCommand("justifyCenter") },
        { icon: "format_align_right", title: "Align right", active: this.isRightAligned, disabled: !this.current_text_style, hotkey: this.isMacLike ? "shift+command+r" : "ctrl+shift+r", click: () => document.execCommand("justifyRight") },
        { icon: "format_align_justify", title: "Justify content", active: this.isJustified, disabled: !this.current_text_style, hotkey: this.isMacLike ? "shift+command+j" : "ctrl+shift+j", click: () => document.execCommand("justifyFull") },
        { is: "separator" },
        { icon: "format_bold", title: "Bold", active: this.isBold, disabled: !this.current_text_style, hotkey: this.isMacLike ? "command+b" : "ctrl+b", click: () => document.execCommand("bold") },
        { icon: "format_italic", title: "Italic", active: this.isItalic, disabled: !this.current_text_style, hotkey: this.isMacLike ? "command+i" : "ctrl+i", click: () => document.execCommand("italic") },
        { icon: "format_underline", title: "Underline", active: this.isUnderline, disabled: !this.current_text_style, hotkey: this.isMacLike ? "command+u" : "ctrl+u", click: () => document.execCommand("underline") },
        { icon: "format_strikethrough", title: "Strike through", active: this.isStrikeThrough, disabled: !this.current_text_style, click: () => document.execCommand("strikethrough") },
        { is: "button-color", type: "compact", menu_class: "align-center", disabled: !this.current_text_style, color: this.curColor, update_color: (new_color) => document.execCommand('foreColor', false, new_color.hex8) },
        { is: "separator" },
        { icon: "format_list_numbered", title: "Lista numerada", active: this.isNumberedList, disabled: !this.current_text_style, chevron: true,
          menu: [
            { text: "Nenhum", click: () => this.removeList() },
            { is: "separator" },
            { html: "1. &nbsp;2. &nbsp;3.", active: this.curListStyleType === 'decimal', click: () => this.applyNumberedList('decimal') },
            { html: "I. &nbsp;II. &nbsp;III.", active: this.curListStyleType === 'upper-roman', click: () => this.applyNumberedList('upper-roman') },
            { html: "A. &nbsp;B. &nbsp;C.", active: this.curListStyleType === 'upper-alpha', click: () => this.applyNumberedList('upper-alpha') },
            { html: "a. &nbsp;b. &nbsp;c.", active: this.curListStyleType === 'lower-alpha', click: () => this.applyNumberedList('lower-alpha') },
            { html: "i. &nbsp;ii. &nbsp;iii.", active: this.curListStyleType === 'lower-roman', click: () => this.applyNumberedList('lower-roman') },
          ], menu_width: 150 },
        { icon: "format_list_bulleted", title: "Lista com marcadores", active: this.isBulletedList, disabled: !this.current_text_style, chevron: true,
          menu: [
            { text: "Nenhum", click: () => this.removeList() },
            { is: "separator" },
            { html: "● &nbsp;&nbsp;Disco", active: this.curListStyleType === 'disc', click: () => this.applyBulletedList('disc') },
            { html: "○ &nbsp;&nbsp;Círculo", active: this.curListStyleType === 'circle', click: () => this.applyBulletedList('circle') },
            { html: "■ &nbsp;&nbsp;Quadrado", active: this.curListStyleType === 'square', click: () => this.applyBulletedList('square') },
          ], menu_width: 160 },
        { icon: "format_indent_decrease", title: "Diminuir recuo", disabled: !this.current_text_style, click: () => document.execCommand("outdent") },
        { icon: "format_indent_increase", title: "Aumentar recuo", disabled: !this.current_text_style, click: () => document.execCommand("indent") },
        { icon: "format_line_spacing", title: "Espaçamento", disabled: !this.current_text_style, chevron: true,
          menu: (() => {
            const blockEl = this.mounted ? this._getBlockElement() : null;
            const spaceBefore = blockEl ? parseFloat(window.getComputedStyle(blockEl).marginTop) || 0 : 0;
            const spaceAfter = blockEl ? parseFloat(window.getComputedStyle(blockEl).marginBottom) || 0 : 0;
            return [
              { text: "1,0", active: Math.abs(this.curLineHeight - 1) < 0.08, click: () => this.applyLineSpacing('1') },
              { text: "1,15", active: Math.abs(this.curLineHeight - 1.15) < 0.08, click: () => this.applyLineSpacing('1.15') },
              { text: "1,5", active: Math.abs(this.curLineHeight - 1.5) < 0.08, click: () => this.applyLineSpacing('1.5') },
              { text: "2,0", active: Math.abs(this.curLineHeight - 2) < 0.08, click: () => this.applyLineSpacing('2') },
              { text: "2,5", active: Math.abs(this.curLineHeight - 2.5) < 0.08, click: () => this.applyLineSpacing('2.5') },
              { text: "3,0", active: Math.abs(this.curLineHeight - 3) < 0.08, click: () => this.applyLineSpacing('3') },
              { is: "separator" },
              { text: spaceBefore > 0 ? "Remover espaço antes do parágrafo" : "Adicionar espaço antes do parágrafo", click: () => this.toggleSpaceBefore() },
              { text: spaceAfter > 0 ? "Remover espaço depois do parágrafo" : "Adicionar espaço depois do parágrafo", click: () => this.toggleSpaceAfter() },
            ];
          })(), menu_width: 280 },
        { html: "<b style='font-size:13px'>A</b><b style='font-size:9px'>↓</b><b style='font-size:13px'>Z</b>", title: "Classificar A-Z", disabled: !this.current_text_style, click: () => this.sortSelectedLines() },
        { is: "separator" },
        { html: "<b>H1</b>", title: "Header 1", active: this.isH1, disabled: !this.current_text_style, click: () => document.execCommand('formatBlock', false, '<h1>') },
        { html: "<b>H2</b>", title: "Header 2", active: this.isH2, disabled: !this.current_text_style, click: () => document.execCommand('formatBlock', false, '<h2>') },
        { html: "<b>H3</b>", title: "Header 3", active: this.isH3, disabled: !this.current_text_style, click: () => document.execCommand('formatBlock', false, '<h3>') },
        { icon: "format_clear", title: "Clear format", disabled: !this.current_text_style, click () { document.execCommand('removeFormat'); document.execCommand('formatBlock', false, '<div>'); } },
      ]
    },

    // Tab "Inserir" - insert operations
    menu_inserir () {
      return [
        { text: "Novo", title: "Novo documento", icon: "description", click: () => { if(confirm("Criar um documento em branco?")){ this.content = [""]; this.resetContentHistory(); } } },
        { icon: "splitscreen", title: "Quebra de página", disabled: !this.current_text_style, click: () => this.insertPageBreak() },
      ]
    },

    // Tab "Exportar" - print, PDF, import/export
    menu_exportar () {
      return [
        { text: "Imprimir", title: "Imprimir", icon: "print", click: () => window.print() },
        { text: "PDF", title: "Baixar PDF", icon: "picture_as_pdf", click: () => this.$refs.editor.generate_pdf({ filename: 'documento.pdf' }) },
        { is: "separator" },
        { text: "Exportar JSON", title: "Exportar documento como JSON", icon: "file_download", click: () => this.exportJSON() },
        { text: "Importar JSON", title: "Importar documento de JSON", icon: "file_upload", click: () => this.importJSON() },
      ]
    },

    // Tab "Configurar" - page and display settings
    menu_configurar () {
      return [
        {
          text: this.current_format_name,
          title: "Formato",
          icon: "crop_free",
          chevron: true,
          menu: this.formats.map(([text, w, h]) => ({
            text,
            active: (this.page_format_mm[0] == w && this.page_format_mm[1] == h),
            click: () => { this.page_format_mm = [w, h]; }
          })),
          menu_width: 80,
          menu_height: 280
        },
        {
          text: this.current_margins_name,
          title: "Margens",
          icon: "select_all",
          chevron: true,
          menu: this.margins.map(([text, value]) => ({
            text: text+" ("+value+")",
            active: (this.page_margins == value),
            click: () => { this.page_margins = value; }
          })),
          menu_width: 200,
          menu_class: "align-center"
        },
        { is: "separator" },
        {
          text: Math.floor(this.zoom * 100) + "%",
          title: "Zoom",
          icon: "zoom_in",
          chevron: true,
          menu: [
            ["200%", 2.0],
            ["150%", 1.5],
            ["125%", 1.25],
            ["100%", 1.0],
            ["75%", 0.75],
            ["50%", 0.5],
            ["25%", 0.25]
          ].map(([text, zoom]) => ({
            text,
            active: this.zoom == zoom,
            click: () => { this.zoom = zoom; }
          })),
          menu_width: 80,
          menu_height: 280,
          menu_class: "align-center"
        },
        {
          title: "Exibição",
          icon: this.display == "horizontal" ? "view_column" : (this.display == "vertical" ? "view_stream" : "view_module"),
          chevron: true,
          menu: [{
            icon: "view_module",
            active: this.display == "grid",
            click: () => { this.display = "grid"; }
          }, {
            icon: "view_column",
            active: this.display == "horizontal",
            click: () => { this.display = "horizontal"; }
          }, {
            icon: "view_stream",
            active: this.display == "vertical",
            click: () => { this.display = "vertical"; }
          }],
          menu_width: 55,
          menu_class: "align-right"
        }
      ]
    },

    // Formats management
    current_format_name () {
      const format = this.formats.find(([, width_mm, height_mm]) => (this.page_format_mm[0] == width_mm && this.page_format_mm[1] == height_mm));
      return format ? format[0] : (this.page_format_mm[0]+"mm x "+this.page_format_mm[1]+"mm");
    },
    formats: () => [
      ["A0", 841, 1189],
      ["A0L", 1189, 841],
      ["A1", 594, 841],
      ["A1L", 841, 594],
      ["A2", 420, 594],
      ["A2L", 594, 420],
      ["A3", 297, 420],
      ["A3L", 420, 297],
      ["A4", 210, 297],
      ["A4L", 297, 210],
      ["A5", 148, 210],
      ["A5L", 210, 148],
      ["A6", 105, 148],
      ["A6L", 148, 105]
    ],

    // Margins management
    current_margins_name () {
      const margins = this.margins.find(([, margins]) => (this.page_margins == margins));
      return margins ? margins[0] : this.page_margins;
    },
    margins: () => [
      ["Medium", "20mm"],
      ["Small", "15mm"],
      ["Slim", "10mm 15mm"],
      ["Tiny", "5mm"]
    ],

    // Current text style management
    current_text_style () { return this.mounted ? this.$refs.editor.current_text_style : false; },
    isLeftAligned () { return ["start", "left", "-moz-left"].includes(this.current_text_style.textAlign); },
    isRightAligned () { return ["end", "right", "-moz-right"].includes(this.current_text_style.textAlign); },
    isCentered () { return ["center", "-moz-center"].includes(this.current_text_style.textAlign); },
    isJustified () { return ["justify", "justify-all"].includes(this.current_text_style.textAlign); },
    isBold () {
      const fontWeight = this.current_text_style.fontWeight;
      return fontWeight && (parseInt(fontWeight) > 400 || fontWeight.indexOf("bold") == 0);
    },
    isItalic () { return this.current_text_style.fontStyle == "italic"; },
    isUnderline () { // text-decoration is not overridden by children, so we query the parent stack
      const stack = this.current_text_style.textDecorationStack;
      return stack && stack.some(d => (d.indexOf("underline") == 0));
    },
    isStrikeThrough () { // text-decoration is not overridden by children, so we query the parent stack
      const stack = this.current_text_style.textDecorationStack;
      return stack && stack.some(d => (d.indexOf("line-through") == 0));
    },
    isNumberedList () { return this.current_text_style.isList && ['decimal', 'upper-roman', 'lower-roman', 'upper-alpha', 'lower-alpha'].includes(this.current_text_style.listStyleType); },
    isBulletedList () { return this.current_text_style.isList && ['disc', 'circle', 'square'].includes(this.current_text_style.listStyleType); },
    curListStyleType () { return (this.current_text_style && this.current_text_style.isList) ? this.current_text_style.listStyleType : ''; },
    isH1 () { return this.current_text_style.headerLevel == 1; },
    isH2 () { return this.current_text_style.headerLevel == 2; },
    isH3 () { return this.current_text_style.headerLevel == 3; },
    curColor () { return this.current_text_style.color || "transparent"; },
    curFontFamily () {
      if (!this.current_text_style || !this.current_text_style.fontFamily) return 'Arial';
      return this.current_text_style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
    },
    curFontSize () {
      if (!this.current_text_style || !this.current_text_style.fontSize) return 11;
      return Math.round(parseFloat(this.current_text_style.fontSize) * 72 / 96);
    },
    font_sizes: () => [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72],
    curLineHeight () {
      if (!this.current_text_style) return 1;
      // Read margin-top from block element (paragraph), not inline element
      const blockEl = this.mounted ? this._getBlockElement() : null;
      if (!blockEl) return 1;
      const mt = parseFloat(window.getComputedStyle(blockEl).marginTop) || 0;
      const fs = parseFloat(this.current_text_style.fontSize) || 16;
      return Math.round((mt / fs + 1) * 100) / 100;
    },

    // Platform management
    isMacLike: () => /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform),

    // Undo / redo flags
    can_undo () { return this.undo_count > 0; },
    can_redo () { return this.content_history.length - this.undo_count - 1 > 0; }
  },

  methods: {
    // Page overlays (page numbers only - headers/footers are now editable via h/f zones)
    overlay (page, total) {
      return '<div style="position: absolute; bottom: 1mm; ' + ((page % 2) ? 'right' : 'left') + ': 10mm; font-size: 8pt; color: #aaa;">Página ' + page + ' de ' + total + '</div>';
    },

    // Undo / redo functions examples
    undo () { if(this.can_undo){ this._mute_next_content_watcher = true; this.content = this.content_history[--this.undo_count]; } },
    redo () { if(this.can_redo){ this._mute_next_content_watcher = true; this.content = this.content_history[++this.undo_count]; } },
    resetContentHistory () { this.content_history = []; this.undo_count = -1; },

    applyFontSize (sizePt) {
      document.execCommand('fontSize', false, '7');
      // Search for the temporary font[size="7"] elements in both body content and h/f editor
      const containers = [this.$refs.editor.$refs.content];
      if (this.$refs.editor.$refs.overlays) containers.push(this.$refs.editor.$refs.overlays);
      containers.forEach(container => {
        container.querySelectorAll('font[size="7"]').forEach(el => {
          el.removeAttribute('size');
          el.style.fontSize = sizePt + 'pt';
        });
      });
    },
    increaseFontSize () {
      const next = this.font_sizes.find(s => s > this.curFontSize);
      this.applyFontSize(next || this.curFontSize + 2);
    },
    decreaseFontSize () {
      const prev = [...this.font_sizes].reverse().find(s => s < this.curFontSize);
      this.applyFontSize(prev || Math.max(1, this.curFontSize - 2));
    },

    applyNumberedList (styleType) {
      if (this.isBulletedList) document.execCommand('insertUnorderedList');
      if (!this.isNumberedList) document.execCommand('insertOrderedList');
      const sel = window.getSelection();
      if (!sel.focusNode) return;
      let el = sel.focusNode.tagName ? sel.focusNode : sel.focusNode.parentElement;
      while (el && el.tagName !== 'OL') el = el.parentElement;
      if (el) el.style.listStyleType = styleType;
    },
    applyBulletedList (styleType) {
      if (this.isNumberedList) document.execCommand('insertOrderedList');
      if (!this.isBulletedList) document.execCommand('insertUnorderedList');
      const sel = window.getSelection();
      if (!sel.focusNode) return;
      let el = sel.focusNode.tagName ? sel.focusNode : sel.focusNode.parentElement;
      while (el && el.tagName !== 'UL') el = el.parentElement;
      if (el) el.style.listStyleType = styleType;
    },
    removeList () {
      if (this.isNumberedList) document.execCommand('insertOrderedList');
      else if (this.isBulletedList) document.execCommand('insertUnorderedList');
    },
    // Find the nearest block-level element at the caret position
    _getBlockElement () {
      const sel = window.getSelection();
      if (!sel.focusNode) return null;
      let el = sel.focusNode.tagName ? sel.focusNode : sel.focusNode.parentElement;
      while (el) {
        if (el.contentEditable === 'true') return null;
        const d = window.getComputedStyle(el).display;
        if (d === 'block' || d === 'list-item') return el;
        el = el.parentElement;
      }
      return null;
    },
    // Find ALL leaf block-level elements (paragraphs) within the current selection
    _getSelectedBlockElements () {
      const sel = window.getSelection();
      if (!sel.rangeCount) return [];
      const range = sel.getRangeAt(0);
      if (range.collapsed) {
        const el = this._getBlockElement();
        return el ? [el] : [];
      }
      let root = range.commonAncestorContainer;
      if (root.nodeType !== 1) root = root.parentElement;
      // Recursively collect leaf blocks (blocks with no nested block children in range)
      const blocks = [];
      const collect = (parent) => {
        for (const child of parent.children) {
          if (!range.intersectsNode(child)) continue;
          const d = window.getComputedStyle(child).display;
          if (d !== 'block' && d !== 'list-item') continue;
          // Check if child has nested blocks in range (container vs leaf)
          let hasNestedBlock = false;
          for (const gc of child.children) {
            if (!range.intersectsNode(gc)) continue;
            const gd = window.getComputedStyle(gc).display;
            if (gd === 'block' || gd === 'list-item') { hasNestedBlock = true; break; }
          }
          if (hasNestedBlock) collect(child);
          else blocks.push(child);
        }
      };
      collect(root);
      // Fallback: root itself is a leaf block (single paragraph partially selected)
      if (!blocks.length && root.contentEditable !== 'true') {
        const d = window.getComputedStyle(root).display;
        if (d === 'block' || d === 'list-item') return [root];
      }
      return blocks;
    },
    applyLineSpacing (value) {
      const blocks = this._getSelectedBlockElements();
      const margin = parseFloat(value) - 1;
      blocks.forEach(el => { el.style.marginTop = margin > 0 ? margin + 'em' : '0'; });
    },
    toggleSpaceBefore () {
      const blocks = this._getSelectedBlockElements();
      if (!blocks.length) return;
      // Toggle based on first element's state
      const current = parseFloat(window.getComputedStyle(blocks[0]).marginTop) || 0;
      const newVal = current > 0 ? '0' : '12pt';
      blocks.forEach(el => { el.style.marginTop = newVal; });
    },
    toggleSpaceAfter () {
      const blocks = this._getSelectedBlockElements();
      if (!blocks.length) return;
      const current = parseFloat(window.getComputedStyle(blocks[0]).marginBottom) || 0;
      const newVal = current > 0 ? '0' : '12pt';
      blocks.forEach(el => { el.style.marginBottom = newVal; });
    },
    sortSelectedLines () {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer.nodeType === 1
        ? range.commonAncestorContainer
        : range.commonAncestorContainer.parentElement;
      const lines = container.innerHTML.split(/<br\s*\/?>/i).filter(l => l.trim());
      if (lines.length < 2) return;
      lines.sort((a, b) => a.replace(/<[^>]+>/g, '').localeCompare(b.replace(/<[^>]+>/g, ''), 'pt'));
      container.innerHTML = lines.join('<br>');
    },

    // Export document as JSON file
    exportJSON () {
      const doc = {
        content: this.content,
        header_content: this.header_content,
        footer_content: this.footer_content,
        page_format_mm: this.page_format_mm,
        page_margins: this.page_margins
      };
      const json = JSON.stringify(doc, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'documento.json';
      a.click();
      URL.revokeObjectURL(url);
    },

    // Import document from JSON file
    importJSON () {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const doc = JSON.parse(ev.target.result);
            // Show overlay immediately before heavy processing
            const editor = this.$refs.editor;
            editor._paste_in_progress = true;
            editor._show_paste_overlay('Importando documento...');
            // rAF queues before next paint, setTimeout(0) runs after paint completes
            requestAnimationFrame(() => { setTimeout(() => {
              console.log('%c[Import] starting content update', 'color: blue; font-weight: bold');
              if (doc.content) this.content = doc.content;
              if (doc.header_content !== undefined) this.header_content = doc.header_content;
              if (doc.footer_content !== undefined) this.footer_content = doc.footer_content;
              if (doc.page_format_mm) this.page_format_mm = doc.page_format_mm;
              if (doc.page_margins) this.page_margins = doc.page_margins;
              this.resetContentHistory();
            }, 0); });
          } catch (err) {
            alert('Erro ao importar arquivo: ' + err.message);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    },

    // Insert page break function example
    async insertPageBreak () {
      // insert paragraph at caret position
      document.execCommand("insertParagraph");

      // insert a marker at caret position (start of the new paragraph)
      const marker = "###PB###"; // must be regex compatible
      document.execCommand("insertText", false, marker);

      // wait for v-model content update (two ticks are needed to reactivate watch on content)
      await this.$nextTick();
      await this.$nextTick();

      // find the marker inside content items and split this content item in two items between the two paragraphs
      // only match root tags (p, div, h1, h2...) to avoid non-root tags like <li>
      const regexp = new RegExp("<(p|div|h\\d)( [^/>]+)*>(<[^/>]+>)*"+marker);
      for(let i = 0; i < this.content.length; i++) {
        const item = this.content[i];
        if(typeof item != "string") continue;
        const match = regexp.exec(item);
        if(match) {
          const tags_open = match[0].slice(0, -marker.length);
          let content_plus_tags_close = item.substr(match.index + match[0].length);
          // insert <br> to empty pages that would not be handled correctly by contenteditable
          if(content_plus_tags_close.indexOf("</") == 0) content_plus_tags_close = "<br>" + content_plus_tags_close;
          this.content.splice(i, 1, item.substr(0, match.index), tags_open + content_plus_tags_close);
          return;
        }
      }

      // if the code didn't return before, the split didn't work (e.g. inside a <li>). just remove the marker from the content
      for(let i = 0; i < this.content.length; i++) {
        const item = this.content[i];
        if(typeof item != "string" || item.indexOf(marker) < 0) continue;
        this.content.splice(i, 1, item.replace(marker, ''));
        break;
      }
    }
  },

  watch: {
    content: {
      immediate: true,
      // Fill undo / redo history stack on user input
      handler (new_content) {
        if(!this._mute_next_content_watcher) { // only update the stack when content is changed by user input, not undo/redo commands
          this.content_history[++this.undo_count] = new_content;
          this.content_history.length = this.undo_count + 1; // remove all redo items
        }
        this._mute_next_content_watcher = false;
      }
    }
  }
}
</script>

<style>
html {
  height: 100%;
}
body {
  margin: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: black;
  background: rgb(248, 249, 250);
}
::-webkit-scrollbar {
  width: 16px;
  height: 16px;
}
::-webkit-scrollbar-track, ::-webkit-scrollbar-corner {
  display: none;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.5);
  border: 5px solid transparent;
  border-radius: 16px;
  background-clip: content-box;
}
::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.8);
}
</style>

<style scoped>
  .main {
    width: fit-content;
    min-width: 100%;
  }
  .toolbar-container {
    position: sticky;
    left: 0;
    top: 0;
    width: calc(100vw - 16px);
    z-index: 1000;
    background: rgba(248, 249, 250, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: solid 1px #e0e0e0;
  }
  .tab-bar {
    display: flex;
    padding: 4px 8px 0;
  }
  .tab-bar button {
    padding: 6px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
    color: #444;
    border-bottom: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s;
  }
  .tab-bar button:hover {
    color: #188038;
  }
  .tab-bar button.active {
    color: #188038;
    border-bottom-color: #188038;
    font-weight: 600;
  }
  .bar {
    --bar-button-active-color: #188038;
    --bar-button-open-color: #188038;
    --bar-button-active-bkg: #e6f4ea;
    --bar-button-open-bkg: #e6f4ea;
  }
</style>