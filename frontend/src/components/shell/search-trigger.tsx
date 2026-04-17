import { Search } from 'lucide-react'
import { useCommandPaletteStore } from '@/stores/commandPaletteStore'

export function SearchTrigger() {
  const open = useCommandPaletteStore((s) => s.open)
  return (
    <button
      onClick={() => open()}
      className="group flex h-8 items-center gap-2 rounded border border-border-subtle bg-bg-base px-2.5 text-sm text-fg-tertiary hover:border-border-default hover:text-fg-secondary transition-colors"
    >
      <Search className="h-3.5 w-3.5" />
      <span className="hidden sm:inline mr-8">Search...</span>
      <kbd className="ml-auto rounded border border-border-subtle bg-bg-muted px-1.5 py-0.5 font-mono text-[10px] text-fg-tertiary">
        ⌘K
      </kbd>
    </button>
  )
}
