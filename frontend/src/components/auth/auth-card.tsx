import { Link } from 'react-router-dom'
import { LanguageSwitcher } from '@/components/shell/language-switcher'

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mb-6 flex items-center gap-2">
          <span className="text-3xl" aria-hidden>🌾</span>
          <span className="text-xl font-semibold tracking-tight">AgroPlatform</span>
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </main>
      <footer className="flex items-center justify-between border-t border-border-subtle px-4 py-3 text-[10px] text-fg-tertiary">
        <LanguageSwitcher variant="compact" />
        <div className="flex items-center gap-3">
          <span>v1.0</span>
          <Link to="/privacy" className="hover:text-fg-secondary">Privacy</Link>
          <Link to="/terms" className="hover:text-fg-secondary">Terms</Link>
          <a href="https://status.agroplatform.com" target="_blank" rel="noreferrer" className="hover:text-fg-secondary">
            Status
          </a>
        </div>
      </footer>
    </div>
  )
}
