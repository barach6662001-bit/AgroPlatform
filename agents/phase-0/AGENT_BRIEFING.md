# Phase 0 Agent Briefing — Design System Foundation

**Audience:** Claude Code (autonomous execution).
**Goal:** Complete all tasks in `/agents/phase-0/task-*.md` in numerical order.
**Output:** Merged PR on `feat/design-system-foundation` branch, all primitives working, preview route green.

---

## Before starting

### 1. Verify MCP servers

The user should have these MCP servers configured in Codespace:

1. **shadcn MCP** (primary) — registry browsing + install
2. **Chrome DevTools MCP** (secondary) — visual verification
3. 21st.dev Magic (tertiary, optional) — only for Wave 1+ decorative needs

Check with `/mcp` command. If shadcn MCP is missing, STOP and report to user. Do not proceed.

### 2. Read the reference docs

Before touching code, read in full:

1. `/design-system/DESIGN_SYSTEM.md` — the visual law
2. `/design-system/MIGRATION_PLAN.md` — the strategy
3. `/design-system/tokens.css` — these tokens are final, do not invent new ones
4. `/design-system/tailwind.config.ts` — this is the target config

If you disagree with any decision in these files, STOP and ask. Do not silently change tokens.

### 3. Locate the frontend

The AgroPlatform repo has multiple projects. Find the React frontend:

```bash
# Find package.json files with "react" dependency
find . -name "package.json" -not -path "*/node_modules/*" -exec grep -l '"react"' {} \;
```

Note the directory. Call it `$FRONTEND` in all subsequent commands. Likely paths:
- `src/AgroPlatform.Web/ClientApp/`
- `frontend/`
- `web/`
- `client/`

Verify it uses Vite (`vite.config.ts` present) or Next.js (`next.config.js`). Most tasks assume Vite; adapt paths for Next.js (`app/` instead of `src/pages/`).

---

## Execution contract

Execute each task as follows:

1. Read the task file completely.
2. Verify dependencies (previous tasks) are done.
3. Execute steps in order.
4. Run **Verification Commands**. If any fail, do not commit; fix or report.
5. Check **Acceptance Criteria** one by one.
6. Run the **Git** block exactly as written.
7. Report task completion and move to next task.

### If a task fails

- Do not skip ahead.
- Do not invent workarounds.
- Do not partially commit.
- Write a clear failure report with: which step failed, exact error output, what was tried, what you recommend.

### Escalation triggers — STOP and ask user

- Any breaking change to existing running code (dev server won't start)
- Any package conflict that requires downgrading existing dependencies
- Any acceptance criterion that cannot be satisfied
- Any deviation from the tokens / design decisions in the reference docs

---

## Task execution order

```
task-00-discover-and-branch.md        (setup)
task-01-install-tailwind.md           (infra)
task-02-init-shadcn.md                (infra)
task-03-install-fonts.md              (infra)
task-04-write-design-tokens.md        (tokens)
task-05-configure-tailwind.md         (tokens)
task-06-install-primitives.md         (components)
task-07-install-data-components.md    (components)
task-08-install-overlays.md           (components)
task-09-install-forms.md              (components)
task-10-install-datepicker.md         (components)
task-11-configure-dark-mode.md        (features)
task-12-preview-route.md              (QA surface)
task-13-coexistence-and-lint.md       (enforcement)
task-14-final-qa-and-pr.md            (ship)
```

Do not parallelize. Tasks have ordering dependencies (Tailwind before shadcn init, tokens before primitives, etc.).

---

## Working state tracking

After each task, append to `/agents/phase-0/_progress.md`:

```md
## task-NN — [title]
- Completed: YYYY-MM-DD HH:MM
- Commit: <sha>
- Notes: <any deviations, warnings, follow-ups>
```

This gives the user a clean audit trail and unblocks re-entry if you are interrupted.

---

## Commit message convention

All commits in this phase use the `feat(design-system)` scope:

```
feat(design-system): install tailwind and postcss

- adds tailwindcss 3.4, postcss, autoprefixer
- initialises tailwind config and base directives
- adds @tailwind directives to src/styles/index.css

Task: phase-0/task-01
```

Each commit → `git push` immediately. The user merges via PR at the end of task-14.

---

## Definition of done (Phase 0)

Phase 0 is complete when:

- All 15 tasks show ✅ in `_progress.md`
- `/__design-system` route renders all primitives without error
- `npm run build` succeeds with zero new warnings
- `npm run lint` passes
- Dark mode toggle works and persists
- AntD legacy screens unaffected (spot-check: `/dashboard`, `/warehouses`)
- Branch `feat/design-system-foundation` pushed, PR opened, description references this briefing

On completion, report back with PR link and next recommended action (Wave 1: app shell migration).
