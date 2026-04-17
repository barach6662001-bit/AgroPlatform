# Task 14 — Final QA + open PR

## Context
Close the phase. Verify every acceptance criterion from every previous task, run the full test suite, confirm no regressions against `main`, open the PR.

## Dependencies
- task-00 through task-13 (all must be complete)

## Goal
Green checklist + PR opened against `main` with a description that references this phase.

## Steps

1. Run full QA sweep:

   ```bash
   # Lint — must pass
   npm run lint

   # TypeScript — must pass with zero errors (warnings ok if pre-existing)
   npx tsc --noEmit

   # Build — must succeed
   npm run build

   # Unit tests (if present) — must pass
   npm test 2>/dev/null || echo "no test script"

   # Dev server boot
   npm run dev &
   sleep 10
   curl -sf http://localhost:5173 > /dev/null && echo "dev ok"
   curl -sf http://localhost:5173/__design-system > /dev/null && echo "preview ok"
   kill %1 2>/dev/null || true
   ```

   Any failure → stop and fix, do not open the PR.

2. Visual QA. Open `/__design-system` in the browser. Check each:
   - [ ] Typography renders in IBM Plex Sans
   - [ ] Monospaced numbers use IBM Plex Mono + tabular
   - [ ] Primary button is deep emerald, not bright green
   - [ ] Border radius is 4px (not 8+px)
   - [ ] Card has border, no shadow
   - [ ] Dialog has subtle shadow, not dramatic drop shadow
   - [ ] Date picker months are in Ukrainian, week starts Monday
   - [ ] Theme toggle cycles light → dark → system, persists on reload
   - [ ] Badges use muted semantic colors, not vivid
   - [ ] Focus ring on tab key is emerald, visible, 2px

   If any visual is off → log as blocker, fix before PR.

3. Regression check. Visit legacy AntD screens — confirm nothing visually changed:
   - `/dashboard`
   - `/warehouses`
   - one finance screen
   - one form screen

   If any AntD screen now looks broken → likely a `tokens.css` override bleeding into AntD. Wrap AntD routes in `<ConfigProvider>` with default theme, or scope tokens.css under a parent selector.

4. Check bundle size:
   ```bash
   npm run build 2>&1 | tail -30
   ```
   Note the total size. Acceptable: main bundle +50–150KB from baseline (Tailwind runtime + shadcn + react-hook-form + zod + date-fns + tanstack-table). If much larger → investigate with `vite-bundle-visualizer` or equivalent.

5. Update `_progress.md` with task-14 entry marking Phase 0 complete.

6. Push final state:
   ```bash
   git add agents/phase-0/_progress.md
   git commit -m "chore(design-system): phase 0 complete — all primitives ready

   Task: phase-0/task-14"
   git push
   ```

7. Open PR via GitHub CLI (or platform UI):
   ```bash
   gh pr create \
     --base main \
     --head feat/design-system-foundation \
     --title "feat(design-system): Phase 0 — Palantir-grade foundation (shadcn + Tailwind + IBM Plex)" \
     --body-file agents/phase-0/_pr-description.md
   ```

   First create `agents/phase-0/_pr-description.md`:
   ```md
   # Phase 0 — Design System Foundation

   Replaces the in-app visual layer with a Palantir/Retool-grade design system
   built on shadcn/ui + Tailwind + IBM Plex.

   ## What changed

   - Installed Tailwind 3.4, shadcn/ui (new-york style, CSS variables), self-hosted IBM Plex Sans + Mono
   - Written canonical design tokens at `src/styles/tokens.css` (colors, typography, radii, elevation, density, motion)
   - Wired `tailwind.config.ts` to tokens via HSL CSS variables with alpha support
   - Installed 25+ shadcn primitives: button, input, card, badge, table, tabs, dialog, sheet, dropdown, popover, tooltip, sonner, form, checkbox, radio, switch, select, textarea, calendar, date-picker (+ custom range), avatar, skeleton, separator, progress, scroll-area
   - Built `DataTable` wrapper on TanStack Table
   - Built `DatePicker` / `DateRangePicker` with Ukrainian locale + `dd.MM.yyyy`
   - Dark mode via next-themes with persistence + system preference
   - `/__design-system` preview route renders every primitive for visual QA
   - ESLint rule blocks new `antd` imports; allowlist preserves legacy

   ## What did NOT change

   - No existing screen was touched. AntD continues to work on all current routes.
   - No backend changes.
   - No new API endpoints.

   ## Reference docs

   - `/design-system/DESIGN_SYSTEM.md` — visual law
   - `/design-system/MIGRATION_PLAN.md` — component mapping + migration strategy
   - `/agents/phase-0/AGENT_BRIEFING.md` — how this phase was executed

   ## Verification

   - [ ] `npm run lint` passes
   - [ ] `npm run build` passes
   - [ ] `/__design-system` renders all sections in light + dark
   - [ ] Legacy AntD screens unchanged (spot-checked: dashboard, warehouses)

   ## Next

   Wave 1 — migrate the app shell (Sidebar, Topbar, auth screens) to shadcn.
   ```

## Files
- Create: `agents/phase-0/_pr-description.md`
- Modify: `agents/phase-0/_progress.md`

## Acceptance Criteria
- [ ] All previous 14 tasks marked ✅ in `_progress.md`
- [ ] Lint, typecheck, build all green
- [ ] Preview route renders correctly in light and dark
- [ ] Legacy AntD screens visually unchanged
- [ ] PR opened against `main` with full description
- [ ] PR link reported back to user

## Verification Commands
```bash
npm run lint && npx tsc --noEmit && npm run build
cat agents/phase-0/_progress.md | grep -c '✅'   # expect 15
gh pr view --json url -q .url
```

## Git
Final commit already in step 6. PR opened in step 7.

## On completion

Report back with:
- PR URL
- Bundle size delta
- Any follow-ups discovered during QA (e.g., AntD overrides needed in ConfigProvider)
- Recommendation: proceed to Wave 1 (app shell migration) — ready agent tasks needed.
