import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  learnMore?: {
    label: string
    href: string
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  learnMore,
  className,
  size = 'md',
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      size === 'sm' && 'py-8 px-4',
      size === 'md' && 'py-12 px-6',
      size === 'lg' && 'py-20 px-8',
      className,
    )}>
      {Icon && (
        <div className={cn(
          'mb-4 flex items-center justify-center rounded-full bg-bg-muted',
          size === 'sm' && 'h-10 w-10',
          size === 'md' && 'h-12 w-12',
          size === 'lg' && 'h-16 w-16',
        )}>
          <Icon className={cn(
            'text-fg-tertiary',
            size === 'sm' && 'h-5 w-5',
            size === 'md' && 'h-6 w-6',
            size === 'lg' && 'h-8 w-8',
          )} />
        </div>
      )}
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
      {(action || secondaryAction) && (
        <div className="mt-5 flex items-center gap-2">
          {action && (
            <Button onClick={action.onClick} size={size === 'sm' ? 'sm' : 'default'}>
              {action.icon && <action.icon className="mr-1.5 h-4 w-4" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick} size={size === 'sm' ? 'sm' : 'default'}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
      {learnMore && (
        <a
          href={learnMore.href}
          target="_blank"
          rel="noreferrer"
          className="mt-4 text-xs text-fg-tertiary hover:text-fg-secondary"
        >
          {learnMore.label} →
        </a>
      )}
    </div>
  )
}
