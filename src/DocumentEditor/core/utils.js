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
