# Task 00 — Aesthetic Foundation

**Goal:** Update `tokens.css` with the Wave 1.5 palette (from AESTHETIC.md), add gradient mesh utility classes, add animation helpers, install framer-motion. This is the foundation every later task builds on.

**Depends on:** Wave 1 complete

---

## Step 1 — Update tokens.css

Open `frontend/src/styles/tokens.css` (created in Phase 0). Add the Wave 1.5 tokens alongside existing ones. Do NOT remove existing tokens — existing components depend on them. Add these under `:root`:

```css
:root {
  /* Wave 1.5 aesthetic tokens */

  /* Backgrounds */
  --bg-deep: #0A0A0B;
  --bg-surface: #111113;
  --bg-elevated: #17171A;
  --bg-subtle: #1C1C20;

  /* Text */
  --fg-primary: #F5F5F7;
  --fg-secondary: #A1A1AA;
  --fg-tertiary: #52525B;
  --fg-quaternary: #27272A;

  /* Primary accent (emerald) */
  --accent-emerald-50: #ECFDF5;
  --accent-emerald-400: #34D399;
  --accent-emerald-500: #10B981;
  --accent-emerald-600: #059669;
  --accent-emerald-glow: rgba(16, 185, 129, 0.25);

  /* Secondary accents for KPI variance */
  --accent-blue-500: #3B82F6;
  --accent-blue-glow: rgba(59, 130, 246, 0.25);
  --accent-purple-500: #A855F7;
  --accent-purple-glow: rgba(168, 85, 247, 0.25);
  --accent-amber-500: #F59E0B;
  --accent-amber-glow: rgba(245, 158, 11, 0.25);
  --accent-pink-500: #EC4899;
  --accent-pink-glow: rgba(236, 72, 153, 0.25);
  --accent-cyan-500: #06B6D4;
  --accent-cyan-glow: rgba(6, 182, 212, 0.25);

  /* Culture colors (agri conventions) */
  --culture-sunflower: #F59E0B;
  --culture-wheat: #EAB308;
  --culture-corn: #3B82F6;
  --culture-rapeseed: #EC4899;
  --culture-soy: #10B981;
  --culture-peas: #A855F7;
  --culture-empty: #52525B;

  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.05);
  --border-default: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.12);
  --border-accent: rgba(16, 185, 129, 0.3);

  /* Shadows / glow */
  --shadow-kpi: 0 0 0 1px rgba(255,255,255,0.02), 0 0 60px -20px var(--accent-emerald-glow);
  --shadow-card: 0 4px 24px -8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
  --shadow-popover: 0 8px 32px -8px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08);
}

/* Gradient mesh utilities */
.gradient-mesh-default {
  background:
    radial-gradient(800px circle at 20% 0%, rgba(34, 197, 94, 0.08), transparent 50%),
    radial-gradient(600px circle at 80% 100%, rgba(59, 130, 246, 0.06), transparent 50%),
    radial-gradient(400px circle at 50% 50%, rgba(168, 85, 247, 0.04), transparent 50%),
    var(--bg-deep);
}

.gradient-mesh-finance {
  background:
    radial-gradient(800px circle at 10% 0%, rgba(16, 185, 129, 0.1), transparent 50%),
    radial-gradient(600px circle at 90% 50%, rgba(59, 130, 246, 0.08), transparent 50%),
    var(--bg-deep);
}

.gradient-mesh-fields {
  background:
    radial-gradient(800px circle at 50% 0%, rgba(16, 185, 129, 0.12), transparent 60%),
    radial-gradient(400px circle at 0% 100%, rgba(245, 158, 11, 0.06), transparent 50%),
    var(--bg-deep);
}

/* Noise overlay */
.noise-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.015;
  mix-blend-mode: overlay;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* Shimmer skeleton */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--bg-subtle) 0%,
    var(--bg-elevated) 50%,
    var(--bg-subtle) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

/* Tabular nums helper */
.tabular-nums {
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}

/* Card with glow hover */
.card-hoverable {
  transition: all 500ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 0 1px rgba(255,255,255,0.02);
}
.card-hoverable:hover {
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.08),
    0 0 80px -20px var(--accent-emerald-glow);
  border-color: var(--border-accent);
}
```

---

## Step 2 — Force dark mode as default for Wave 1.5 dashboards

The rich visual effects (glow, gradient mesh) are designed for dark mode. Light mode dashboards will be a Wave 2 polish pass.

In `frontend/src/App.tsx` or wherever `<ThemeProvider>` is mounted, change the default:

```tsx
<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
```

(Was probably `defaultTheme="light"` in Phase 0. Change to `"dark"`.)

Add a warning note in `_progress.md` that this is a Wave 1.5 constraint to be relaxed in Wave 2.

---

## Step 3 — Install framer-motion

```bash
cd frontend
npm install framer-motion
```

This is used by several 21st.dev components and gives us parallax + animated charts.

---

## Step 4 — Add the useCountUp hook

Create `frontend/src/hooks/useCountUp.ts`:

```ts
import { useEffect, useState } from 'react'

export function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (target === 0) {
      setValue(0)
      return
    }
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setValue(target * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}

// Helper formatters
export const fmt = {
  currency: (v: number, currency = '₴') => {
    if (v >= 1_000_000) return `${currency}${(v / 1_000_000).toFixed(2)}M`
    if (v >= 1_000) return `${currency}${(v / 1_000).toFixed(1)}K`
    return `${currency}${v.toFixed(0)}`
  },
  percent: (v: number, decimals = 1) => `${v.toFixed(decimals)}%`,
  number: (v: number) => new Intl.NumberFormat('uk-UA').format(Math.round(v)),
  decimal: (v: number, decimals = 2) => v.toFixed(decimals),
}
```

---

## Step 5 — Verify

```bash
cd frontend
npm run build 2>&1 | tail -10
```

Should pass without errors. Tokens should be available via CSS vars.

---

## Acceptance criteria

- [ ] All Wave 1.5 tokens added to tokens.css
- [ ] `gradient-mesh-default`, `-finance`, `-fields` utility classes work
- [ ] `noise-overlay` utility class works
- [ ] `skeleton-shimmer` keyframes + class work
- [ ] `card-hoverable` class works
- [ ] `framer-motion` installed
- [ ] `useCountUp` hook created with `fmt` helpers
- [ ] Default theme = dark
- [ ] Existing Phase 0 tokens still intact (don't remove)
- [ ] `npm run build` passes

---

## Git

```bash
git add frontend/src/styles/tokens.css \
        frontend/src/hooks/useCountUp.ts \
        frontend/src/App.tsx \
        frontend/package.json frontend/package-lock.json

git commit -m "style(tokens): Wave 1.5 aesthetic foundation

- new tokens: bg-*, fg-*, accent-{emerald,blue,purple,amber,pink,cyan}-*
- culture color palette matching agri conventions
- gradient mesh utility classes (default, finance, fields)
- noise overlay utility
- shimmer skeleton keyframes + class
- card-hoverable hover-glow class
- useCountUp hook + fmt helpers
- framer-motion installed
- default theme: dark

Task: wave-1-5/task-00"
git push
```

Append entry to `_progress.md`.
