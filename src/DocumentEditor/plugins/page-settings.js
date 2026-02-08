export function createPageSettingsPlugin(ctx) {
  const formats = [
    ["A0", 841, 1189], ["A0L", 1189, 841],
    ["A1", 594, 841], ["A1L", 841, 594],
    ["A2", 420, 594], ["A2L", 594, 420],
    ["A3", 297, 420], ["A3L", 420, 297],
    ["A4", 210, 297], ["A4L", 297, 210],
    ["A5", 148, 210], ["A5L", 210, 148],
    ["A6", 105, 148], ["A6L", 148, 105]
  ]

  const margins = [
    ["Medium", "20mm"],
    ["Small", "15mm"],
    ["Slim", "10mm 15mm"],
    ["Tiny", "5mm"]
  ]

  function currentFormatName() {
    const fmt = ctx.page_format_mm.value
    const found = formats.find(([, w, h]) => fmt[0] == w && fmt[1] == h)
    return found ? found[0] : (fmt[0] + "mm x " + fmt[1] + "mm")
  }

  function currentMarginsName() {
    const found = margins.find(([, v]) => ctx.page_margins.value == v)
    return found ? found[0] : ctx.page_margins.value
  }

  return {
    name: 'page-settings',
    tab: 'configurar',
    order: 10,
    getToolbarItems() {
      return [
        {
          text: currentFormatName(), title: "Formato", icon: "crop_free", chevron: true,
          menu: formats.map(([text, w, h]) => ({
            text, active: (ctx.page_format_mm.value[0] == w && ctx.page_format_mm.value[1] == h),
            click: () => { ctx.page_format_mm.value = [w, h] }
          })),
          menu_width: 80, menu_height: 280
        },
        {
          text: currentMarginsName(), title: "Margens", icon: "select_all", chevron: true,
          menu: margins.map(([text, value]) => ({
            text: text + " (" + value + ")", active: (ctx.page_margins.value == value),
            click: () => { ctx.page_margins.value = value }
          })),
          menu_width: 200, menu_class: "align-center"
        },
      ]
    }
  }
}
