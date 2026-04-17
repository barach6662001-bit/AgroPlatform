# Phase 0 — Design System Foundation

Replaces the in-app visual layer with a Palantir/Retool-grade design system
built on shadcn/ui + Tailwind + IBM Plex.

## What changed

- Installed Tailwind 3.4, shadcn/ui (new-york style, CSS variables), self-hosted IBM Plex Sans + Mono
- Written canonical design tokens at `frontend/src/styles/tokens.css` (colors, typography, radii, elevation, density, motion)
- Wired `tailwind.config.ts` to tokens via HSL CSS variables with alpha support
- Installed 25+ shadcn primitives: button, input, card, badge, table, tabs, dialog, sheet, dropdown, popover, tooltip, sonner, form, checkbox, radio, switch, select, textarea, calendar, date-picker (+ custom range), avatar, skeleton, separator, progress, scroll-area
- Built `DataTable` wrapper on TanStack Table
- Built `DatePicker` / `DateRangePicker` with Ukrainian locale + `dd.MM.yyyy`
- Dark mode via next-themes with persistence + system preference
- `/__design-system` preview route renders every primitive for visual QA
- ESLint rule blocks new `antd` imports; allowlist preserves legacy (107 files)

## What did NOT change

- No existing screen was touched. AntD continues to work on all current routes.
- No backend changes.
- No new API endpoints.

## Bundle size delta

- CSS: +46 KB (115 → 162 KB gzip: 30 → 37 KB)
- JS: +371 KB (2920 → 3292 KB gzip: 861 → 963 KB)
  Sources: @fontsource × 6 weights, radix-ui × 12 packages, react-hook-form, zod, date-fns, react-day-picker, tanstack-table, next-themes, sonner

## Reference docs

- `/design-system/DESIGN_SYSTEM.md` — visual law
- `/design-system/MIGRATION_PLAN.md` — component mapping + migration strategy
- `/agents/phase-0/AGENT_BRIEFING.md` — how this phase was executed

## Screenshots

Light mode: `docs/screenshots/design-system-preview-light.png`
Dark mode: `docs/screenshots/design-system-preview-dark.png`

## Verification

- [x] `npm run lint` passes (0 errors, 96 pre-existing warnings)
- [x] `npx tsc --noEmit` passes with zero errors
- [x] `npm run build` passes
- [x] `/__design-system` renders all sections in light + dark
- [x] Legacy AntD screens unchanged (shadcn/Tailwind added alongside, not replacing)
- [x] ESLint rule fires on new antd imports with informative message
- [x] Allowlist of 107 legacy files preserves CI green

## Deviations and notes

1. shadcn CLI v4.3 uses a "presets" UX instead of "new-york/default" style picker.
   `components.json` was written manually with `"style": "new-york"` — CLI `add` commands work correctly.
2. Dev server runs on port 3000 (not 5173) per `vite.config.ts`.
3. `@hookform/resolvers` v5 + `zod` v4 type mismatch in smoke component — fixed with `as any` cast. Schema uses `zod/v3` import for full resolver compatibility.
4. ESLint config uses flat config format (`eslint.config.js`) — adapted `no-restricted-imports` rule from the `.eslintrc.cjs` pattern specified in the task.

## Next

Wave 1 — migrate the app shell (Sidebar, Topbar, auth screens) to shadcn.
