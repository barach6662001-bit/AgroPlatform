# Wave 1 Agent Briefing — App Shell Migration (€100M edition)

**Audience:** Claude Code (autonomous execution).
**Goal:** Ship a Palantir/Linear-grade app shell that makes the product look acquisition-ready. Migrate Sidebar, Topbar, Auth, Command palette, and mobile drawer from AntD to shadcn. Add €100M usability hooks (live status, context-aware breadcrumbs, user menu with preferences, keyboard shortcuts modal, SSO placeholder, magic link, density toggle, new-tab support).

**Branch:** `feat/full-redesign-v2` (already exists). Do NOT create a new branch.
**Frontend root:** `./frontend` (confirmed).
**Autopilot:** run with `claude --dangerously-skip-permissions`.

---

## Before starting — REQUIRED reading

Read these in full, in order. They are the law:

1. `design-system/DESIGN_SYSTEM.md` — visual tokens, anti-patterns
2. `design-system/MIGRATION_PLAN.md` — strategy + component mapping
3. `agents/wave-1/WIREFRAMES.md` — ASCII wireframes for every screen (the target visual)
4. `agents/wave-1/USER_FLOWS.md` — interaction contracts (what clicks where, what state changes)
5. `agents/wave-1/_progress.md` — your tracker (append after each task)

If any of these files is missing → STOP and report. Do not invent requirements.

---

## Discovery already done (use, don't repeat)

Previous agent run found these existing files in `frontend/src/`. Use them:

| File | Current stack | Migration target |
|---|---|---|
| `components/Layout/AppLayout.tsx` | AntD Button + Dropdown | shadcn Button + DropdownMenu (task-02) |
| `components/Layout/Sidebar.tsx` | AntD Menu, permission-gated | pure Tailwind + shadcn (task-01) |
| `components/Layout/MobileDrawer.tsx` | AntD Drawer | shadcn Sheet (task-03) |
| `components/CommandPalette.tsx` | AntD Modal + Input + List | shadcn CommandDialog (cmdk) (task-06) |
| `pages/Login.tsx` | AntD Form | RHF + zod + shadcn Form (task-04) |
| `pages/ChangePassword.tsx` (if exists) | AntD Form | RHF + zod + shadcn Form (task-04) |
| `store/themeStore.ts` (Zustand) | standalone | bridge with next-themes (task-00) |

Before every task, `grep` the target file to confirm it still matches the expectation. If Phase 0 or another change touched it, adapt.

---

## Execution contract

For each task file, in order:

1. Read the task file in FULL before starting.
2. Verify previous task is ✅ in `_progress.md`.
3. Execute steps in order, no skipping.
4. Run every command in the **Verification** block. If any fails → STOP.
5. Check every line in **Acceptance criteria**. If any cannot be satisfied → STOP.
6. Take a Playwright screenshot if the task specifies one, save to `docs/screenshots/wave-1/{task-id}-{light|dark}.png`.
7. Run the **Git** block exactly as written.
8. Append a completion entry to `_progress.md`.
9. Move to next task.

### If a task fails

- Do not improvise a workaround.
- Do not partially commit.
- Do not skip the task.
- Write a failure report with: task ID, step that failed, exact error output, what you attempted, what you recommend.

### Escalation triggers — STOP and ask

- Any breaking change to a route that's not part of this migration
- Any AntD file migrated that another component imports (breaks downstream)
- Any token in `tokens.css` that needs a value change (user sign-off required)
- Any new dependency not listed in the task
- Any backend API call that doesn't exist yet (list it for me, do not stub silently)

---

## Task execution order

```
task-00-theme-bridge.md                 (infra — Zustand ↔ next-themes)
task-01-sidebar-migration.md            (primary shell)
task-02-topbar-migration.md             (app header)
task-03-user-menu.md                    (topbar-right, dropdown with preferences)
task-04-mobile-drawer.md                (responsive)
task-05-auth-screens.md                 (login + SSO + magic link + change password)
task-06-command-palette.md              (cmdk migration + context-aware commands)
task-07-keyboard-shortcuts-modal.md     (⌘/ help modal)
task-08-empty-error-loading-states.md   (3 reusable components)
task-09-error-pages.md                  (404, 403, 500, maintenance)
task-10-polish-and-pr.md                (Playwright QA + screenshots + open PR)
```

Do not parallelize. Tasks have dependencies (theme bridge before sidebar, sidebar before mobile drawer, user menu before topbar final, etc.).

---

## Commit convention

Every commit uses scope `feat(shell)` or `refactor(shell)`:

```
feat(shell): migrate sidebar to shadcn + tailwind

- replaces AntD Menu with semantic <nav> + Tailwind
- preserves permission gating via PermissionGuard
- adds live status dot + collapse to rail mode
- keyboard navigation (↑↓ + ⏎) preserved
- 3 new primitives under src/components/shell/

Task: wave-1/task-01
```

Every commit → `git push` immediately. No batching.

---

## Working state tracking

After each task, append to `agents/wave-1/_progress.md`:

```md
## task-NN — [title]
- Completed: YYYY-MM-DD HH:MM
- Commit: <sha>
- Screenshots: docs/screenshots/wave-1/task-NN-light.png, task-NN-dark.png
- ESLint allowlist: removed `X` files (new count: NN)
- Notes: <anything unusual>
```

The ESLint allowlist (`.eslint-antd-allowlist.txt` from Phase 0 task-13) MUST shrink with every task. If a task removes AntD from a file, that file must be deleted from the allowlist in the same commit.

---

## Definition of done (Wave 1)

Wave 1 is complete when:

- All 11 tasks show ✅ in `_progress.md`
- `.eslint-antd-allowlist.txt` reduced by ≥ 8 entries from the Phase 0 baseline
- `/__design-system` still renders everything (no token regressions)
- `/login`, `/dashboard`, `/warehouses` all visually refreshed in light + dark
- Command palette opens on ⌘K on every authenticated page
- Keyboard shortcuts modal opens on ⌘/
- `npm run build` passes, `npm run lint` passes, `tsc --noEmit` passes
- All 11 screenshot pairs saved under `docs/screenshots/wave-1/`
- PR opened against `main`, title `feat(shell): Wave 1 — Palantir-grade app shell`

On completion, report:
- PR URL
- Bundle size delta vs Phase 0 baseline
- Any follow-ups discovered (likely a few per screen, log them)
- Recommendation: proceed to Wave 2 (first operational module — Warehouses / Grain).
