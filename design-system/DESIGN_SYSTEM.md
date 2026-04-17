# AgroPlatform Design System v1.0

**Target:** Palantir / Retool — data-dense enterprise.
**Stack:** shadcn/ui + Radix + Tailwind + IBM Plex.
**Audience:** CompanyAdmin / Manager / WarehouseOperator / Accountant / Viewer + investors.

This document is the **single source of truth** for visual decisions.
If code disagrees with this doc, the doc wins and code must be changed.

---

## 1. Philosophy

1. **Density over decoration.** Every pixel earns its place. No decorative gradients, no hero illustrations in the operational UI, no oversized padding.
2. **Data is king.** Tables, metrics, dashboards, ledgers — the UI serves the data, not the other way around.
3. **Neutral-first.** 95% of the interface is greyscale. Color is reserved for meaning (status, accent, alerts).
4. **Quiet confidence.** The product should feel like serious enterprise software, not a consumer app with animations.
5. **Fast at rest.** No entrance animations on route change. No fades. No floating. Motion only when it aids understanding (expanding a row, opening a dialog).

---

## 2. Color Tokens

All colors defined as HSL CSS custom properties for runtime theming. Tailwind consumes via `hsl(var(--token) / <alpha-value>)`.

### 2.1 Neutrals (foundation — 95% of UI)

Scale: cool-leaning zinc. Produces a serious, clinical feel vs warm stone (farmhouse-adjacent, avoided).

| Token | Light HSL | Dark HSL | Use |
|---|---|---|---|
| `--color-bg-base` | `240 10% 100%` | `240 10% 6%` | Page background |
| `--color-bg-subtle` | `240 10% 98%` | `240 10% 8%` | Sidebar, alt rows |
| `--color-bg-muted` | `240 5% 96%` | `240 8% 11%` | Cards, hover states |
| `--color-bg-elevated` | `240 10% 100%` | `240 8% 13%` | Dialogs, popovers |
| `--color-bg-inverse` | `240 6% 10%` | `0 0% 100%` | Tooltip bg, dark banners |
| `--color-border-subtle` | `240 6% 90%` | `240 6% 16%` | Card borders, table lines |
| `--color-border-default` | `240 5% 84%` | `240 5% 22%` | Inputs, dividers |
| `--color-border-strong` | `240 5% 65%` | `240 5% 40%` | Focus rings |
| `--color-text-primary` | `240 10% 9%` | `0 0% 96%` | Headings, body |
| `--color-text-secondary` | `240 5% 35%` | `240 5% 70%` | Labels, helper text |
| `--color-text-tertiary` | `240 4% 46%` | `240 4% 60%` | Placeholders, meta |
| `--color-text-disabled` | `240 5% 65%` | `240 5% 40%` | Disabled state |
| `--color-text-inverse` | `0 0% 100%` | `240 10% 9%` | Text on inverse bg |

### 2.2 Brand accent (agri-green, deep)

Single brand accent — deep emerald. Signals agri-context without being literal or cheap.

| Token | Light HSL | Dark HSL | Use |
|---|---|---|---|
| `--color-accent-subtle` | `152 76% 96%` | `161 60% 12%` | Selected row tint, badge bg |
| `--color-accent-muted` | `151 64% 89%` | `161 60% 16%` | Hover on accent-subtle |
| `--color-accent-default` | `158 64% 52%` | `158 64% 45%` | Accent borders, links |
| `--color-accent-solid` | `161 94% 24%` | `158 64% 42%` | **Primary button bg**, logo |
| `--color-accent-strong` | `162 94% 17%` | `158 64% 36%` | Primary button hover |
| `--color-accent-fg` | `0 0% 100%` | `0 0% 100%` | Text on accent-solid |

**Rule:** Accent appears at MOST 2–3 times per screen. If more, you are overusing it.

### 2.3 Semantic (muted, not vivid)

Semantic colors are **desaturated** vs default Tailwind. Bright red/green look like a toy; muted reads as professional.

| Intent | Subtle bg | Solid bg | Solid fg | Where |
|---|---|---|---|---|
| Success | `152 76% 96%` | `142 72% 29%` | white | Completed statuses, positive deltas |
| Warning | `48 100% 96%` | `32 95% 44%` | white | Pending, low stock, attention |
| Danger | `0 86% 97%` | `0 74% 42%` | white | Errors, destructive, overdrawn |
| Info | `214 95% 93%` | `217 91% 40%` | white | Neutral info, calibration |

### 2.4 Data visualization palette

For charts, distinct hues, all similar luminance so none screams louder than others:

```
chart-1: 161 94% 24%  (accent emerald)
chart-2: 217 91% 40%  (blue)
chart-3: 262 52% 47%  (violet)
chart-4: 32 95% 44%   (amber)
chart-5: 340 75% 45%  (rose)
chart-6: 190 80% 36%  (cyan)
chart-7: 24 60% 42%   (brown — soil reference)
chart-8: 240 5% 35%   (neutral)
```

Never use pure `#ff0000`, `#00ff00`, etc.

---

## 3. Typography

### 3.1 Font stack

```css
--font-sans: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI',
             system-ui, sans-serif;
--font-mono: 'IBM Plex Mono', 'SF Mono', Consolas, Menlo, monospace;
```

IBM Plex self-hosted via `@fontsource/ibm-plex-sans` and `@fontsource/ibm-plex-mono`. No Google Fonts CDN (GDPR + perf).

Weights loaded: **400 (regular), 500 (medium), 600 (semibold), 700 (bold)**. No other weights.

### 3.2 Size scale (DENSE base — 13px, not 16px)

Enterprise data-heavy UIs use 13px body. 16px creates too much vertical space.

| Token | Size | Line-height | Use |
|---|---|---|---|
| `text-2xs` | 10px | 1.25 | Chart axis labels, hints |
| `text-xs` | 11px | 1.25 | Table meta, badges |
| `text-sm` | 12px | 1.25 | Dense tables, form hints |
| `text-base` | **13px** | 1.45 | **Body default** |
| `text-md` | 14px | 1.45 | Form inputs, comfortable body |
| `text-lg` | 16px | 1.45 | Subsection titles |
| `text-xl` | 18px | 1.45 | Card titles |
| `text-2xl` | 22px | 1.25 | Page sections |
| `text-3xl` | 28px | 1.25 | Page H1 |
| `text-4xl` | 36px | 1.25 | Landing hero only |

### 3.3 Usage rules

- **Numbers in tables:** always `font-mono` + `tabular-nums`. Aligns decimals.
- **IDs, hashes, codes:** always `font-mono`.
- **Body copy:** `font-sans`, weight 400.
- **Labels:** weight 500, uppercase **only** if ≤ 11px and tracked (+0.04em).
- **Headings:** weight 600. Never 700 in operational UI (bold is visual noise).
- **Never:** italic for emphasis. Use weight instead.

---

## 4. Spacing

Standard 4px grid via Tailwind (`space-1` = 4px, `space-2` = 8px, etc).

**Density defaults:**

| Surface | Padding | Gap |
|---|---|---|
| Page container | `px-6 py-5` | — |
| Card | `p-4` | `space-y-3` |
| Table row | `px-3 py-2` (compact) | — |
| Form field | `py-1.5 px-3` | `space-y-1.5` |
| Button (md) | `h-8 px-3` | — |
| Sidebar item | `h-8 px-3` | — |

---

## 5. Border radius

**Small radii only.** Large radii (`rounded-xl`, `rounded-2xl`) kill enterprise feel.

```css
--radius-sm: 2px;   /* badges, tags, pills for data */
--radius-md: 4px;   /* DEFAULT — buttons, inputs, cards */
--radius-lg: 6px;   /* dialogs, popovers, sheets */
--radius-pill: 9999px; /* status dots, avatars */
```

Tailwind default `rounded` aliased to 4px. Never use `rounded-full` on buttons or cards.

---

## 6. Elevation

Three levels only. Prefer **borders** over shadows.

```css
--shadow-flat: none;                          /* most surfaces */
--shadow-elevated: inset 0 0 0 1px hsl(var(--color-border-subtle));
                                              /* cards — border, no shadow */
--shadow-overlay: 0 4px 16px -4px rgb(0 0 0 / 0.08),
                  0 1px 2px rgb(0 0 0 / 0.04),
                  inset 0 0 0 1px hsl(var(--color-border-subtle));
                                              /* dialogs, popovers */
```

No `shadow-lg`, no `shadow-xl`, no `shadow-2xl` anywhere except the overlay layer. Floating cards with soft shadows are a consumer-app tell.

---

## 7. Density & sizing

Two modes, compact default:

| Control | Compact (default) | Comfortable |
|---|---|---|
| Input height | 30px | 36px |
| Button md | 30px | 36px |
| Table row | 28px | 36px |
| Sidebar item | 28px | 32px |
| Icon sm | 14px | 16px |

Toggle persisted in user preferences (Zustand → localStorage). Compact is required for accountants and warehouse operators who need 20+ rows visible at once.

---

## 8. Motion

Motion is **functional only**. Allowed durations:

- **100ms** — hover, focus, small state
- **150ms** — dropdown open, toast in
- **200ms** — dialog open, sheet slide
- **Never > 250ms** except loading states

Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo, crisp) or `ease-out`.

**Forbidden:**
- Route transitions (instant)
- Fade-in on page load
- Scroll-triggered animations
- Parallax
- Entrance animations for lists (they already feel slow with real data)

---

## 9. Icons

**Lucide React.** Single icon set. Line-style, 1.5px stroke.

Sizes:
- `14px` — inline with `text-sm`
- `16px` — default, inline with `text-base/md`
- `18px` — sidebar items
- `20px` — page headers

Never use emoji as icons in the operational UI. Emoji is acceptable in onboarding/empty states only.

---

## 10. Data viz rules

- Line charts: 1.5px stroke, no markers unless data points < 12.
- Bar charts: 2px rounded top (`rx=2`), no 3D, no gradients.
- Gridlines: `--color-border-subtle`, 1px, dashed (4 4).
- Tooltips: elevated surface, monospaced numbers, no shadow glow.
- Legend: positioned top-right or below, never floating on the plot.
- Baseline always at 0 for bars. Exception documented in caption.

---

## 11. Accessibility floor

- Text contrast ≥ 4.5:1 body, ≥ 3:1 for ≥ 18px.
- Focus ring: `outline-2 outline-offset-2 outline-accent-solid`. Visible on all focusable controls.
- Keyboard: Tab order follows visual order. Sidebar navigable with arrow keys.
- `prefers-reduced-motion`: disables all transitions > 100ms.
- Interactive targets ≥ 24×24px (WCAG 2.2 minimum), ≥ 32×32px preferred.

---

## 12. What we are NOT doing (anti-patterns)

- ❌ Gradients anywhere except data viz (and even then, sparingly)
- ❌ Glassmorphism / frosted blur
- ❌ Neumorphism
- ❌ Rounded-2xl cards
- ❌ Large drop shadows
- ❌ Emoji in navigation
- ❌ AI-generated hero illustrations
- ❌ Animated gradients on CTA buttons
- ❌ Bright accent colors (#00ff00, #ff0066, etc.)
- ❌ Playful micro-copy in operational UI ("Oopsie!", "Let's go!")
- ❌ Marketing-site polish inside the product

---

## 13. Version policy

This document is versioned. Changes require a design review and bump.

- **v1.0** (current) — initial Palantir/Retool baseline.
- Every token change → migration note in `MIGRATION_PLAN.md`.
