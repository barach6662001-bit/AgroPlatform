# Task 09 — Error Pages (404 / 403 / 500 / Maintenance)

**Goal:** Build shared `<ErrorPage>` component with 4 configurations matching `WIREFRAMES.md §11`. Wire 404 to react-router catchall, 500 to an `ErrorBoundary` at app root.

**Depends on:** task-08 (uses `EmptyState`/`ErrorState` primitives as reference style)

---

## Files to change

- **New:** `frontend/src/components/error/error-page.tsx` — shared layout
- **New:** `frontend/src/pages/NotFound.tsx` — wraps ErrorPage with 404 config
- **New:** `frontend/src/pages/Forbidden.tsx` — wraps ErrorPage with 403 config
- **New:** `frontend/src/pages/ServerError.tsx` — wraps ErrorPage with 500 config
- **New:** `frontend/src/pages/Maintenance.tsx` — wraps ErrorPage with maintenance config
- **New:** `frontend/src/components/error/error-boundary.tsx` — React error boundary
- **Update:** router config — catchall + `errorElement`
- **Update:** `frontend/src/App.tsx` — wrap router in `ErrorBoundary`

---

## Step 1 — Shared ErrorPage

Create `frontend/src/components/error/error-page.tsx`:

```tsx
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
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-pill bg-bg-muted">
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
            <div className="rounded border border-border-subtle bg-bg-subtle p-3 font-mono text-2xs text-danger">
              {error.message}
            </div>
            {error.stack && (
              <pre className="overflow-auto rounded border border-border-subtle bg-bg-subtle p-3 font-mono text-2xs text-fg-secondary">
                {error.stack}
              </pre>
            )}
          </div>
        </details>
      )}
    </div>
  )
}
```

---

## Step 2 — Page wrappers

Create `frontend/src/pages/NotFound.tsx`:

```tsx
import { ErrorPage } from '@/components/error/error-page'
export default function NotFound() {
  return <ErrorPage code="404" />
}
```

Create `frontend/src/pages/Forbidden.tsx`:

```tsx
import { ErrorPage } from '@/components/error/error-page'
export default function Forbidden() {
  return <ErrorPage code="403" />
}
```

Create `frontend/src/pages/ServerError.tsx`:

```tsx
import { ErrorPage } from '@/components/error/error-page'
import { useRouteError } from 'react-router-dom'

export default function ServerError() {
  const error = useRouteError() as Error | undefined
  return (
    <ErrorPage
      code="500"
      error={error instanceof Error ? error : undefined}
      primaryAction={{
        label: 'Reload page',
        onClick: () => window.location.reload(),
      }}
    />
  )
}
```

Create `frontend/src/pages/Maintenance.tsx`:

```tsx
import { ErrorPage } from '@/components/error/error-page'
export default function Maintenance() {
  return <ErrorPage code="maintenance" />
}
```

---

## Step 3 — React Error Boundary

Create `frontend/src/components/error/error-boundary.tsx`:

```tsx
import { Component, type ReactNode } from 'react'
import { ErrorPage } from './error-page'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Wire to Sentry / error reporting when available
    console.error('[AppErrorBoundary]', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorPage
          code="500"
          error={this.state.error}
          primaryAction={{
            label: 'Reload page',
            onClick: () => window.location.reload(),
          }}
          secondaryAction={{
            label: 'Clear data & reload',
            onClick: () => {
              localStorage.clear()
              sessionStorage.clear()
              window.location.reload()
            },
          }}
        />
      )
    }
    return this.props.children
  }
}
```

---

## Step 4 — Router wiring

Read the current router config (likely `frontend/src/router.tsx` or inside `App.tsx`). Add:

1. **Catchall 404** — the last route:
   ```tsx
   { path: '*', lazy: async () => ({ Component: (await import('@/pages/NotFound')).default }) }
   ```

2. **ErrorElement on every layout route** (for loader errors and thrown errors):
   ```tsx
   {
     path: '/',
     element: <AppLayout />,
     errorElement: <ServerError />,
     children: [
       // routes
     ],
   }
   ```

3. **403 route** (optional public route for direct navigation):
   ```tsx
   { path: '/forbidden', Component: Forbidden }
   ```

---

## Step 5 — Wrap app in ErrorBoundary

Edit `frontend/src/App.tsx`:

```tsx
import { AppErrorBoundary } from '@/components/error/error-boundary'
// ...
return (
  <AppErrorBoundary>
    <ThemeProvider>
      <ThemeBridge />
      <CommandPalette />
      <KeyboardShortcutsDialog />
      <RouterProvider router={router} />
    </ThemeProvider>
  </AppErrorBoundary>
)
```

---

## Step 6 — PermissionGuard integration

Find the existing `PermissionGuard` component (likely `frontend/src/components/PermissionGuard.tsx` or `auth/` folder). Ensure its "denied" fallback renders `<ErrorPage code="403" />` instead of any AntD `Result`:

```tsx
// inside PermissionGuard.tsx
if (!hasPermission) {
  return <ErrorPage code="403" />
}
```

If PermissionGuard currently does a redirect to `/login` or similar, preserve that behavior but add a prop `mode?: 'redirect' | 'render-403'` so you can switch per-usage.

---

## Step 7 — Manual test scenarios

1. Navigate to `/this-does-not-exist` → 404 page with "Go back" + "Go to dashboard"
2. Throw an error in a page (add `throw new Error('test')` temporarily) → 500 page with error stack in dev
3. User without permission visits a gated route → 403 page
4. Manually navigate to `/maintenance` → maintenance page with wrench icon

---

## Acceptance criteria

- [ ] All 4 error page variants render matching WIREFRAMES §11
- [ ] 404 appears for any unmatched route
- [ ] `ErrorBoundary` catches render errors and shows 500 page
- [ ] Dev mode shows error stack trace expandable
- [ ] Prod mode does not show stack trace
- [ ] `PermissionGuard` can render 403 page inline
- [ ] No AntD imports in any error component
- [ ] "Contact support" email link works
- [ ] `npm run build` passes, `npm run lint` passes

---

## Playwright screenshots

- `docs/screenshots/wave-1/task-09-404-light.png`
- `docs/screenshots/wave-1/task-09-404-dark.png`
- `docs/screenshots/wave-1/task-09-403.png`
- `docs/screenshots/wave-1/task-09-500-dev.png` (with stack trace)
- `docs/screenshots/wave-1/task-09-maintenance.png`

---

## Git

```bash
git add frontend/src/components/error/ \
        frontend/src/pages/NotFound.tsx \
        frontend/src/pages/Forbidden.tsx \
        frontend/src/pages/ServerError.tsx \
        frontend/src/pages/Maintenance.tsx \
        frontend/src/router* frontend/src/App.tsx 2>/dev/null \
        frontend/src/components/PermissionGuard.tsx 2>/dev/null \
        docs/screenshots/wave-1/

git commit -m "feat(shell): 404 / 403 / 500 / maintenance pages + ErrorBoundary

- shared ErrorPage component, 4 configs
- catchall route for 404
- React ErrorBoundary at app root renders 500 page
- dev-only stack trace expandable
- PermissionGuard now renders 403 page inline
- 'Clear data & reload' escape hatch for corrupt state

Task: wave-1/task-09"
git push
```

Append to `_progress.md`.
