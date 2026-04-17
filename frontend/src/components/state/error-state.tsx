import { AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ErrorStateProps {
  title?: string
  description?: string
  error?: Error | unknown
  onRetry?: () => void
  retryLabel?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  error,
  onRetry,
  retryLabel = 'Try again',
  className,
  size = 'md',
}: ErrorStateProps) {
  const errorMessage = error instanceof Error
    ? error.message
    : typeof error === 'string'
      ? error
      : undefined

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      size === 'sm' && 'py-8 px-4',
      size === 'md' && 'py-12 px-6',
      size === 'lg' && 'py-20 px-8',
      className,
    )}>
      <div className={cn(
        'mb-4 flex items-center justify-center rounded-full bg-danger-subtle',
        size === 'sm' && 'h-10 w-10',
        size === 'md' && 'h-12 w-12',
        size === 'lg' && 'h-16 w-16',
      )}>
        <AlertCircle className={cn(
          'text-danger',
          size === 'sm' && 'h-5 w-5',
          size === 'md' && 'h-6 w-6',
          size === 'lg' && 'h-8 w-8',
        )} />
      </div>
      <h3 className={cn(
        'font-semibold text-fg-primary',
        size === 'sm' && 'text-sm',
        size === 'md' && 'text-base',
        size === 'lg' && 'text-lg',
      )}>
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-fg-secondary">{description}</p>
      )}
      {errorMessage && !description && (
        <p className="mt-1 max-w-sm text-sm text-fg-secondary">{errorMessage}</p>
      )}
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size={size === 'sm' ? 'sm' : 'default'}
          className="mt-5 gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          {retryLabel}
        </Button>
      )}
      {import.meta.env.DEV && error instanceof Error && error.stack && (
        <details className="mt-4 w-full max-w-lg text-left">
          <summary className="cursor-pointer text-xs text-fg-tertiary hover:text-fg-secondary">
            Stack trace (dev only)
          </summary>
          <pre className="mt-2 overflow-auto rounded border border-border-subtle bg-bg-subtle p-3 font-mono text-[10px] text-fg-secondary">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  )
}
