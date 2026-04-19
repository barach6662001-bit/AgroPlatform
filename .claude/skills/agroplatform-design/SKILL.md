---
name: AgroPlatform Design System
description: Ukrainian-language farm management SaaS — "Command Center" navy dashboard + brand green accent, Inter typography, Lucide iconography. Use when designing anything for AgroPlatform / AgroTech (fields, operations, warehouse, grain storage, machinery, HR, finance, reports).
---

# AgroPlatform Design System

AgroPlatform (AgroTech) is a **Ukrainian-language** multi-tenant farm management platform. The default language is **uk**, English is secondary. Copywriting is professional and operational — no marketing hype, no emoji in product UI.

## 1. Core visual vocabulary

- **Default theme: dark navy "Command Center".** Stack: `#060B14` page → `#0C1222` surface → `#111A2E` elevated → `#1A2540` hover.
- **Single brand accent: green `#22C55E`.** Use sparingly — primary button, active nav item, link, success, positive KPI, key charts, focus ring. Never decorative.
- **Light theme** swaps navy for `#fafafa / #ffffff` and brand to `#16A34A` for AA contrast.
- Text is **alpha on white**: `92% / 55% / 35% / 20%` (primary / secondary / tertiary / disabled). Never pure white.
- Borders are hairlines in white alpha: `6% / 12% / 20%`. No solid greys.

## 2. Typography (Inter + JetBrains Mono)

- **Inter** everywhere. Weights 400 / 450 / 500 / 600 / 700 / 800. Load from Google Fonts.
- **JetBrains Mono** for code / API / technical values / kbd only.
- **Tabular-nums always** (`font-variant-numeric: tabular-nums`). Numbers never jitter in tables.
- **UI default is 13–14px** — this app is information-dense by design.
- **Uppercase small-caps labels**: `11px / 500 / letter-spacing: 0.06em` — table headers, KPI labels.
- **Page title**: 22px / 600 / `-0.01em`. **KPI value**: 28–32px / 600 / `-0.02em`.

## 3. Spacing, radius, shadow

- **4px base grid**. Primary tokens: 4 / 8 / 12 / 16 / 20 / 24 / 32px.
- **Radii**: 8px (buttons, inputs), 12px (cards), 16px (modals, feature cards), pill for badges.
- **Cards**: `rgba(255,255,255,0.03)` fill + 1px border at 6% white + 12px radius, 16–20px inner padding.
- **Shadows are subtle in dark mode.** Cards have no shadow at rest; lift 1px and gain shadow-md on hover.
- **Primary button glows** on hover: `0 0 20px rgba(34,197,94,0.25)`.

## 4. Button rules

- **Primary**: `linear-gradient(180deg, #22C55E, #16A34A)` + black text + 600 weight + 8px radius + 36px height.
- **Ghost**: `rgba(255,255,255,0.06)` bg + `rgba(255,255,255,0.20)` border + white text.
- **Text**: transparent; hover changes color only.
- **Danger**: `rgba(239,68,68,0.12)` bg + red border + red text.
- **Hover**: lift `translateY(-0.5px)` + brightness 1.1. **Press**: `scale(0.98)`. 150ms ease transitions.

## 5. Iconography

- **Lucide** everywhere. `strokeWidth={1.5}`, `size={14–18}`, `color: currentColor`.
- **Zero emoji** in product UI (toasts, tags, tooltips, buttons). None. Ever.
- Icons share a baseline with their label — never standalone decoration.

## 6. Language + copy rules

- **Ukrainian first.** Core vocabulary: Склад, Поле, Агрооперація, Техніка, Зерносховище, Сівозміна, Урожайність, Наробіток.
- **Sentence case for ALL labels**, both UK and EN: "Створити склад", "Create warehouse" — never "Create Warehouse".
- **Verb-first imperatives**: "Призначити культуру", "Записати наробіток".
- **No exclamation marks** in product UI. Save them for landing.
- **No emoji** anywhere except the GitHub README.
- **Ukrainian number format**: space-separated thousands, comma decimal — `1 234 567,89`.
- **Currency**: `1 250 000 ₴` (space before ₴).
- **Area**: `га` (hectares).

## 7. Tables (dense, hairline)

- Header: 11px / 500 / uppercase / letter-spacing 0.06em / tertiary text color.
- Row: 13px / 12×16px padding / 4% white bottom border / 3% white hover bg.
- Wrapper has 1px border + 12px radius; rows themselves have NO radius.
- All numeric columns right-aligned with tabular-nums.

## 8. Layout chrome (web)

- **Sidebar**: 232px. Logo header with subtle green→transparent gradient accent on its bottom border. Active nav item = green bg at 12% + green text + 2px left indicator bar.
- **Topbar**: 52px, sticky, `backdrop-filter: blur(12px)` + `rgba(6,11,20,0.85)`.
- **Page area**: 22px 24px padding.
- Only the topbar uses glassmorphism. Dropdowns and popovers are opaque.

## 9. Semantic color scales

- Success `#22C55E` · Warning `#F59E0B` · Error `#EF4444` · Info `#3B82F6`.
- Each has 6–8% bg variant for tag/alert fills; 20–30% for borders.

## 10. Crop palette (domain)

Data-bound, not decorative. Use as soft tag (15% bg + full text + 30% border):

- Wheat `#FBBF24` · Sunflower `#F97316` · Corn `#22C55E` · Rapeseed `#A855F7` · Barley `#0EA5E9` · Soy `#14B8A6` · Fallow `#94A3B8`.

## 11. Charts (Recharts order)

`#22C55E → #3B82F6 → #F59E0B → #A855F7 → #14B8A6 → #F97316 → #EC4899 → #0EA5E9`.

## 12. Usage — the fast path

```html
<link rel="stylesheet" href="colors_and_type.css">
<!-- dark theme is default on :root; for light add: -->
<html data-theme="light">
```

All tokens live on `:root` as CSS variables (`--brand`, `--bg-page`, `--text-primary`, `--space-4`, `--radius-lg`, `--shadow-md`, etc.). Import the CSS file and reference variables — don't copy hex codes inline.

**Semantic classes** provided: `.h1 / .h2 / .h3`, `.display`, `.page-title`, `.subtitle`, `.caption`, `.label-text` (uppercase small-caps), `.kpi-value`, `.kpi-value-hero`, `.form-label`. For numbers, add `font-variant-numeric: tabular-nums` or inherit from `body`.

## 13. Do not

- Do not introduce a second brand accent color.
- Do not use emoji in product UI.
- Do not use Title Case labels — sentence case only.
- Do not write numbers with commas for thousands (it's a space in Ukrainian).
- Do not drop glassmorphism / blur outside the topbar.
- Do not add drop shadows to cards at rest in dark mode.
- Do not use pure white (`#fff`) for body text — use 92% alpha.
- Do not render crop tags in grey — use the crop's specific color.

## 14. Files in this system

- `README.md` — full brand brief, content + visual foundations, iconography
- `colors_and_type.css` — all tokens + semantic classes (single file, import anywhere)
- `assets/` — logos + favicon (SVG)
- `ui_kits/web/` — four full React web screens (login, dashboard, fields, operation)
- `ui_kits/mobile/` — five mobile screens (dashboard, ops, warehouse, grain, more)
- `preview/` — design-system card previews
- `source/` — raw imported repo files (reference only)
