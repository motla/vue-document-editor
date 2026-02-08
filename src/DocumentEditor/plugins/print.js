export function createPrintPlugin() {
  return {
    name: 'print',
    tab: 'exportar',
    order: 10,
    getToolbarItems() {
      return [
        { text: "Imprimir / PDF", title: "Imprimir ou salvar como PDF", icon: "print", click: () => window.print() },
      ]
    }
  }
}
