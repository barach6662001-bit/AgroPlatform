# AgroPlatform Design System

**AgroTech / AgroPlatform** — a Ukrainian-language farm management SaaS (cloud "Command Center" for agricultural enterprises). It unifies warehouse, fields, agri-operations, machinery, grain storage, HR, sales, and economics in a single multi-tenant platform.

The brand voice is **professional, Ukrainian-first, utilitarian — built for agronomists and farm managers, not consumer marketing.** The visual language is a dark "Command Center" navy palette with a single confident green accent, plus a softer light theme for daytime / print.

---

## Source attribution

Built from **barach6662001-bit/AgroPlatform** (GitHub). All original artifacts were imported under `source/` — the design system files at the root are the curated, portable versions.

- **Web frontend**: React 18 + Vite + TypeScript + Ant Design 5, Zustand, Recharts, Leaflet
  → `source/frontend/` (theme, tokens, components, landing page)
- **Mobile**: Expo / React Native (tab shell with Dashboard, Operations, Warehouse, Grain, More)
  → `source/mobile/` (colors, spacing, typography)
- **Backend** (not visualized): .NET 8 / ASP.NET Core Web API, PostgreSQL + PostGIS, CQRS (MediatR)
- Primary language: **Ukrainian (uk)** — full translation in `source/frontend/src/i18n/uk.ts` (~77KB). English (`en.ts`) is the secondary locale.

---

## Index (root files)

| File | What it is |
|---|---|
| `README.md` | You are here — brand overview, content & visual foundations, iconography |
| `colors_and_type.css` | Single-file token + semantic class set. Import this anywhere. |
| `assets/` | Logos (A-mark, field-grid mark, horizontal lockups), favicon |
| `fonts/` | Reference file; fonts are loaded from Google Fonts CDN (see **Typography**) |
| `preview/` | Small HTML cards that populate the Design System tab |
| `ui_kits/web/` | React (Babel-in-browser) recreations of web app screens |
| `ui_kits/mobile/` | React recreations of the mobile tab shell |
| `source/` | Raw imported source files from the AgroPlatform repo (for reference) |
| `SKILL.md` | Skill manifest — portable to Claude Code |

---

## CONTENT FUNDAMENTALS

### Language
**Ukrainian (uk)** is the default and primary language. English is provided but always secondary. Terms of art are Ukrainian agricultural vocabulary — not translated literally from English SaaS:

- "Склад" (warehouse), "Поле" (field), "Агрооперація" (agri-op), "Техніка" (machinery), "Зерносховище" (grain storage), "Сівозміна" (crop rotation), "Урожайність" (yield), "Наробіток" (machine hours).

### Tone & casing
- **Professional, neutral, direct** — zero hype. This is operational software for working agronomists.
- **Sentence case** for UI labels and buttons: "Створити склад", "Додати ресурс" — never Title Case. English labels follow the same rule: "Create warehouse", not "Create Warehouse".
- **Formal "Ви" / "you"** used sparingly — most UI is imperative (verb-first): "Призначити культуру", "Записати наробіток".
- **No exclamation marks** in labels, tooltips, or empty states. Reserve them for marketing/landing only.
- **Consistent verbs**: "Створити / Оновити / Видалити" (create/update/delete) across all modules.

### Marketing voice (landing page only)
The landing page is warmer and more aspirational — still professional but with a modest emotional register:
- *"Розумне землеробство для сталого майбутнього"* (Smart farming for a sustainable future)
- *"Нам довіряють 10,000+ фермерів по всьому світу"* (Trusted by 10,000+ farmers worldwide)
- CTAs: "Спробувати безкоштовно", "Спробувати демо"
- Stat callouts: "10K+ активних господарств", "50M+ гектарів під управлінням", "+35% врожайність", "24/7 підтримка"

### Vibe
Think **Linear / Vercel dashboard crossed with Bloomberg terminal**, translated for Ukrainian agriculture. Dense data, restrained color, instant-feedback interactions, no emoji, no playful illustration. Every pixel earns its place.

### Emoji
**Never in product UI.** A single wheat emoji (🌾) appears in the GitHub README title — that's the only place. Emoji are not used in toasts, tags, tooltips, empty states, or buttons.

### Numbers & units
- **Ukrainian formatting**: space as thousands separator, comma as decimal — `1 234 567,89`
- **Currency**: Hryvnia (₴) as suffix with space — `1 250 000 ₴`
- **Area**: hectares — `га` suffix — `1 450 га`
- **Always tabular-nums** in tables and KPIs (`font-variant-numeric: tabular-nums`)
- Negative cost-record amount = revenue (business convention from source)

### Example copy
| Context | Copy |
|---|---|
| Login page title | `Ласкаво просимо` |
| Login subtitle | `Увійдіть у свій обліковий запис` |
| Submit button | `Увійти` |
| Empty state | `Немає записів` |
| Delete confirm | `Видалити запис?` |
| Dashboard KPI labels | `Загальна площа`, `Витрати за сезон`, `Виручка`, `Прибуток` |
| Success toast | `Запис створено` |
| Error toast | `Не вдалося зберегти. Спробуйте ще раз` |

---

## VISUAL FOUNDATIONS

### Palette — "Command Center" navy

The system ships **two themes**; dark is the default and the one the brand is built around.

**Dark** — deep navy stack (page → surface → elevated → hover)
- `#060B14` page · `#0C1222` surface · `#111A2E` elevated · `#1A2540` hover
- Text is **alpha on white**: `92% / 55% / 35% / 20%` — no pure-white text
- Borders are hairlines in white alpha: `6% / 12% / 20%` — no solid greys

**Brand green** — single accent, used *sparingly*
- `#22C55E` brand · `#16A34A` hover · `#15803D` active
- Used for: primary button, active nav item, link, success, positive KPI, key charts, focus ring

**Light theme** swaps the navy for a warm neutral stack (`#fafafa / #ffffff / #f5f5f5`) and shifts brand to `#16A34A` for AA contrast on white.

### Semantic colors
- Success `#22C55E` · Warning `#F59E0B` · Error `#EF4444` · Info `#3B82F6`
- Each has a 6–8% muted background variant for soft-fill tags and alerts

### Crop palette (domain-specific)
Used in map legends, field-list tags, rotation planning. **Not decorative** — data-bound.
- Wheat `#FBBF24` · Sunflower `#F97316` · Corn `#22C55E` · Rapeseed `#A855F7` · Barley `#0EA5E9` · Soy `#14B8A6` · Fallow `#94A3B8`
- Applied as soft tag: 15% bg · full text · 30% border

### Chart series (Recharts)
Ordered palette optimized for dark backgrounds:
`#22C55E → #3B82F6 → #F59E0B → #A855F7 → #14B8A6 → #F97316 → #EC4899 → #0EA5E9`

### Typography
- **Inter** — all UI, data, marketing. Weights 400 / 450 / 500 / 600 / 700 / 800.
- **JetBrains Mono** — inline code, keyboard hints, API keys, technical values only.
- **Tabular-nums everywhere** (`font-variant-numeric: tabular-nums`) — numbers never jitter in tables.
- **Default body: 13–14px** — the app is **information-dense by design**. Marketing pushes 15–19px for readability.
- **Page title 22px / 600 / letter-spacing -0.01em**. KPI values 28–32px / 600 / -0.02em.
- **Uppercase small-caps labels** (`.label-text`): 11px · 500 weight · `letter-spacing: 0.04em` — table headers, KPI labels.
- Never use system-ui generically; always explicitly name Inter first.
- **Flag**: we could not pull the original `.ttf`/`.woff2`; the system loads Inter and JetBrains Mono from **Google Fonts CDN** in `colors_and_type.css`. If the team wants self-hosted fonts, drop the files in `fonts/` and swap the `@import` for `@font-face` blocks.

### Spacing & grid
- **4px base grid**. Tokens: `--space-1..16` = 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64px.
- Standard card padding: **20–24px**. Dense table cells: **12px × 16px**.
- Standard gap between cards: **16–24px**. Grid-gutter on KPI rows: **16px**.

### Radii
- **8px** is the workhorse (buttons, inputs, menu items, small cards).
- **12px** for cards, pills, dropdowns. **16px** for modals, login card, feature cards.
- **9999px** pills used for status tags and badges.

### Backgrounds & texture
- **Flat navy surfaces**, no photo backgrounds in-app.
- **Landing only** uses animated radial gradients + floating blurred orbs (green `#22C55E @ 18%` and blue `#3B82F6 @ 14%`, 40–60px blur) + a 24px dot-pattern.
- Login page uses a subtle 24px radial dot-pattern `rgba(255,255,255,0.03)` — no photos.
- **No hand-drawn illustrations.** No grain textures. No noise overlays.

### Shadows
- Dark mode: shadows are subtle. `--shadow-sm/md/lg` combine a 1px inset white-alpha "border" with a drop-shadow.
- Cards typically have **no shadow at rest**; they lift 1px and gain shadow-md on hover.
- Primary button has a **green glow** on hover: `0 0 12px rgba(34,197,94,0.25)`.
- Light mode uses conventional grey shadows (`rgba(0,0,0,0.05 → 0.10)`).

### Borders vs. fills
- **Borders > fills** for quiet elements. Default button is "ghost": 6% bg + 20% border.
- **Primary button is a subtle 180° gradient** `#22C55E → #16A34A`, black text (#000).
- Focus ring: `3px rgba(34,197,94,0.1)` around a `#22C55E` border.

### Hover states
- Interactive items lift visually without moving layout:
  - **Card**: `translateY(-1px)` + shadow-md + `border-color: var(--border-hover)`
  - **Primary button**: `translateY(-0.5px)` + brightness 1.1 + green glow
  - **Menu item / row**: bg → `var(--bg-hover)` only (no lift)
- **Transition**: 120–200ms ease — fast. No bouncy springs.

### Press states
- Buttons: `transform: scale(0.98)`. No color change on press.

### Transparency & blur
- **Topbar** uses `backdrop-filter: blur(12px)` + `rgba(6,11,20,0.85)` — glassmorphism, but only there and the landing's login button.
- Popovers/dropdowns are **opaque** (`var(--bg-surface)`) with 1px border — no blur.
- Card backgrounds lean on `rgba(255,255,255,0.03)` layered over the navy, not solid `--bg-surface`.

### Animations
- **Fades and translateY**, never bounces or springs.
- Page transitions: `fadeInUp` 250ms ease (translateY 12→0).
- KPIs count up via react-countup (~800ms).
- Landing hero orbs: 5–9s `ease-in-out` float loops, pulse opacity 0.25↔0.55.
- Respect `prefers-reduced-motion` (inherited from Ant Design).

### Iconography pattern
- **Lucide React** icons everywhere. `strokeWidth={1.5}`, size 14–18px, `color: currentColor`.
- Icons sit at the same baseline as labels — never as standalone decoration.
- See **ICONOGRAPHY** section below.

### Tables
Dense, hairline-bordered, uppercase headers:
- Header: 11px / 500 / uppercase / `letter-spacing: 0.06em` / `color: var(--text-tertiary)`
- Row: 13px / 12×16px padding / bottom-border hairline at 4% white / hover bg at 3% white
- Container has 1px border + 12px radius; rows do **not** have their own border-radius.

### Layout rules (fixed elements)
- **Sidebar**: 240px wide, collapsible to 64px, full-height. Always on top-left on desktop. Border-right hairline.
- **Topbar**: 52px tall, sticky, blurred. Contains: breadcrumbs + global search + notification bell + lang + theme + user.
- **Page area**: `padding: 24px 28px` desktop, `16px` mobile.
- **Sidebar nav logo header**: 14px padding + 1px bottom border with a **green-to-transparent gradient accent** (signature touch).

### Imagery
- **Map-centric** — Leaflet maps of fields (cadastre + NDVI tiles). These ARE the imagery.
- No stock photos. No hero photos. No farmer portraits.
- Satellite/NDVI imagery colorized in greens and ochres — never over-saturated.

---

## ICONOGRAPHY

### System
- **Lucide React** (`lucide-react` package, stroke-based, 24px viewBox, customizable weight).
- Default usage: `<Icon size={16} strokeWidth={1.5} />`. Occasionally `size={14}` in dense tables and `size={22}` in marketing feature cards.
- **Color = `currentColor`** — icons inherit the label's text color. Active nav items get `var(--brand)` via the parent.

### No emoji, no unicode glyphs
The app contains zero emoji and no unicode pictographic characters (★, ✓, etc.). All visual marks are either Lucide icons, SVG logos, or CSS-drawn dots/rings.

### Icon inventory (seen in source)
- **Nav**: `LayoutDashboard`, `Map`, `Factory`, `Warehouse`, `Users`, `Banknote`, `BarChart3`, `Settings`
- **Forms**: `User`, `Lock`, `Mail`, `Search`, `Filter`, `X`, `Plus`, `ChevronDown`, `ChevronRight`, `ArrowRight`
- **Domain**: `Wheat`, `Sprout`, `Droplets`, `Sun`, `Fuel`, `Clipboard`, `Receipt`, `Tractor` (via `Factory`)
- **Auth / UX**: `LogIn`, `LogOut`, `Bell`, `Moon`, `Sun`

### Logos
- **A-mark** (`assets/logo-a-mark.svg`) — green rounded square with a stylized "A" letterform and three descending data-bars underneath. Primary app mark (top-left of sidebar).
- **Field-grid mark** (`assets/logo-field-grid.svg`) — navy-square variant with a 3×3 plot-of-fields grid in green opacities. Used in favicon and as a decorative/alternate mark.
- **Horizontal lockup** (`assets/logo-horizontal-{dark,light}.svg`) — A-mark + "AgroTech" wordmark (Tech in green) + "FARM MANAGEMENT" small-caps tagline.
- The in-app `Logo` React component splits brand name at `Тех` / `Tech` and colors the suffix in `--brand` — preserve this behavior.

### Distribution
- SVG everywhere. No PNG icons in the web app. (Mobile ships PNG launcher/adaptive icons; not reproduced here.)
- No icon font. No sprite sheet. All SVGs are inline or imported as components.

---

## What's in this design system

| Tab | Where |
|---|---|
| Design System cards | `preview/*.html` — register_assets scatter-chart of tokens, type, components |
| Web UI kit | `ui_kits/web/index.html` — Login, Dashboard, Fields list, Operation detail |
| Mobile UI kit | `ui_kits/mobile/index.html` — Tab shell (Dashboard / Operations / Warehouse / Grain / More) |
| SKILL.md | Portable skill manifest |

### Known gaps & flags
- **Fonts not self-hosted** — CDN-loaded via Google Fonts. Drop `.woff2` files in `fonts/` to go offline.
- **Icon set not vendored** — relies on Lucide CDN. Swap in the `lucide-react` package for production code.
- **Mobile icons** (launcher / splash PNGs in source) are referenced but not copied — they are tokenized binaries from GitHub.
- Some screens (satellite NDVI, fleet map, crop rotation advisor) are represented by components only — full interactive recreations would require the Leaflet tiles and API.
