import { cn } from '@/lib/utils'

export function Kbd({
  children, className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={cn(
      'inline-flex items-center justify-center rounded border border-border-subtle',
      'bg-bg-base px-1.5 py-0.5 font-mono text-[10px] font-medium text-fg-secondary',
      'shadow-sm min-w-[20px] h-5',
      className,
    )}>
      {children}
    </kbd>
  )
}

export function KbdSequence({ sequence }: { sequence: string }) {
  const parts = sequence.split(/\s+/).filter(Boolean)
  return (
    <div className="inline-flex items-center gap-0.5">
      {parts.map((p, i) => <Kbd key={i}>{p}</Kbd>)}
    </div>
  )
}
