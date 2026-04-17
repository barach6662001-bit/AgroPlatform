import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function SidebarSyncStatus({ collapsed }: { collapsed: boolean }) {
  const [online, setOnline] = useState(navigator.onLine)
  const [lastSync] = useState<Date | null>(new Date())
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
      clearInterval(id)
    }
  }, [])

  const relative = lastSync ? formatRelative(lastSync, tick) : '—'
  const status = !online ? 'offline' : 'connected'
  const dotColor = status === 'offline' ? 'bg-danger' : 'bg-success'
  const label = status === 'offline' ? 'Offline' : `Synced ${relative}`

  if (collapsed) {
    return (
      <div className="flex items-center justify-center py-2" title={label}>
        <span className={cn('h-2 w-2 rounded-full', dotColor)} />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-xs text-fg-tertiary">
      <span className={cn('h-2 w-2 rounded-full shrink-0', dotColor)} />
      <span className="truncate">{label}</span>
    </div>
  )
}

function formatRelative(date: Date, _tick: number): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}
