# DESIGN — Full Premium Redesign (Execute All Phases)

> This is the orchestration task. Execute all 8 phases sequentially.
> Reference `docs/design-system.md` for full design context throughout.
> After each phase: run verification, delete the completed task file, commit, and proceed.
> Do NOT ask for confirmation at any step.

---

## Execution Order

### Phase 1: Design System Foundation
Read and execute `docs/tasks/DESIGN-P1-tokens.md`.
After completion:
```bash
cd frontend && npx tsc --noEmit && npm run build
rm docs/tasks/DESIGN-P1-tokens.md
git add -A && git commit -m "feat(ui): Phase 1 — design tokens, theme, global CSS overrides"
```

---

### Phase 2: Component Overhaul
Read and execute `docs/tasks/DESIGN-P2-components.md`.
After completion:
```bash
cd frontend && npx tsc --noEmit && npm run build
rm docs/tasks/DESIGN-P2-components.md
git add -A && git commit -m "feat(ui): Phase 2 — KpiCard, DataTable, StatusBadge, EmptyState components"
```

---

### Phase 3: Sidebar & Header
Read and execute `docs/tasks/DESIGN-P3-navigation.md`.
After completion:
```bash
cd frontend && npx tsc --noEmit && npm run build
rm docs/tasks/DESIGN-P3-navigation.md
git add -A && git commit -m "feat(ui): Phase 3 — sidebar and header redesign"
```

---

### Phase 4: Login Redesign
Read and execute `docs/tasks/DESIGN-P4-login.md`.
After completion:
```bash
cd frontend && npx tsc --noEmit && npm run build
rm docs/tasks/DESIGN-P4-login.md
git add -A && git commit -m "feat(ui): Phase 4 — login page centered card redesign"
```

---

### Phase 5: Dashboard Redesign
Read and execute `docs/tasks/DESIGN-P5-dashboard.md`.
After completion:
```bash
cd frontend && npx tsc --noEmit && npm run build
rm docs/tasks/DESIGN-P5-dashboard.md
git add -A && git commit -m "feat(ui): Phase 5 — dashboard layout, KPI fix, countUp animation"
```

---

### Phase 6: Charts & Data Viz
Read and execute `docs/tasks/DESIGN-P6-charts.md`.
After completion:
```bash
cd frontend && npx tsc --noEmit && npm run build
rm docs/tasks/DESIGN-P6-charts.md
git add -A && git commit -m "feat(ui): Phase 6 — Recharts theme, donut charts, gradient fills"
```

---

### Phase 7: i18n & Data Fixes
Read and execute `docs/tasks/DESIGN-P7-i18n.md`.
After completion:
```bash
cd frontend && npx tsc --noEmit && npm run build
rm docs/tasks/DESIGN-P7-i18n.md
git add -A && git commit -m "fix(data): Phase 7 — i18n categories, Sales KPIs, audit log, fleet map"
```

---

### Phase 8: Polish & Final Touches
Read and execute `docs/tasks/DESIGN-P8-polish.md`.
After completion:
```bash
cd frontend && npx tsc --noEmit && npm run build
rm docs/tasks/DESIGN-P8-polish.md
rm docs/tasks/DESIGN-RUN-ALL.md
rm docs/design-system.md
rmdir docs/tasks 2>/dev/null || true
git add -A && git commit -m "feat(ui): Phase 8 — skeletons, transitions, breadcrumbs, formatting. Cleanup all task files"
```

---

## Error Handling

If `npx tsc --noEmit` fails after any phase:
1. Read the TypeScript errors
2. Fix them
3. Re-run `npx tsc --noEmit` until clean
4. Then delete the task file, commit and proceed

If `npm run build` fails after any phase:
1. Read the build errors
2. Fix them
3. Re-run `npm run build` until clean
4. Then delete the task file, commit and proceed

Do NOT skip a phase. Do NOT proceed to the next phase if the current one has build errors.

---

## Final Step

After all 8 phases are committed:
```bash
git log --oneline -8
```
Print the log to confirm all 8 commits are in place.
Verify that `docs/tasks/` is empty and `docs/design-system.md` is deleted.
