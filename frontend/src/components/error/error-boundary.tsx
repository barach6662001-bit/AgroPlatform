import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[AppErrorBoundary]', error, info)
  }

  render() {
    if (this.state.error) {
      const err = this.state.error
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base px-4 py-12 text-center">
          <div className="mb-6 font-mono text-7xl font-light tracking-tight text-fg-tertiary">500</div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg-primary">Something went wrong</h1>
          <p className="mt-2 max-w-md text-sm text-fg-secondary">
            An unexpected error occurred. Try refreshing, or clear your data if the problem persists.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <button
              onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.reload() }}
              className="rounded border border-border-subtle px-3 py-1.5 text-sm text-fg-secondary hover:bg-bg-muted"
            >
              Clear data &amp; reload
            </button>
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-accent-solid px-3 py-1.5 text-sm text-accent-fg"
            >
              Reload page
            </button>
          </div>
          {import.meta.env.DEV && (
            <details className="mt-8 w-full max-w-2xl text-left">
              <summary className="cursor-pointer text-xs text-fg-tertiary hover:text-fg-secondary">
                Error details (dev only)
              </summary>
              <div className="mt-2 space-y-2">
                <div className="rounded border border-border-subtle bg-bg-subtle p-3 font-mono text-[10px] text-danger">
                  {err.message}
                </div>
                {err.stack && (
                  <pre className="overflow-auto rounded border border-border-subtle bg-bg-subtle p-3 font-mono text-[10px] text-fg-secondary">
                    {err.stack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
