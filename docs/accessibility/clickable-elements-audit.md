# Clickable Elements Accessibility Audit

> **Phase 2e — audit-only.** No runtime code is changed by this PR. The
> document below catalogues every remaining clickable non-semantic
> pattern in `frontend/src` so the rest of the Phase 2 paydown can be
> sequenced from cheapest/safest to riskiest, with no surprises.
>
> Method: ripgrep across `frontend/src` for the patterns the prior
> phases each removed (`<div onClick>`, inline `cursor: pointer`, AntD
> `List.Item onClick`, AntD `Table onRow={() => ({ onClick })}`,
> `role="button"` without keyboard wiring, `tabIndex` without a role,
> nested interactives inside clickable wrappers), then **manually
> verified each hit by reading the surrounding JSX** so well-styled
> real `<button>` / `<a>` / `<NavLink>` elements are not flagged as
> debt. Hits that matched a real interactive primitive (e.g.
> `<button className={s.action}>` with `cursor: pointer` purely for
> the visual cue) are listed in the [False positives](#false-positives)
> section, not as findings.

## Summary

| Risk        | Count |
|-------------|-------|
| **Total findings** | **8** |
| High        | 0 |
| Medium      | 5 |
| Low         | 3 |

Phases 2b / 2c / 2d (FieldCard, dashboard `OperationsTimeline`,
`UpcomingPanel`) have already extinguished the three highest-traffic
hits. What is left is a long tail of medium-risk AntD wrappers
(`Table.onRow`, `List.Item onClick`) plus one remaining plain
`<div onClick>` row and one design-system primitive contract gap.

---

## Findings

### 1. FieldStatusCard — clickable `<div>` rows on the v1 dashboard

- **File:** `frontend/src/pages/Dashboard/components/FieldStatusCard.tsx` (line 45)
- **Pattern:**
  ```tsx
  <div key={field.id} className={s.row} onClick={() => navigate('/fields')}>
    …field name, area bar, crop tag…
  </div>
  ```
  Paired with `cursor: pointer` in `FieldStatusCard.module.css` (lines 37, 82, 95). No `role`, no `tabIndex`, no `onKeyDown`, no accessible name.
- **User impact:** Keyboard users cannot reach or activate the field rows. Screen-reader users hear nothing about the row at all — the field name, area, and crop tag are read as static text with no destination context. This is the *exact* debt that Phase 2b removed from `FieldCard` and Phase 2d removed from `UpcomingPanel`.
- **Recommended fix:** Apply the proven Phase 2b/2d pattern verbatim — `role="button"` + `tabIndex={0}` + Enter/Space `onKeyDown` (Space `preventDefault`); aria-label of the form `"{fieldName}, {cropLabel}, {area} га"`; mark the inner crop-tag `<span>` and area `<span>` `aria-hidden="true"` since their content is in the aria-label; add a `:focus-visible` ring with `outline: 2px solid var(--brand)` in the CSS module. **Note:** every row navigates to the same `/fields` URL — the aria-label should still be field-specific so a screen-reader user can distinguish rows, even though the destination is shared.
- **Risk:** **Low** (isolated component; identical pattern to two already-merged PRs; no AntD, no shared layout).
- **Suggested phase:** Phase 2f.

---

### 2. WarehousesList — AntD `Table.onRow` with `clickable-row` class

- **File:** `frontend/src/pages/Warehouses/WarehousesList.tsx` (line 112)
- **Pattern:**
  ```tsx
  <Table
    onRow={(record) => ({
      onClick: () => navigate(`/warehouses/items?warehouse=${record.id}`),
    })}
    rowClassName={() => 'clickable-row'}
  />
  ```
  The matching CSS rule lives in `frontend/src/theme/global.css` (lines 482 *and* 507 — the second copy uses `!important`, see [Finding 8](#8-themeglobalcss--duplicated--conflicting-clickable-row-rules)).
- **User impact:** AntD's `<tr>` has `role="row"` and is **not focusable by default**, so the entire warehouse list is keyboard-unreachable. Screen-reader users hear cells in turn but get no hint that the row navigates anywhere. AntD's row hover background `var(--brand-muted) !important` does not have a focus-visible parity rule.
- **Recommended fix:** Two viable directions, in order of preference:
  1. **Replace `onRow.onClick` with a real link in the first cell** — render the warehouse name in the leftmost column as an `<a href={`/warehouses/items?warehouse=${id}`}>` (or React Router `<Link>`). Browser-native focus, keyboard activation, screen-reader naming, middle-click "open in new tab" — all free. This is the AntD-recommended pattern for navigable rows.
  2. **Keep the row click, but make it accessible** — extend the `onRow` config with `tabIndex: 0`, `role: 'link'` (or keep `'row'` and add explicit keyboard handling), and `onKeyDown` for Enter/Space; add a `:focus-visible` outline to `.ant-table-tbody > tr.clickable-row`. This is more code but preserves the "click anywhere on the row" affordance.
- **Risk:** **Medium** (AntD wrapper, table semantics, route-sensitive markup, also touches a global CSS rule shared with any future `clickable-row` user).
- **Suggested phase:** Phase 2g.

---

### 3. NotificationBell — AntD `List.Item onClick` with inline `cursor: pointer`

- **File:** `frontend/src/components/Layout/NotificationBell.tsx` (lines 119–124)
- **Pattern:**
  ```tsx
  <List.Item
    style={{ padding: '8px 4px', cursor: 'pointer', /*…*/ }}
    onClick={() => handleMarkRead(item.id)}
  >
  ```
  Wrapped in an AntD `Popover`. No `role`, no `tabIndex`, no `onKeyDown`. The notification icon trigger button itself is fine — only the per-item rows inside the popover are affected.
- **User impact:** Keyboard users opening the notifications popover can tab to "Mark all read" / "Clear all" / `Empty` placeholder, but **cannot activate individual notifications** to mark them read. Screen-reader users hear the notification text as static content with no indication that it is interactive.
- **Recommended fix:** Either replace `<List.Item>` with `<List.Item role="button" tabIndex={0} onKeyDown={handleEnterSpace} aria-label={…}>` and migrate the inline `cursor: pointer` into a CSS module, **or** restructure the row so the only interactive element is a real `<button>` rendered inside `List.Item.Meta` (matching the existing legacy `components/dashboard/AlertsPanel.tsx` pattern that is already accessible — see [False positives](#false-positives)).
- **Risk:** **Medium** (AntD `List.Item` already attaches its own click area + hover; popover/portal context means focus management interacts with AntD's own focus trap; also a high-traffic interaction worth getting right).
- **Suggested phase:** Phase 2h.

---

### 4. CommandPalette — AntD `List.Item onClick` with inline `cursor: pointer` (keyboard-driven UI)

- **File:** `frontend/src/components/CommandPalette.tsx` (lines 139–148)
- **Pattern:**
  ```tsx
  <List.Item
    onClick={() => select(item)}
    style={{ cursor: 'pointer', padding: '8px 16px',
             background: index === activeIndex ? 'var(--bg-elevated)' : undefined }}
  >
  ```
  The component already tracks `activeIndex` (so arrow-key navigation is partially wired upstream), but each item itself has no `role`, no `tabIndex`, no per-item keyboard handler.
- **User impact:** Worst-impact finding in this list, despite its medium risk: command palettes are *expected* to be keyboard-first surfaces. A screen-reader user opening the palette today hears the search input, then a flat list of items with no semantic indication that any of them are activatable.
- **Recommended fix:** Add `role="option"` to each `List.Item`, set `aria-selected={index === activeIndex}`, give the surrounding `List` `role="listbox"`, ensure the search input gets `aria-activedescendant={activeId}`, and route Enter inside the input to `select(results[activeIndex])`. Also mark the click target accessible (`tabIndex={-1}` for mouse activation, since arrow-key model owns focus). Migrate the inline `cursor: pointer` into the CSS module so the active-item background and focus styles can live next to each other.
- **Risk:** **Medium** (modal/portal context, focus-trap interactions, requires touching the search-input keyboard handler too — bigger surface area than a simple row pattern).
- **Suggested phase:** Phase 2i — sequence *after* the simpler AntD List.Item fix in `NotificationBell` so the pattern can be reused.

---

### 5. Legacy `components/dashboard/OperationsTimeline.tsx` — AntD `List.Item onClick`

- **File:** `frontend/src/components/dashboard/OperationsTimeline.tsx` (lines 28–60)
- **Pattern:**
  ```tsx
  <List.Item
    className={s.cursor}
    onClick={() => navigate(`/operations/${op.id}`)}
  >
  ```
  Matching `cursor: pointer` in `components/dashboard/OperationsTimeline.module.css:10`.
- **User impact:** Identical to the v2 file fixed by Phase 2c — keyboard-unreachable rows, unannounced destinations.
- **Recommended fix:** **First, verify whether the file is still rendered.** A repo-wide grep for `from.*components/dashboard/OperationsTimeline` returns no usages — it appears to be dead code superseded by the Phase 2c file in `pages/Dashboard/components/`. If confirmed dead, **delete the file and its CSS module** instead of fixing them. If a usage is discovered, apply the Phase 2c pattern (the v2 file is a 1:1 reference) — but note that AntD `List.Item` will require either a wrapper element with role/tabIndex/onKeyDown *or* replacement of the AntD list with a plain `<ul>` to match Phase 2c verbatim.
- **Risk:** **Medium** (AntD List.Item; but mostly because of the "is it dead?" verification step — the fix itself is mechanical).
- **Suggested phase:** Phase 2j (or sooner if rolled into a cleanup PR).

---

### 6. Legacy `components/dashboard/AlertsPanel.tsx` — possibly dead code

- **File:** `frontend/src/components/dashboard/AlertsPanel.tsx` (lines 116–128)
- **Pattern:** Already uses real `<button onClick={...}>` rows with `aria-hidden` on decorative `ChevronRight` — **not an accessibility finding in itself.** Listed here because the same dead-code suspicion applies: a repo-wide grep for `from.*components/dashboard/AlertsPanel` returns no usages, suggesting the legacy `components/dashboard/AlertsPanel.module.css` `cursor: pointer` declarations on `:62` and `:160` are paying CSS cost for a file that no longer renders.
- **User impact:** None today (a11y is correct). Dead-code carrying cost: bundle bloat, future maintenance confusion, and the risk that a future contributor copies the file as a "template" without realising it is unused.
- **Recommended fix:** Verify with `git log` + import graph; if confirmed unused, delete `components/dashboard/AlertsPanel.tsx` + `.module.css` together with the `OperationsTimeline` legacy in [Finding 5](#5-legacy-componentsdashboardoperationstimelinetsx--antd-listitem-onclick).
- **Risk:** **Low** (deletion of unused file; no behaviour change).
- **Suggested phase:** Phase 2j (cleanup PR — bundle the two legacy deletions).

---

### 7. `design-system/primitives/Surface` — `interactive` prop has no enforced a11y contract

- **Files:**
  - `frontend/src/design-system/primitives/Surface.tsx` (props interface, lines ~58–80)
  - `frontend/src/design-system/primitives/Surface.module.css` (line 17 — `[data-interactive="true"]` selector with `cursor: pointer`)
- **Pattern:** `Surface` accepts an `interactive` boolean prop that toggles a `data-interactive="true"` attribute, which in turn applies `cursor: pointer` and hover/focus background styling. **The component does not enforce that `interactive={true}` users also pass a `role`, `tabIndex`, `onClick`, or `onKeyDown`.** It is currently unused (no consumer in `frontend/src` sets `interactive`), but the contract gap is a footgun for the next person who reaches for it.
- **User impact:** Latent — none today. If a consumer adopts `interactive` without supplying keyboard wiring, they will silently ship the same `<div onClick>` debt the Phase 2 paydown is removing.
- **Recommended fix:** Either (a) document the contract in the JSDoc — *"`interactive` is a visual hint only; you must also provide `onClick`, `role`, `tabIndex`, and `onKeyDown` for keyboard users"* — and add a runtime `console.warn` in development when `interactive={true}` is passed without `onClick`; or, preferably, (b) extend `Surface` so `interactive={true}` implies `role="button"` + `tabIndex={0}` + an Enter/Space `onKeyDown` that delegates to `onClick`, with the consumer required to pass `aria-label`. Option (b) makes the primitive impossible to misuse.
- **Risk:** **Low** (DS primitive change, but the prop has no consumers today, so the blast radius is zero).
- **Suggested phase:** Phase 3 (design-system contract hardening) — bundle with any other primitive contract gaps surfaced during the rest of Phase 2.

---

### 8. `theme/global.css` — duplicated / conflicting `clickable-row` rules

- **File:** `frontend/src/theme/global.css` (lines 482–488 and 507)
- **Pattern:**
  ```css
  /* line 482 — AntD-scoped */
  .ant-table-tbody > tr.clickable-row { cursor: pointer; }
  .ant-table-tbody > tr.clickable-row:hover > td {
    background: var(--brand-muted) !important;
  }
  /* line 507 — global, !important */
  .clickable-row { cursor: pointer !important; }
  ```
  The two rules overlap and the global `!important` version is reachable by any element, not just AntD table rows.
- **User impact:** Indirect — these rules let consumers (today: `WarehousesList`) apply a clickable visual cue to a non-interactive `<tr>` without any focus-visible counterpart, which directly enables [Finding 2](#2-warehouseslist--antd-tableonrow-with-clickable-row-class). They also make the codebase look like there are two different clickable-row contracts, which there are not.
- **Recommended fix:** Pick one. When [Finding 2](#2-warehouseslist--antd-tableonrow-with-clickable-row-class) is fixed, also (a) collapse to the single AntD-scoped rule, (b) drop the `!important`, and (c) add a paired `:focus-visible` declaration so any future opt-in row gets the keyboard affordance for free.
- **Risk:** **Low** (CSS-only; small blast radius — one consumer today).
- **Suggested phase:** Phase 2g — bundle with [Finding 2](#2-warehouseslist--antd-tableonrow-with-clickable-row-class).

---

## False positives (verified, **no fix needed**)

These matched the search heuristics but proved to be real interactive elements on inspection. Listing them here so a future audit does not re-flag them.

| File | Why it's fine |
| --- | --- |
| `pages/Dashboard/components/QuickActionsStrip.tsx` | Each action is a real `<button>`. |
| `pages/Fields/components/FieldSidePanel.tsx` (lines 116, 124, 129) | All three handlers are on real `<button>` elements (`s.ctaPrimary`, `s.btnSecondary`). |
| `components/Layout/MobileBottomTabs.tsx` | Tabs are `<NavLink>`; the "more" trigger is a real `<button>`. |
| `components/Layout/AppLayout.tsx` | Drawer / collapse / search / language / logout handlers all sit on real `<button>` elements. |
| `components/Layout/Sidebar.tsx` | The `togglePin` handler is on a real `<button>`; the `({key})=>...` handler at line 353 is the AntD `<Menu onClick>` callback (key argument shape), which AntD itself renders as accessible menu items. |
| `pages/SuperAdmin/ControlCenter.tsx` | All onClick handlers seen are on real `<button>`s. |
| `pages/ChangePassword.tsx` (line 110) | The flagged `tabIndex={0}` is on a real `<button type="button">` (the password show/hide toggle). It is **redundant** but harmless — `<button>` is keyboard-reachable by default. Consider removing it as a polish item, no a11y impact. |
| `pages/Dashboard/components/QuickActionsStrip.module.css`, `pages/Fields/components/FieldsToolbar.module.css`, `pages/Login.module.css`, `pages/Landing/*.module.css`, `pages/SuperAdmin/ControlCenter.module.css`, `components/Layout/Sidebar.module.css`, `components/Layout/AppLayout.module.css`, `pages/DashboardV2/DashboardV2.module.css` (`.rangeArrow`, `.seg`), `pages/ErrorPage.module.css` | Every `cursor: pointer` here lands on a real `<button>` or `<a>` / `<NavLink>` selector — verified by reading the matching JSX. |
| `pages/Sales/RevenueAnalytics.tsx` (line 294), `pages/Dashboard/components/RevenueCostChart.tsx` (line 105) | The inline `cursor: pointer` is on Recharts `<BarChart>` SVG containers. Chart-internal a11y is owned by Recharts (a separate, larger workstream), not by these wrappers. |
| `components/Map/FieldMap.module.css`, `components/Map/FieldDrawMap.module.css` | `cursor: pointer` is on Leaflet map canvas elements, not DOM clickables. Map-control a11y is owned by Leaflet. |
| `pages/Fields/components/FieldCard.tsx`, `pages/Dashboard/components/OperationsTimeline.tsx`, `pages/DashboardV2/components/UpcomingPanel.tsx` | Already fixed by Phase 2b / 2c / 2d respectively. The `role="button"` / `tabIndex` matches are the *fix*, not new debt. |

---

## Recommended execution order

Sequencing optimises for **risk minimisation** (cheapest, most isolated, most pattern-reusable changes first), and for **pattern re-use** (each phase produces the template the next phase copy-pastes).

1. **Phase 2f — `FieldStatusCard.tsx` rows** ([Finding 1](#1-fieldstatuscard--clickable-div-rows-on-the-v1-dashboard)).
   *Lowest risk; reuses the FieldCard / UpcomingPanel pattern verbatim; closes out the last plain `<div onClick>` row in the codebase. Estimated ~17 tests, same shape as `UpcomingPanel.test.tsx`.*

2. **Phase 2g — `WarehousesList` row navigation + `theme/global.css` cleanup** ([Finding 2](#2-warehouseslist--antd-tableonrow-with-clickable-row-class) + [Finding 8](#8-themeglobalcss--duplicated--conflicting-clickable-row-rules)).
   *First AntD interaction. Bundling the CSS cleanup with the only consumer keeps the change self-contained. Recommend the "make the leftmost column a real `<Link>`" approach — smaller diff, browser-native focus, no per-row keyboard handler to test.*

3. **Phase 2h — `NotificationBell` AntD `List.Item`** ([Finding 3](#3-notificationbell--antd-listitem-onclick-with-inline-cursor-pointer)).
   *Establishes the AntD-`List.Item` pattern in a contained context (popover with a single user action: mark-as-read). Output template for Phase 2i.*

4. **Phase 2i — `CommandPalette` listbox/option model** ([Finding 4](#4-commandpalette--antd-listitem-onclick-with-inline-cursor-pointer-keyboard-driven-ui)).
   *Builds on the Phase 2h template but adds `role="listbox"` + `aria-activedescendant` for the modal/keyboard-first context. Highest user-impact remaining finding; sequenced last among the AntD work because it requires the most tests and the widest surface area.*

5. **Phase 2j — Legacy dead-code cleanup** ([Finding 5](#5-legacy-componentsdashboardoperationstimelinetsx--antd-listitem-onclick) + [Finding 6](#6-legacy-componentsdashboardalertspaneltsx--possibly-dead-code)).
   *Bundle the two `components/dashboard/*` deletions in one PR (assuming the no-import grep result holds). Pure cleanup — no behaviour change.*

6. **Phase 3 — `Surface` primitive contract** ([Finding 7](#7-design-systemprimitivessurface--interactive-prop-has-no-enforced-a11y-contract)).
   *Lowest priority but worth doing before any consumer adopts `interactive={true}` and inadvertently re-introduces the debt these phases removed. Bundle with any other primitive contract gaps that surface during Phase 2f–2j review.*

---

## Validation

- This PR adds only `docs/accessibility/clickable-elements-audit.md`. No `.tsx`, `.ts`, `.css`, `.scss`, route, API, or test file is touched.
- The repository has no Markdown linter configured (`package.json` shows no `markdownlint`, `remark-lint`, or similar — checked under `frontend/` and the repo root). No additional CI step is required by this change.
