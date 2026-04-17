import { useLangStore } from '@/stores/langStore'

const LANGS = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'uk', label: 'Українська', short: 'UK' },
] as const

export function LanguageSwitcher({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const { lang, setLang } = useLangStore()

  return (
    <div className="flex items-center gap-1 rounded border border-border-subtle bg-bg-base p-0.5">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code as 'en' | 'uk')}
          className={`rounded-sm px-2 py-0.5 text-[10px] font-medium transition-colors ${
            lang === l.code
              ? 'bg-accent-solid text-accent-fg'
              : 'text-fg-secondary hover:text-fg-primary'
          }`}
        >
          {variant === 'full' ? l.label : l.short}
        </button>
      ))}
    </div>
  )
}
