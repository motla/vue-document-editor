// Plugin manager: registers plugins and generates toolbar items per tab

export function createPluginManager() {
  const plugins = []

  return {
    register(plugin) {
      plugins.push(plugin)
      plugins.sort((a, b) => (a.order || 0) - (b.order || 0))
    },

    // Returns toolbar items for a given tab, with separators between plugins
    getToolbarItems(tab) {
      const items = []
      const tabPlugins = plugins.filter(p => p.tab === tab || (p.tabs && p.tabs.includes(tab)))
      for (let i = 0; i < tabPlugins.length; i++) {
        const pluginItems = tabPlugins[i].getToolbarItems(tab)
        if (pluginItems && pluginItems.length) {
          if (items.length > 0) items.push({ is: "separator" })
          items.push(...pluginItems)
        }
      }
      return items
    },

    // Returns all registered tabs (preserving order from plugins)
    getTabs() {
      const seen = new Set()
      const tabs = []
      for (const p of plugins) {
        const ptabs = p.tabs || (p.tab ? [p.tab] : [])
        for (const t of ptabs) {
          if (!seen.has(t)) { seen.add(t); tabs.push(t) }
        }
      }
      return tabs
    },

    destroy() {
      for (const p of plugins) {
        if (p.destroy) p.destroy()
      }
    }
  }
}
