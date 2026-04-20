---
name: AgroPlatform Design System
description: Ukrainian-language farm management SaaS, 21st.dev dark-premium aesthetic — black canvas with radial accent glow, Geist typography, single living accent. Use when designing anything for AgroPlatform / AgroTech (fields, operations, warehouse, grain storage, machinery, HR, finance, reports).
---

# AgroPlatform Design System

AgroPlatform (AgroTech) is a **Ukrainian-language** multi-tenant farm management platform. Default language is **uk**, English is secondary. Copy is professional and operational — no marketing hype, no emoji in product UI.

The visual direction is **21st Dark Premium**: black canvas, subtle radial accent glow, Geist typography, gradient white-to-60%-white headings, single living accent. Aesthetic cousins: Vercel, Linear, 21st.dev — translated for Ukrainian agriculture.

## 1. Core visual vocabulary

- **Default theme: dark, near-black canvas.** Stack: `#0a0a0a` page → `#101010` elevated-1 (cards) → `#161616` elevated-2 (popovers) → `#1c1c1c` hover.
- **Radial glow backdrop is the signature.** Two soft ellipses of accent at `10%` / `6%` opacity, one from the top-center, one from bottom-left. Never pure flat black — always that ambient bloom. Paint it via `.canvas` / `--bg-glow`.
- **Single living accent: green `#22C55E`.** Exposed as `--acc` / `--accRgb`. Can be toggled to violet / blue / mono via `data-acc` on `<html>`. Used sparingly — primary button, active nav, link, success, positive KPI, focus ring. Never decorative.
- **Text is alpha on white**: `94% / 58% / 38% / 20%` (primary / secondary / tertiary / disabled). Never pure white.
- **Borders are hairlines in white alpha**: `8% / 14% / 22%`. No solid greys.
- **Light theme** swaps canvas for `#fafafa / #ffffff` and accent to `#16A34A` for AA contrast.

## 2. Typography (Geist + Geist Mono)

- **Geist** everywhere (UI, marketing, dashboards). Weights 400 / 500 / 600 / 700. Loaded from Google Fonts.
- **Geist Mono** for data, code, API values, eyebrow labels, meta text, table headers, kbd.
- **Tabular-nums always** (`font-variant-numeric: tabular-nums`). Numbers never jitter in tables.
- **UI default is 13–14px** — this app is information-dense by design.
- **Body letter-spacing is slightly negative** (`-0.005em`) — Geist is tight by design; lean into it.
- **Hero headings use a gradient**: `linear-gradient(180deg, #fff, rgba(255,255,255,0.6))` clipped to text. Use `.hero-title` (42px / 600 / `-0.035em`) or `.display`.
- **Eyebrow chip** sits above hero headings: pill border, 6px live accent dot with glow, Geist Mono 11px.
- **Uppercase meta labels** (Geist Mono): `11px / regular / letter-spacing: 0.04em` — table headers, KPI labels, form labels.
- **Page title**: 22px / 600 / `-0.02em`. **KPI value**: 28–32px / 600 / `-0.02em`. **Hero KPI**: 32–42px tinted with `--acc`.

## 3. Spacing, radius, shadow

- **4px base grid**. Primary tokens: 4 / 8 / 12 / 16 / 20 / 24 / 32px.
- **Radii**: 8px (buttons, inputs, menu items), 12px (cards, dropdowns), 14–16px (modals, hero cards), pill for badges and eyebrows.
- **Cards**: `#101010` fill (or `rgba(255,255,255,0.03)` overlay) + 1px border at 8% white + 12px radius, 16–20px inner padding. No shadow at rest.
- **Lift on hover**: `translateY(-1px)` + border-color → 14% white. Do not layer heavy drop shadows.
- **Primary button carries the glow** — not the cards. `0 0 20px rgba(var(--accRgb),0.25)` + inset 1px white at 20% for a subtle top highlight.

## 4. Button rules

- **Primary**: `linear-gradient(180deg, var(--acc), var(--acc2))` + black text + 600 weight + 8px radius + 32–40px height + accent glow + inset top-highlight. On mono accent, text stays black.
- **Ghost**: `rgba(255,255,255,0.03)` bg + 1px border at 8% white + primary text. Hover: bg → 6%.
- **Text**: transparent; hover changes color only, never background.
- **Danger**: `rgba(239,68,68,0.12)` bg + red border + red text.
- **Hover**: lift `translateY(-0.5px)` + brightness 1.08. **Press**: `scale(0.98)`. 150ms ease transitions — no bouncy springs.

## 5. Iconography

- **Lucide-style line icons**. `strokeWidth={1.5–1.6}`, `size={13–18}`, `color: currentColor`.
- **Zero emoji** in product UI. None. Ever.
- Icons share a baseline with their label — never standalone decoration.
- In-card "glyph cell" pattern: 28–34px rounded square at `rgba(var(--accRgb),0.12–0.18)`, accent-colored stroke icon centered.

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

- Header: Geist Mono 10–11px / uppercase / `letter-spacing: 0.06em` / tertiary text color.
- Row: 12–13px / 11×16px padding / 4% white bottom border / 2–3% white hover bg.
- Wrapper has 1px border + 12px radius; rows themselves have NO radius.
- All numeric columns right-aligned with tabular-nums in Geist Mono.

## 8. Layout chrome (web)

- **Sidebar**: 216px. Logo (accent-gradient A-mark). Inline `⌘K` search chip. Active nav item = 6% white bg + 4px accent dot at right with glow.
- **Topbar**: 52px, sticky, `backdrop-filter: blur(12px)` + `rgba(10,10,10,0.7)`. Breadcrumb path uses Geist Mono.
- **Page area**: 22–28px padding.
- **Canvas backdrop** (radial glow) lives on `<body>`; chrome sits inside with hairline dividers only.
- Only the topbar uses glassmorphism. Dropdowns and popovers are opaque `#161616` with 1px border.

## 9. Semantic color scales

- Success `#22C55E` · Warning `#F59E0B` · Error `#EF4444` · Info `#3B82F6`.
- Each has 6–8% bg variant for tag/alert fills; 20–30% for borders.

## 10. Crop palette (domain)

Data-bound, not decorative. Use as soft tag (12–18% bg + full text + 25–33% border):

- Wheat `#FBBF24` · Sunflower `#F97316` · Corn `#22C55E` · Rapeseed `#A855F7` · Barley `#0EA5E9` · Soy `#14B8A6` · Fallow `#94A3B8`.

## 11. Charts (series order)

`#22C55E → #3B82F6 → #F59E0B → #A855F7 → #14B8A6 → #F97316 → #EC4899 → #0EA5E9`.

- Area charts on black use a vertical gradient: accent `35%` at top to `0%` at baseline.
- Grid lines at 4% white, no axis strokes.
- Cost / comparison series: white at 30–45%, `strokeDasharray: "3 3"`.

## 12. Usage — the fast path

```html
<link rel="stylesheet" href="colors_and_type.css">
<html class="canvas"></html>                       <!-- paints the glow backdrop -->
<html data-theme="light">                          <!-- opt-in light -->
<html data-acc="violet">                           <!-- swap accent -->
```

All tokens live on `:root` as CSS variables (`--acc`, `--accRgb`, `--bg`, `--e1`, `--t`, `--tm`, `--td`, `--b`, `--b2`, `--space-4`, `--radius-lg`, `--shadow-glow`, etc.). Import the CSS file and reference variables — don't copy hex codes inline.

**Semantic classes** provided: `.h1 / .h2 / .h3`, `.hero-title`, `.display`, `.display-gradient`, `.eyebrow`, `.page-title`, `.subtitle`, `.caption`, `.label-text` (Geist Mono caps), `.form-label`, `.kpi-value`, `.kpi-value-hero`, `.canvas`. For numbers, add `font-variant-numeric: tabular-nums` or inherit from `body`.

## 13. Do not

- Do not paint the page in flat black — always include the radial glow.
- Do not introduce a second accent alongside the active one. One accent at a time.
- Do not use emoji in product UI.
- Do not use Title Case labels — sentence case only.
- Do not write numbers with commas for thousands (it's a space in Ukrainian).
- Do not drop glassmorphism / blur outside the topbar.
- Do not add heavy drop shadows to cards at rest — rely on the 1px hairline and the ambient glow.
- Do not use pure white (`#fff`) for body text — use 94% alpha.
- Do not render crop tags in grey — use the crop's specific color.
- Do not load Inter, Roboto, or system-ui as the UI face — Geist is the brand face.

## 14. Files in this system

- `README.md` — full brand brief, content + visual foundations, iconography
- `colors_and_type.css` — all tokens + semantic classes (single file, import anywhere)
- `assets/` — logos + favicon (SVG)
- `ui_kits/web/21st.html` — four full React web screens (login, dashboard, fields, operation) in 21st dark-premium
- `ui_kits/mobile/21st.html` — four mobile phone screens (dashboard, ops, field detail, grain) in 21st dark-premium
- `preview/` — design-system card previews
- `source/` — raw imported repo files (reference only)
