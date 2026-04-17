import { useEffect, useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { KbdSequence } from '@/components/ui/kbd'
import { commands } from '@/lib/command-registry'
import { usePermissionsStore } from '@/stores/permissionsStore'

const SECTION_LABELS: Record<string, string> = {
  general: 'General',
  navigate: 'Navigate',
  action: 'Create',
  switch: 'Switch',
  help: 'Help',
}

const GENERAL_SHORTCUTS = [
  { label: 'Open command palette', shortcut: '⌘ K' },
  { label: 'Show this panel',      shortcut: '⌘ /' },
  { label: 'Toggle sidebar',       shortcut: '[' },
]

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false)
  const hasPermission = usePermissionsStore((s) => s.hasPermission)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey
      if (isMeta && e.key === '/') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    const handleEvent = () => setOpen(true)
    window.addEventListener('keydown', handleKey)
    window.addEventListener('open-keyboard-shortcuts', handleEvent)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('open-keyboard-shortcuts', handleEvent)
    }
  }, [])

  const shortcuts = commands.filter(
    (c) => c.shortcut && (!c.permission || hasPermission(c.permission))
  )

  const grouped: Record<string, { label: string; shortcut: string }[]> = {
    general: [...GENERAL_SHORTCUTS],
    navigate: [],
    action: [],
    switch: [],
    help: [],
  }
  shortcuts.forEach((c) => {
    if (!c.shortcut) return
    const key = c.category === 'contextual' || c.category === 'recent' ? 'general' : c.category
    grouped[key]?.push({ label: c.label, shortcut: c.shortcut })
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Navigate and act without touching the mouse.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-5 overflow-y-auto">
          {Object.entries(grouped).map(([key, items]) => {
            if (items.length === 0) return null
            return (
              <section key={key}>
                <h3 className="mb-2 text-[10px] font-medium uppercase tracking-wide text-fg-tertiary">
                  {SECTION_LABELS[key] ?? key}
                </h3>
                <div className="space-y-1">
                  {items.map((it, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-4 rounded px-2 py-1 hover:bg-bg-muted"
                    >
                      <span className="text-sm text-fg-secondary">{it.label}</span>
                      <KbdSequence sequence={it.shortcut} />
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
