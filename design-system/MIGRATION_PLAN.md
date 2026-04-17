# AgroPlatform UI Migration Plan — Ant Design → shadcn/ui

**Strategy:** Strangler fig pattern. Both libraries coexist. New surface uses shadcn. Old surface stays AntD until migrated screen-by-screen. **Never mix them in the same region.**

---

## 1. Why migrate (context for future reviewers)

Ant Design served us well in early development: batteries-included, fast. But for the €10M-valuation target and enterprise DD:

1. **Customization ceiling.** AntD theming is limited and fighting it produces fragile code. Palantir-density density + custom typography require per-component overrides that eventually cost more than shadcn's "own-the-code" model.
2. **Bundle size.** AntD ships ~400KB gzipped even with tree-shaking. shadcn is zero-runtime, only what you use.
3. **Technical signal.** For acquirers/investors, shadcn + Tailwind is the current enterprise React default (Vercel, Linear, Raycast, Cal.com).
4. **Locale + date format debt.** Several bugs in AntD's DatePicker/locale handling have already cost us hours.

---

## 2. Coexistence rules (enforced in PR review)

| Rule | Rationale |
|---|---|
| **No AntD and shadcn in the same React component.** | Prevents mixed focus rings, z-index conflicts, double providers. |
| **No AntD inside a shadcn Dialog / Sheet / Popover.** | Portals conflict. AntD's modal stack and Radix Portal fight. |
| **Global styles isolated.** AntD `<ConfigProvider>` wraps legacy screens only; shadcn tokens live at `:root`. | |
| **Routes are the migration unit.** Migrate an entire `/warehouses/*` subtree at once, not one form at a time. | |
| **New screens: shadcn only.** Starting from this PR, no new AntD code is allowed. | |
| **Shared components (Sidebar, Topbar, Breadcrumbs) migrate FIRST.** | They appear on every screen; replacing them unifies the shell immediately. |

### ESLint enforcement

Add to `.eslintrc`:
```json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "paths": [{
        "name": "antd",
        "message": "Ant Design is deprecated. Use @/components/ui/* (shadcn). New AntD imports require tech-lead approval + migration ticket."
      }]
    }]
  }
}
```

Existing AntD imports: add per-file override until migrated.

---

## 3. Component mapping

| AntD | shadcn equivalent | Notes |
|---|---|---|
| `Button` | `Button` | Variants: `default` (primary), `secondary`, `outline`, `ghost`, `destructive`, `link` |
| `Input`, `Input.Password` | `Input` + eye toggle | Password toggle is a custom wrapper in `@/components/ui/password-input` |
| `Input.TextArea` | `Textarea` | |
| `InputNumber` | `Input type="number"` + `NumericFormat` | Use `react-number-format` for currency/tonnage |
| `Select` | `Select` + `Combobox` for search | shadcn Combobox for >10 items with search |
| `AutoComplete` | `Combobox` | |
| `Cascader` | custom (rare — only used in location picker) | Build on top of shadcn `Command` |
| `DatePicker` | `DatePicker` (Calendar + Popover) | `react-day-picker` + `date-fns` for locale |
| `RangePicker` | custom `DateRangePicker` on `react-day-picker` range mode | |
| `TimePicker` | `Input type="time"` | Native is fine for now |
| `Checkbox` | `Checkbox` | |
| `Radio`, `Radio.Group` | `RadioGroup` | |
| `Switch` | `Switch` | |
| `Slider` | `Slider` | |
| `Upload` | custom on `react-dropzone` | No direct shadcn primitive |
| `Form` | `Form` (react-hook-form + zod) | Biggest migration surface — validation schemas ported to zod |
| `Table` | `Table` + `@tanstack/react-table` | For anything > 20 rows. Simple lists can use raw `Table`. |
| `Pagination` | `Pagination` | |
| `Tag` | `Badge` with variants | |
| `Tabs` | `Tabs` | |
| `Steps` | custom on `Progress` + flex | Simple; build once in `@/components/ui/steps` |
| `Card` | `Card` | |
| `Descriptions` | custom grid in `@/components/ui/descriptions` | Pattern: `<dl>` with Tailwind grid |
| `Collapse` | `Accordion` | |
| `Tree` | custom on `Command` for small; `react-arborist` for large | |
| `Modal` | `Dialog` | Confirm dialogs → `AlertDialog` |
| `Drawer` | `Sheet` | |
| `Popover` | `Popover` | |
| `Tooltip` | `Tooltip` | |
| `Dropdown` | `DropdownMenu` | |
| `Menu` | `NavigationMenu` or `Sidebar` | Most cases → `Sidebar` |
| `Breadcrumb` | `Breadcrumb` | |
| `Layout.Sider`, `Header`, `Content` | `Sidebar` + flex shell | shadcn ships a robust Sidebar primitive |
| `notification`, `message` | `Sonner` | One toast library across the app |
| `Alert` | `Alert` | |
| `Result` | custom `EmptyState` component | |
| `Avatar` | `Avatar` | |
| `Badge` (dot/count) | `Badge` + dot variant | |
| `Skeleton` | `Skeleton` | |
| `Spin` | `Spinner` (shadcn has it in v4) | |
| `Typography` (`Title`, `Text`) | Tailwind classes | No component needed |
| `Divider` | `Separator` | |
| `Empty` | custom `EmptyState` | |
| `ConfigProvider` | keep only for legacy AntD routes; shadcn uses CSS vars | |
| `Space` | Tailwind `flex gap-N` | |
| `Row` / `Col` | Tailwind grid or flex | No grid library needed |

---

## 4. Migration priority

**Migrate in this order. Do not jump ahead.**

### Wave 0 — Foundation (Phase 0, this plan)
Design tokens + shadcn install + primitives ready + preview page.

### Wave 1 — App shell
Everything visible on every route. Unifies the "first impression" instantly.
- Sidebar (main nav)
- Topbar (breadcrumbs, tenant switcher, user menu, theme toggle, density toggle)
- Auth shell (login, forgot password, tenant selection)
- Error boundaries + empty states + loading skeletons

### Wave 2 — Dashboards
- Main dashboard (the "0 ₴ KPIs" screen)
- Per-module dashboards

### Wave 3 — Core operational modules (ordered by traffic)
1. Warehouses (most-used by Warehouse Operator)
2. Grain operations (stock ledger, batches, transfers)
3. Fuel
4. HR
5. Finance
6. Settings / Admin / Permissions

### Wave 4 — Long tail
Rarely-used reports, legacy screens, internal tools.

---

## 5. Per-screen migration checklist

For each migrated screen, the PR description must check:

- [ ] No `antd` imports remain in the migrated file(s)
- [ ] Form validation ported to zod schema with matching error messages (Ukrainian + English)
- [ ] Tables use TanStack Table if > 20 rows or needs sorting/filtering
- [ ] Dates use `date-fns` locale `uk` + format `dd.MM.yyyy` (Ukrainian standard)
- [ ] Numbers use `Intl.NumberFormat('uk-UA')` + `tabular-nums` class
- [ ] Loading states use `Skeleton`, not `Spin`
- [ ] Error states use standardised `EmptyState` / `ErrorState`
- [ ] Screenshot attached (before/after)
- [ ] Role-based visibility preserved (CompanyAdmin, Manager, WarehouseOperator, Accountant, Viewer)
- [ ] Lighthouse accessibility score ≥ 95 for the route
- [ ] No console warnings

---

## 6. Risk register

| Risk | Mitigation |
|---|---|
| shadcn Table is low-level vs AntD Table (virtualization, expandable rows, row selection built-in) | TanStack Table + `@tanstack/react-virtual` wrapper. Build once in `@/components/data-table/data-table.tsx`. |
| Form validation logic scattered in AntD validators | Extract zod schemas to `src/domain/validation/*.ts`. One schema file per entity. |
| DatePicker locale bugs (currently American format) | `react-day-picker` + `date-fns/locale/uk`. Write one wrapper component that all forms use. |
| Bundle size during migration (both libs loaded) | Acceptable for 4–6 weeks. Dynamic import AntD routes once shell is migrated → removes from initial bundle. |
| CSS specificity fights (AntD resets vs Tailwind preflight) | AntD uses CSS-in-JS (v5), no global resets. Should coexist cleanly. Spot-check with per-route smoke tests. |
| Focus ring inconsistency during transition | Define focus-visible utility class in tokens.css early; apply to both AntD overrides and shadcn. |
| Missing AntD features we use (e.g., Tree, complex Tables) | Build-vs-buy decision per component. Default: build on shadcn primitives. |

---

## 7. Success criteria for Phase 0 (this plan)

By end of Phase 0:

- [ ] Tailwind + shadcn installed and building
- [ ] IBM Plex loaded
- [ ] `/src/styles/tokens.css` contains final tokens, no placeholders
- [ ] `tailwind.config.ts` consumes all tokens
- [ ] 25+ shadcn primitives installed and importable from `@/components/ui/*`
- [ ] Dark mode toggles and persists in localStorage
- [ ] `/__design-system` route renders every primitive for visual QA
- [ ] AntD still functions on all existing screens (no regression)
- [ ] CI build passes, no new TypeScript errors
- [ ] Documented coexistence rules in `CONTRIBUTING.md` (new section)
- [ ] Feature branch merged to `main`

Exit criteria = you can write the Login page in Wave 1 using only shadcn, from scratch, in under 45 minutes.
