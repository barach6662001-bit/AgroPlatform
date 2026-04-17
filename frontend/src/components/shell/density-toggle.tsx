import { usePreferencesStore, type Density } from '@/stores/preferencesStore'

export function DensityToggle() {
  const density = usePreferencesStore((s) => s.density)
  const setDensity = usePreferencesStore((s) => s.setDensity)

  return (
    <div className="flex items-center gap-1 rounded border border-border-subtle bg-bg-base p-0.5">
      {(['compact', 'comfortable'] as Density[]).map((d) => (
        <button
          key={d}
          onClick={() => setDensity(d)}
          className={pill(density === d)}
        >
          {d.charAt(0).toUpperCase() + d.slice(1)}
        </button>
      ))}
    </div>
  )
}

const pill = (active: boolean) =>
  `rounded-sm px-2 py-0.5 text-[10px] font-medium transition-colors ${
    active
      ? 'bg-accent-solid text-accent-fg'
      : 'text-fg-secondary hover:text-fg-primary'
  }`
