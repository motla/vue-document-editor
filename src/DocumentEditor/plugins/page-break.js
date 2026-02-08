import { nextTick } from 'vue'

export function createPageBreakPlugin(ctx) {
  async function insertPageBreak() {
    document.execCommand("insertParagraph")
    const marker = "###PB###"
    document.execCommand("insertText", false, marker)
    await nextTick()
    await nextTick()
    const regexp = new RegExp("<(p|div|h\\d)( [^/>]+)*>(<[^/>]+>)*" + marker)
    const content = ctx.content.value
    for (let i = 0; i < content.length; i++) {
      const item = content[i]
      if (typeof item != "string") continue
      const match = regexp.exec(item)
      if (match) {
        const tags_open = match[0].slice(0, -marker.length)
        let content_plus_tags_close = item.substr(match.index + match[0].length)
        if (content_plus_tags_close.indexOf("</") == 0) content_plus_tags_close = "<br>" + content_plus_tags_close
        content.splice(i, 1, item.substr(0, match.index), tags_open + content_plus_tags_close)
        return
      }
    }
    for (let i = 0; i < content.length; i++) {
      const item = content[i]
      if (typeof item != "string" || item.indexOf(marker) < 0) continue
      content.splice(i, 1, item.replace(marker, ''))
      break
    }
  }

  return {
    name: 'page-break',
    tab: 'inserir',
    order: 10,
    getToolbarItems() {
      const dis = !ctx.current_text_style.value
      return [
        { text: "Novo", title: "Novo documento", icon: "description", click: () => { if (confirm("Criar um documento em branco?")) { ctx.content.value = [""]; if (ctx.resetContentHistory) ctx.resetContentHistory() } } },
        { icon: "splitscreen", title: "Quebra de página", disabled: dis, click: insertPageBreak },
      ]
    }
  }
}
