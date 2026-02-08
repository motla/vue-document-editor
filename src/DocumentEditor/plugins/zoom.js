import { onMounted, onBeforeUnmount } from 'vue'

export function createZoomPlugin(ctx) {
  let start_zoom_gesture = false
  let start_dist_touch = false
  let start_zoom_touch = false
  const handlers = []

  function clampZoom(val) {
    return Math.min(Math.max(val, ctx.zoom_min.value), ctx.zoom_max.value)
  }

  function addHandler(target, event, fn, opts) {
    target.addEventListener(event, fn, opts)
    handlers.push([target, event, fn, opts])
  }

  onMounted(() => {
    // Ctrl+scroll / trackpad pinch
    addHandler(window, "wheel", (e) => {
      if (e.ctrlKey) {
        e.preventDefault()
        ctx.zoom.value = clampZoom(ctx.zoom.value - e.deltaY * 0.01)
      }
    }, { passive: false })

    // Safari gesture events
    addHandler(window, "gesturestart", (e) => {
      e.preventDefault()
      start_zoom_gesture = ctx.zoom.value
    })
    addHandler(window, "gesturechange", (e) => {
      e.preventDefault()
      if (!start_zoom_touch) {
        ctx.zoom.value = clampZoom(start_zoom_gesture * e.scale)
      }
    })
    addHandler(window, "gestureend", () => { start_zoom_gesture = false })

    // Touch pinch
    addHandler(window, "touchstart", (e) => {
      if (e.touches.length == 2) {
        e.preventDefault()
        start_dist_touch = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        )
        start_zoom_touch = ctx.zoom.value
      }
    }, { passive: false })
    addHandler(window, "touchmove", (e) => {
      if (start_dist_touch && start_zoom_touch) {
        e.preventDefault()
        const zoom = start_zoom_touch * Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        ) / start_dist_touch
        ctx.zoom.value = clampZoom(zoom)
      }
    }, { passive: false })
    addHandler(window, "touchend", () => {
      start_dist_touch = false
      start_zoom_touch = false
    }, { passive: false })
  })

  onBeforeUnmount(() => {
    for (const [target, event, fn, opts] of handlers) {
      target.removeEventListener(event, fn, opts)
    }
    handlers.length = 0
  })

  return {
    name: 'zoom',
    tab: 'configurar',
    order: 20,
    getToolbarItems() {
      return [
        {
          text: Math.floor(ctx.zoom.value * 100) + "%",
          title: "Zoom", icon: "zoom_in", chevron: true,
          menu: [
            ["200%", 2.0], ["150%", 1.5], ["125%", 1.25], ["100%", 1.0],
            ["75%", 0.75], ["50%", 0.5], ["25%", 0.25]
          ].map(([text, zoom]) => ({
            text, active: ctx.zoom.value == zoom,
            click: () => { ctx.zoom.value = zoom }
          })),
          menu_width: 80, menu_height: 280, menu_class: "align-center"
        },
        {
          title: "Exibição",
          icon: ctx.display.value == "horizontal" ? "view_column" : (ctx.display.value == "vertical" ? "view_stream" : "view_module"),
          chevron: true,
          menu: [
            { icon: "view_module", active: ctx.display.value == "grid", click: () => { ctx.display.value = "grid" } },
            { icon: "view_column", active: ctx.display.value == "horizontal", click: () => { ctx.display.value = "horizontal" } },
            { icon: "view_stream", active: ctx.display.value == "vertical", click: () => { ctx.display.value = "vertical" } },
          ],
          menu_width: 55, menu_class: "align-right"
        }
      ]
    }
  }
}
