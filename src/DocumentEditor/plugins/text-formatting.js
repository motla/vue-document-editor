export function createTextFormattingPlugin(ctx) {
  const fonts = [
    'Arial', 'Arial Black', 'Calibri', 'Cambria', 'Candara', 'Century Gothic',
    'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New',
    'Georgia', 'Impact', 'Lucida Console', 'Palatino Linotype', 'Segoe UI',
    'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'
  ]
  const font_sizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72]

  function curFontFamily() {
    const s = ctx.current_text_style.value
    if (!s || !s.fontFamily) return 'Arial'
    return s.fontFamily.split(',')[0].replace(/['"]/g, '').trim()
  }

  function curFontSize() {
    const s = ctx.current_text_style.value
    if (!s || !s.fontSize) return 11
    return Math.round(parseFloat(s.fontSize) * 72 / 96)
  }

  function applyFontSize(sizePt) {
    document.execCommand('fontSize', false, '7')
    const editor = ctx.editor.value
    const containers = [editor.contentEl]
    if (editor.overlaysEl) containers.push(editor.overlaysEl)
    containers.forEach(container => {
      container.querySelectorAll('font[size="7"]').forEach(el => {
        el.removeAttribute('size')
        el.style.fontSize = sizePt + 'pt'
      })
    })
  }

  function increaseFontSize() {
    const cur = curFontSize()
    const next = font_sizes.find(s => s > cur)
    applyFontSize(next || cur + 2)
  }

  function decreaseFontSize() {
    const cur = curFontSize()
    const prev = [...font_sizes].reverse().find(s => s < cur)
    applyFontSize(prev || Math.max(1, cur - 2))
  }

  return {
    name: 'text-formatting',
    tab: 'editar',
    order: 20,
    getToolbarItems() {
      const s = ctx.current_text_style.value
      const dis = !s
      const mac = ctx.isMacLike.value
      const fontFamily = curFontFamily()
      const fontSize = curFontSize()
      const isBold = s && (parseInt(s.fontWeight) > 400 || (s.fontWeight + '').indexOf("bold") == 0)
      const isItalic = s && s.fontStyle == "italic"
      const isUnderline = s && s.textDecorationStack && s.textDecorationStack.some(d => d.indexOf("underline") == 0)
      const isStrikeThrough = s && s.textDecorationStack && s.textDecorationStack.some(d => d.indexOf("line-through") == 0)
      const curColor = s ? s.color || "transparent" : "transparent"

      return [
        // Font family
        {
          text: fontFamily, title: "Fonte", disabled: dis, chevron: true,
          menu: fonts.map(font => ({
            text: font, style: { fontFamily: font }, active: fontFamily === font,
            click: () => document.execCommand('fontName', false, font)
          })),
          menu_width: 200, menu_height: 300
        },
        // Font size
        {
          text: fontSize + '', title: "Tamanho da fonte", disabled: dis, chevron: true,
          menu: font_sizes.map(size => ({ text: size + '', active: fontSize === size, click: () => applyFontSize(size) })),
          menu_width: 60, menu_height: 280
        },
        { html: "<b style='font-size:14px'>A</b><b style='font-size:8px;vertical-align:super'>▲</b>", title: "Aumentar fonte", disabled: dis, click: increaseFontSize },
        { html: "<b style='font-size:14px'>A</b><b style='font-size:8px;vertical-align:sub'>▼</b>", title: "Diminuir fonte", disabled: dis, click: decreaseFontSize },
        { is: "separator" },
        // Alignment
        { icon: "format_align_left", title: "Align left", active: s && ["start", "left", "-moz-left"].includes(s.textAlign), disabled: dis, hotkey: mac ? "shift+command+l" : "ctrl+shift+l", click: () => document.execCommand("justifyLeft") },
        { icon: "format_align_center", title: "Align center", active: s && ["center", "-moz-center"].includes(s.textAlign), disabled: dis, hotkey: mac ? "shift+command+e" : "ctrl+shift+e", click: () => document.execCommand("justifyCenter") },
        { icon: "format_align_right", title: "Align right", active: s && ["end", "right", "-moz-right"].includes(s.textAlign), disabled: dis, hotkey: mac ? "shift+command+r" : "ctrl+shift+r", click: () => document.execCommand("justifyRight") },
        { icon: "format_align_justify", title: "Justify content", active: s && ["justify", "justify-all"].includes(s.textAlign), disabled: dis, hotkey: mac ? "shift+command+j" : "ctrl+shift+j", click: () => document.execCommand("justifyFull") },
        { is: "separator" },
        // Text style
        { icon: "format_bold", title: "Bold", active: isBold, disabled: dis, hotkey: mac ? "command+b" : "ctrl+b", click: () => document.execCommand("bold") },
        { icon: "format_italic", title: "Italic", active: isItalic, disabled: dis, hotkey: mac ? "command+i" : "ctrl+i", click: () => document.execCommand("italic") },
        { icon: "format_underline", title: "Underline", active: isUnderline, disabled: dis, hotkey: mac ? "command+u" : "ctrl+u", click: () => document.execCommand("underline") },
        { icon: "format_strikethrough", title: "Strike through", active: isStrikeThrough, disabled: dis, click: () => document.execCommand("strikethrough") },
        { is: "button-color", type: "compact", menu_class: "align-center", disabled: dis, color: curColor, update_color: (c) => document.execCommand('foreColor', false, c.hex8) },
      ]
    }
  }
}
