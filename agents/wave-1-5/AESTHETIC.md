# Wave 1.5 Aesthetic — The Visual Language

**Goal:** "2026 YC-grade SaaS product" — richer than Linear, more expressive than Vercel, functional like Palantir.

---

## Color palette (adjust tokens.css to these)

### Backgrounds
```css
--bg-deep: #0A0A0B;        /* main dashboard bg — near-black with slight warmth */
--bg-surface: #111113;      /* cards */
--bg-elevated: #17171A;     /* elevated popover/modal */
--bg-subtle: #1C1C20;       /* muted sections */
```

### Text
```css
--fg-primary: #F5F5F7;      /* headings, big numbers */
--fg-secondary: #A1A1AA;    /* body text */
--fg-tertiary: #52525B;     /* hints, metadata */
--fg-quaternary: #27272A;   /* decorative separators */
```

### Accents
Primary green (agri-grade but not "farm co-op"):
```css
--accent-emerald-50: #ECFDF5;
--accent-emerald-400: #34D399;
--accent-emerald-500: #10B981;    /* main accent */
--accent-emerald-600: #059669;
--accent-emerald-glow: rgba(16, 185, 129, 0.25);
```

Secondary accents (use sparingly for multi-color KPIs, matches SAS Agro culture-colors):
```css
--accent-blue-500: #3B82F6;        --accent-blue-glow: rgba(59, 130, 246, 0.25);
--accent-purple-500: #A855F7;      --accent-purple-glow: rgba(168, 85, 247, 0.25);
--accent-amber-500: #F59E0B;       --accent-amber-glow: rgba(245, 158, 11, 0.25);
--accent-pink-500: #EC4899;        --accent-pink-glow: rgba(236, 72, 153, 0.25);
--accent-cyan-500: #06B6D4;        --accent-cyan-glow: rgba(6, 182, 212, 0.25);
```

### Culture colors (matching agri conventions)
```css
--culture-sunflower: #F59E0B;      /* Соняшник — amber */
--culture-wheat: #EAB308;          /* Пшениця — yellow */
--culture-corn: #3B82F6;           /* Кукурудза — blue */
--culture-rapeseed: #EC4899;       /* Ріпак — pink */
--culture-soy: #10B981;            /* Соя — green */
--culture-peas: #A855F7;           /* Горох — purple */
--culture-empty: #52525B;          /* Без культури — gray */
```

### Semantic
```css
--success: #10B981;
--warning: #F59E0B;
--danger: #EF4444;
--info: #3B82F6;
```

### Borders
```css
--border-subtle: rgba(255, 255, 255, 0.05);
--border-default: rgba(255, 255, 255, 0.08);
--border-strong: rgba(255, 255, 255, 0.12);
--border-accent: rgba(16, 185, 129, 0.3);   /* on hover of important elements */
```

---

## Gradient mesh backgrounds

Every main page area (not the sidebar/topbar) has a subtle gradient mesh background. Three overlapping radial gradients + noise.

```css
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
```

### Noise texture overlay
Apply over every gradient mesh for film grain feel:

```css
.noise-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.015;
  mix-blend-mode: overlay;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

---

## Typography

Keep IBM Plex from Phase 0 but with proper scale:

```css
/* Hero KPI values */
.text-kpi-hero {
  font-size: 2rem;          /* 32px */
  font-weight: 600;
  letter-spacing: -0.02em;
  font-feature-settings: "tnum";  /* tabular numbers */
  color: var(--fg-primary);
}

/* Section titles */
.text-section-title {
  font-size: 1.125rem;      /* 18px */
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--fg-primary);
}

/* Labels above numbers */
.text-kpi-label {
  font-size: 0.6875rem;     /* 11px */
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fg-tertiary);
}

/* Body */
.text-body {
  font-size: 0.875rem;      /* 14px */
  font-weight: 400;
  color: var(--fg-secondary);
}

/* Meta */
.text-meta {
  font-size: 0.75rem;       /* 12px */
  color: var(--fg-tertiary);
}
```

Use `font-feature-settings: "tnum"` for ALL numeric values — stops digit width jitter during count-up animations.

---

## Shadows / glow

```css
/* Soft glow around KPI cards */
--shadow-kpi: 0 0 0 1px rgba(255,255,255,0.02), 0 0 60px -20px var(--accent-emerald-glow);

/* Elevated card */
--shadow-card: 0 4px 24px -8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);

/* Popover */
--shadow-popover: 0 8px 32px -8px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08);

/* Glow ring on focus */
--shadow-focus: 0 0 0 2px var(--bg-deep), 0 0 0 4px var(--accent-emerald-500);
```

---

## Animations

Every visual element must feel alive. Mandatory patterns:

### Count-up on mount (ALL numbers)

```tsx
function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)  // easeOutExpo
      setValue(target * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}
```

### Card hover — glow intensify

```css
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

### Gradient accent border — shimmer on hover

Top 1px of card has a gradient that gets brighter on hover:

```tsx
<div className="absolute inset-x-0 top-0 h-px opacity-60 transition-opacity duration-500 group-hover:opacity-100"
     style={{ background: `linear-gradient(90deg, transparent, var(--accent-emerald-500), transparent)` }}
/>
```

### Pulse dot (status indicators)

```tsx
<span className="relative flex h-2 w-2">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
</span>
```

### Parallax on scroll (hero sections)

Use Framer Motion `useScroll` + `useTransform`:

```tsx
const { scrollY } = useScroll()
const y = useTransform(scrollY, [0, 300], [0, -50])
return <motion.div style={{ y }}>...</motion.div>
```

### Shimmer skeleton loading

Replace all basic Skeleton components with shimmer-animated ones:

```css
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
```

---

## Layout rhythm

- Main content max-width: **1600px** (not 1280px — we want data density on large displays)
- Padding: **24px** on small, **32px** on xl
- Section gap: **32px**
- Card gap in grids: **16px**
- Card inner padding: **20px** (not 24 — more compact for density)
- Border radius: **12px** for cards, **8px** for buttons/inputs, **16px** for hero sections

---

## Iconography

Use `lucide-react` (already installed). Icons always inside a 36x36 tinted container for KPI cards:

```tsx
<div className="flex h-9 w-9 items-center justify-center rounded-lg"
     style={{ background: `var(--accent-emerald-500)15`, color: `var(--accent-emerald-500)` }}>
  <Leaf className="h-4 w-4" />
</div>
```

---

## Don'ts

- ❌ No plain `#1a1a1a` flat backgrounds — always gradient mesh
- ❌ No hardcoded hex colors in components — use CSS variables from above
- ❌ No static numbers — always `useCountUp`
- ❌ No cards without hover state
- ❌ No flat borders — use gradients or accent colors
- ❌ No `font-weight: 400` for numbers — always 500 or 600
- ❌ No numbers without `tabular-nums` / `font-feature-settings: "tnum"`
- ❌ No page without at least one gradient accent somewhere
