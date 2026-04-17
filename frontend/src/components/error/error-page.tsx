import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MessageSquare, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'

export type ErrorCode = '404' | '403' | '500' | 'maintenance'

interface Config {
  code: string
  title: string
  description: string
  icon?: LucideIcon
  showDefaultActions?: boolean
}

const CONFIGS: Record<ErrorCode, Config> = {
  '404': {
    code: '404',
    title: 'Page not found',
    description: "The page you're looking for doesn't exist or was moved.",
    showDefaultActions: true,
  },
  '403': {
    code: '403',
    title: 'Access denied',
    description: "You don't have permission to view this page. Ask your administrator if you think this is a mistake.",
    showDefaultActions: true,
  },
  '500': {
    code: '500',
    title: 'Something went wrong',
    description: 'The server had a problem processing your request. Try refreshing the page.',
    showDefaultActions: true,
  },
  maintenance: {
    code: 'Maintenance',
    title: "We'll be right back",
    description: "AgroPlatform is getting an upgrade. We'll be back online shortly.",
    icon: Wrench,
  },
}

export interface ErrorPageProps {
  code: ErrorCode
  title?: string
  description?: string
  primaryAction?: { label: string; onClick: () => void }
  secondaryAction?: { label: string; onClick: () => void }
  error?: Error
}

export function ErrorPage({
  code, title, description, primaryAction, secondaryAction, error,
}: ErrorPageProps) {
  const navigate = useNavigate()
  const config = CONFIGS[code]

  const finalTitle = title ?? config.title
  const finalDescription = description ?? config.description

  const primary = primaryAction ?? (config.showDefaultActions ? {
    label: 'Go to dashboard',
    onClick: () => navigate('/dashboard'),
  } : undefined)

  const secondary = secondaryAction ?? (config.showDefaultActions ? {
    label: 'Go back',
    onClick: () => navigate(-1),
  } : undefined)

  const Icon = config.icon

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base px-4 py-12 text-center">
      {Icon ? (
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-bg-muted">
          <Icon className="h-7 w-7 text-fg-tertiary" />
        </div>
      ) : (
        <div className="mb-6 font-mono text-7xl font-light tracking-tight text-fg-tertiary">
          {config.code}
        </div>
      )}
      <h1 className="text-2xl font-semibold tracking-tight text-fg-primary">
        {finalTitle}
      </h1>
      <p className="mt-2 max-w-md text-sm text-fg-secondary">
        {finalDescription}
      </p>

      {(primary || secondary) && (
        <div className="mt-6 flex items-center gap-2">
          {secondary && (
            <Button variant="outline" onClick={secondary.onClick} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              {secondary.label}
            </Button>
          )}
          {primary && (
            <Button onClick={primary.onClick} className="gap-1.5">
              {primary.label}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      <div className="mt-8 flex items-center gap-2 text-xs text-fg-tertiary">
        <MessageSquare className="h-3.5 w-3.5" />
        <span>
          Need help?{' '}
          <a
            href="mailto:support@agroplatform.com"
            className="underline underline-offset-2 hover:text-fg-secondary"
          >
            Contact support
          </a>
        </span>
      </div>

      {import.meta.env.DEV && error && (
        <details className="mt-8 w-full max-w-2xl text-left">
          <summary className="cursor-pointer text-xs text-fg-tertiary hover:text-fg-secondary">
            Error details (dev only)
          </summary>
          <div className="mt-2 space-y-2">
            <div className="rounded border border-border-subtle bg-bg-subtle p-3 font-mono text-[10px] text-danger">
              {error.message}
            </div>
            {error.stack && (
              <pre className="overflow-auto rounded border border-border-subtle bg-bg-subtle p-3 font-mono text-[10px] text-fg-secondary">
                {error.stack}
              </pre>
            )}
          </div>
        </details>
      )}
    </div>
  )
}
