# Task 08 — Empty / Loading / Error State Components

**Goal:** Create three canonical state components that replace scattered AntD `Empty`, `Spin`, `Alert`, and `Result` usages. These become the building blocks every content area uses.

**Depends on:** task-00

---

## Files to change

- **New:** `frontend/src/components/state/empty-state.tsx`
- **New:** `frontend/src/components/state/loading-state.tsx`
- **New:** `frontend/src/components/state/error-state.tsx`
- **New:** `frontend/src/components/state/index.ts`

These are **primitives** — no page-level migration is done in this task. Pages get wired in Wave 2+ as they're touched.

---

## Step 1 — EmptyState

Create `frontend/src/components/state/empty-state.tsx` matching `WIREFRAMES.md §10`:

```tsx
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
          'mb-4 flex items-center justify-center rounded-pill bg-bg-muted',
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
        <p className="mt-1 max-w-sm text-sm text-fg-secondary">
          {description}
        </p>
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
```

---

## Step 2 — LoadingState

Create `frontend/src/components/state/loading-state.tsx`:

```tsx
import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export type LoadingVariant = 'spinner' | 'skeleton-table' | 'skeleton-card' | 'skeleton-list'

export interface LoadingStateProps {
  variant?: LoadingVariant
  rows?: number       // for skeleton-table / skeleton-list
  label?: string      // accessible label
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
        {/* Header row */}
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
          <Skeleton className="h-8 w-8 rounded-pill" />
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
```

If `Skeleton` primitive isn't installed, add it:
```bash
cd frontend && npx shadcn@latest add skeleton
```

---

## Step 3 — ErrorState

Create `frontend/src/components/state/error-state.tsx`:

```tsx
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
        'mb-4 flex items-center justify-center rounded-pill bg-danger-subtle',
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
        <p className="mt-1 max-w-sm text-sm text-fg-secondary">
          {description}
        </p>
      )}
      {errorMessage && !description && (
        <p className="mt-1 max-w-sm text-sm text-fg-secondary">
          {errorMessage}
        </p>
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
          <pre className="mt-2 overflow-auto rounded border border-border-subtle bg-bg-subtle p-3 font-mono text-2xs text-fg-secondary">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  )
}
```

---

## Step 4 — Barrel export

Create `frontend/src/components/state/index.ts`:

```ts
export { EmptyState, type EmptyStateProps } from './empty-state'
export { LoadingState, type LoadingStateProps, type LoadingVariant } from './loading-state'
export { ErrorState, type ErrorStateProps } from './error-state'
```

---

## Step 5 — Demo on design system preview

In the existing `/__design-system` preview route (from Phase 0), add a "States" section showcasing each component with each size / variant. This becomes living documentation for future devs.

Add to `frontend/src/pages/DesignSystem.tsx` (or wherever the preview lives):

```tsx
import { Package, FileText } from 'lucide-react'
import { EmptyState, LoadingState, ErrorState } from '@/components/state'

// Add a new section in the preview
<section>
  <h2 className="text-xl font-semibold mb-4">States</h2>

  <div className="space-y-6">
    <div className="rounded border border-border-subtle">
      <EmptyState
        icon={Package}
        title="No warehouses yet"
        description="Warehouses let you organize and track stored grain, fuel, and inputs."
        action={{ label: 'Add warehouse', onClick: () => {}, icon: Package }}
        learnMore={{ label: 'Learn more about warehouses', href: '#' }}
      />
    </div>

    <div className="rounded border border-border-subtle p-4">
      <h3 className="text-sm font-medium mb-3">Loading — skeleton table</h3>
      <LoadingState variant="skeleton-table" rows={4} />
    </div>

    <div className="rounded border border-border-subtle p-4">
      <h3 className="text-sm font-medium mb-3">Loading — skeleton cards</h3>
      <LoadingState variant="skeleton-card" rows={3} />
    </div>

    <div className="rounded border border-border-subtle p-4">
      <h3 className="text-sm font-medium mb-3">Loading — spinner</h3>
      <LoadingState variant="spinner" />
    </div>

    <div className="rounded border border-border-subtle">
      <ErrorState
        title="Could not load data"
        description="The server returned an error. Please try again."
        onRetry={() => {}}
      />
    </div>
  </div>
</section>
```

---

## Acceptance criteria

- [ ] Three components exist under `frontend/src/components/state/`
- [ ] All three render correctly in `/__design-system` preview
- [ ] `EmptyState` supports icon, title, description, action, secondaryAction, learnMore, sizes sm/md/lg
- [ ] `LoadingState` supports spinner, skeleton-table, skeleton-card, skeleton-list variants
- [ ] `ErrorState` supports retry, shows stack trace only in dev
- [ ] `Skeleton` shadcn primitive installed if not already
- [ ] Barrel export `index.ts` in place
- [ ] No AntD imports in any state component
- [ ] `npm run build` passes, `npm run lint` passes

---

## Playwright screenshots

- `docs/screenshots/wave-1/task-08-states-light.png` (full states section)
- `docs/screenshots/wave-1/task-08-states-dark.png`

---

## Git

```bash
git add frontend/src/components/state/ \
        frontend/src/pages/DesignSystem.tsx \
        frontend/components.json \
        frontend/src/components/ui/skeleton.tsx 2>/dev/null \
        docs/screenshots/wave-1/

git commit -m "feat(shell): canonical empty / loading / error state components

- EmptyState with icon + title + description + actions + learnMore
- LoadingState with spinner / skeleton-table / skeleton-card / skeleton-list variants
- ErrorState with retry + dev-only stack trace
- all three showcased in /__design-system preview
- size prop (sm/md/lg) consistent across all three

Task: wave-1/task-08"
git push
```

Append to `_progress.md`.
