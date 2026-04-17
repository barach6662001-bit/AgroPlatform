# Task 10 — Rich Empty States via Magic MCP

**Goal:** Replace generic EmptyState (from Wave 1) with richer 21st.dev empty states across all 4 dashboards. Also upgrade LoadingState to proper shimmer skeletons per page.

**Depends on:** tasks 00-09

---

## Step 1 — Magic MCP search

1. `"empty state with illustration and action button"`
2. `"no data placeholder animated illustration dark"`
3. `"friendly empty state with hint text"`

Install one flexible component or several (one per context).

---

## Step 2 — Create contextual empty states

Create `frontend/src/components/state/empty-states/` folder with:

### NoFieldsEmpty.tsx
Shown on InvestorDashboard FieldMap when no fields.
- Illustration: animated SVG tractor on empty field
- Title: "Ваш перший сезон починається тут"
- Body: "Додайте поля щоб побачити NDVI-аналітику, витрати та прибуток"
- CTA: "Додати перше поле →"

### NoOperationsEmpty.tsx
Shown on Manager ActiveOperations when nothing running.
- Title: "Все спокійно"
- Body: "Немає активних операцій. Гарний час щоб спланувати наступний тиждень."
- CTA: "Створити план"

### NoTasksEmpty.tsx
Shown on Worker Dashboard when queue empty.
- Illustration: checkmark with confetti animation
- Title: "Всі завдання виконано! 🎉"
- Body: "Гарна робота. Зачекай поки менеджер призначить нові."
- No CTA (celebratory)

### NoFinancialDataEmpty.tsx
Shown on FinanceDashboard when just starting.
- Title: "Немає фінансових даних"
- Body: "Імпортуй банківську виписку або додай операції вручну."
- CTA: "Імпортувати CSV →"

---

## Step 3 — Shimmer skeletons per page

Upgrade `components/state/loading-state.tsx` (from Wave 1) to include layout-aware variants:

Add variants:
- `investor-hero` — matches HeroSection + KPI grid + 2 column row
- `manager-full` — 4 KPIs + ops list + alerts + grid
- `worker-compact` — 4 tasks + dense table
- `finance-full` — 4 KPIs + 2 charts + table + 2 panels

Each uses `skeleton-shimmer` class from task-00 tokens.

Wire these into each dashboard's `<Suspense fallback>` in Dashboard.tsx router.

---

## Step 4 — Acceptance criteria

- [ ] 4 new empty state components created
- [ ] Each has illustration/animation (via magic component)
- [ ] Each has proper copy in Ukrainian
- [ ] Wired into their respective dashboards (conditional on empty data)
- [ ] Shimmer skeletons match each layout's shape
- [ ] Agent manually tested empty states by forcing empty mock data
- [ ] `npm run build` passes

---

## Playwright screenshots

- `docs/screenshots/wave-1-5/task-10-empty-fields.png`
- `docs/screenshots/wave-1-5/task-10-empty-operations.png`
- `docs/screenshots/wave-1-5/task-10-empty-tasks.png`
- `docs/screenshots/wave-1-5/task-10-empty-finance.png`
- `docs/screenshots/wave-1-5/task-10-shimmer-investor.png`

---

## Git

```bash
git add frontend/src/components/state/empty-states/ \
        frontend/src/components/state/loading-state.tsx \
        frontend/src/pages/Dashboard.tsx \
        docs/screenshots/wave-1-5/

git commit -m "feat(dashboard): rich contextual empty + shimmer states

- NoFieldsEmpty, NoOperationsEmpty, NoTasksEmpty, NoFinancialDataEmpty
- Illustrations via 21st.dev components
- Layout-aware shimmer skeletons (investor/manager/worker/finance)
- All copy in Ukrainian

Task: wave-1-5/task-10"
git push
```

Append to `_progress.md`.
