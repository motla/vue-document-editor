// Pure utility functions (no dependencies)

export function debounce(fn, delay) {
  let timer
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

export function new_uuid() {
  return Math.random().toString(36).slice(-5)
}

export function css_to_string(css) {
  return Object.entries(css).map(([k, v]) => k.replace(/[A-Z]/g, match => ("-"+match.toLowerCase()))+":"+v).join(';')
}

// Parse a CSS length value (px, pt, cm, mm, in) to CSS px
export function css_length_to_px(val) {
  if (!val) return 0
  const num = parseFloat(val)
  if (isNaN(num)) return 0
  if (typeof val === 'number') return num
  const s = String(val).trim().toLowerCase()
  if (s.endsWith('pt')) return num * 96 / 72
  if (s.endsWith('cm')) return num * 96 / 2.54
  if (s.endsWith('mm')) return num * 96 / 25.4
  if (s.endsWith('in')) return num * 96
  return num // px or unitless
}
