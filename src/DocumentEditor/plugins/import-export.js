export function createImportExportPlugin(ctx) {
  function exportJSON() {
    const editor = ctx.editor.value
    const doc = {
      content: ctx.content.value,
      header_content: ctx.header_content.value,
      footer_content: ctx.footer_content.value,
      page_format_mm: ctx.page_format_mm.value,
      page_margins: ctx.page_margins.value,
      page_count: editor ? editor.pages.length : undefined
    }
    const json = JSON.stringify(doc, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'documento.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function importJSON() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const doc = JSON.parse(ev.target.result)
          const editor = ctx.editor.value
          editor._paste_in_progress = true
          editor._import_page_count = doc.page_count || 0
          editor._show_paste_overlay('Importando documento...')
          requestAnimationFrame(() => { setTimeout(() => {
            if (doc.content) ctx.content.value = doc.content
            if (doc.header_content !== undefined) ctx.header_content.value = doc.header_content
            if (doc.footer_content !== undefined) ctx.footer_content.value = doc.footer_content
            if (doc.page_format_mm) ctx.page_format_mm.value = doc.page_format_mm
            if (doc.page_margins) ctx.page_margins.value = doc.page_margins
            if (ctx.resetContentHistory) ctx.resetContentHistory()
          }, 0) })
        } catch (err) {
          alert('Erro ao importar arquivo: ' + err.message)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return {
    name: 'import-export',
    tab: 'exportar',
    order: 20,
    getToolbarItems() {
      return [
        { text: "Exportar JSON", title: "Exportar documento como JSON", icon: "file_download", click: exportJSON },
        { text: "Importar JSON", title: "Importar documento de JSON", icon: "file_upload", click: importJSON },
      ]
    }
  }
}
