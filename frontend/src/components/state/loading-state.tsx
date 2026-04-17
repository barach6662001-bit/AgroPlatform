import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export type LoadingVariant = 'spinner' | 'skeleton-table' | 'skeleton-card' | 'skeleton-list'

export interface LoadingStateProps {
  variant?: LoadingVariant
  rows?: number
  label?: string
  className?: string
}

export function LoadingState({
  variant = 'spinner',
  rows = 5,
  label = 'Loading',
  className,
}: LoadingStateProps) {
  if (variant === 'spinner') {
    return (
      <div
        role="status"
        aria-label={label}
        className={cn('flex items-center justify-center py-12', className)}
      >
        <Loader2 className="h-5 w-5 animate-spin text-fg-tertiary" />
        <span className="sr-only">{label}</span>
      </div>
    )
  }

  if (variant === 'skeleton-table') {
    return (
      <div role="status" aria-label={label} className={cn('space-y-2', className)}>
        <div className="flex gap-3 border-b border-border-subtle py-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-3 py-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        ))}
        <span className="sr-only">{label}</span>
      </div>
    )
  }

  if (variant === 'skeleton-card') {
    return (
      <div role="status" aria-label={label} className={cn('grid gap-3 md:grid-cols-2 lg:grid-cols-3', className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-md border border-border-subtle p-4 space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
        <span className="sr-only">{label}</span>
      </div>
    )
  }

  // skeleton-list
  return (
    <div role="status" aria-label={label} className={cn('space-y-2', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
      <span className="sr-only">{label}</span>
    </div>
  )
}
