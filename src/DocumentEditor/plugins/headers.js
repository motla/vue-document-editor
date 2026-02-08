export function createHeadersPlugin(ctx) {
  return {
    name: 'headers',
    tab: 'editar',
    order: 50,
    getToolbarItems() {
      const s = ctx.current_text_style.value
      const dis = !s
      return [
        { html: "<b>H1</b>", title: "Header 1", active: s && s.headerLevel == 1, disabled: dis, click: () => document.execCommand('formatBlock', false, '<h1>') },
        { html: "<b>H2</b>", title: "Header 2", active: s && s.headerLevel == 2, disabled: dis, click: () => document.execCommand('formatBlock', false, '<h2>') },
        { html: "<b>H3</b>", title: "Header 3", active: s && s.headerLevel == 3, disabled: dis, click: () => document.execCommand('formatBlock', false, '<h3>') },
        { icon: "format_clear", title: "Clear format", disabled: dis, click() { document.execCommand('removeFormat'); document.execCommand('formatBlock', false, '<div>') } },
      ]
    }
  }
}
