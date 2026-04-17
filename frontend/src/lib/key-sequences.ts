type Listener = () => void

class KeySequenceMatcher {
  private buffer = ''
  private timer: ReturnType<typeof setTimeout> | null = null
  private listeners = new Map<string, Listener>()

  register(sequence: string, listener: Listener) {
    this.listeners.set(sequence.toLowerCase(), listener)
  }

  handle(e: KeyboardEvent) {
    const target = e.target as HTMLElement
    const tag = target.tagName
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return
    if (target.isContentEditable) return
    if (e.metaKey || e.ctrlKey || e.altKey) return

    const key = e.key.toLowerCase()
    if (key.length !== 1) return

    this.buffer += key
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => { this.buffer = '' }, 1000)

    for (const [seq, listener] of this.listeners) {
      const compact = seq.replace(/\s+/g, '').toLowerCase()
      if (this.buffer.endsWith(compact)) {
        listener()
        this.buffer = ''
        return
      }
    }
  }
}

export const keySequenceMatcher = new KeySequenceMatcher()

export function installKeySequences() {
  const handler = (e: KeyboardEvent) => keySequenceMatcher.handle(e)
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}
