# Wave 1 Pack — Full Redesign v2

The App Shell migration. Turns the existing AntD-based UI into a Palantir/Linear-grade shell: collapsible sidebar with rail mode, context-aware breadcrumbs, tenant switcher, command palette with sequence shortcuts, user menu with inline preferences, and proper error pages.

---

## What's in this pack

```
agents/wave-1/
├── AGENT_BRIEFING.md              ← Start here. Execution contract.
├── WIREFRAMES.md                  ← ASCII wireframes — the visual law
├── USER_FLOWS.md                  ← Interaction contracts — what happens when
├── _progress.md                   ← Tracker the agent appends to
├── task-00-theme-bridge.md        ← Zustand ↔ next-themes sync
├── task-01-sidebar-migration.md   ← primary shell rebuild
├── task-02-topbar-migration.md    ← app header
├── task-03-user-menu.md           ← dropdown with preferences
├── task-04-mobile-drawer.md       ← responsive
├── task-05-auth-screens.md        ← login + SSO + magic link
├── task-06-command-palette.md     ← cmdk with sequence shortcuts
├── task-07-keyboard-shortcuts-modal.md  ← ⌘/ help modal
├── task-08-empty-error-loading-states.md  ← 3 reusable components
├── task-09-error-pages.md         ← 404/403/500/maintenance
└── task-10-polish-and-pr.md       ← Playwright QA + PR
```

---

## How to run

### 1. Drop the pack into the repo

From your local `/workspaces/AgroPlatform` directory:

```bash
unzip /path/to/wave-1-pack.zip -d .
ls agents/wave-1/
```

Should show all 11 task files + briefing + wireframes + flows + progress tracker.

### 2. Verify prerequisites

- [ ] On branch `feat/full-redesign-v2` (Phase 0 already merged to main, but we continue on this branch)
- [ ] Frontend builds cleanly: `cd frontend && npm run build`
- [ ] Phase 0 design system preview works: navigate to `/__design-system`
- [ ] Phase 0 shadcn primitives installed: `ls frontend/src/components/ui/ | wc -l` ≥ 15

### 3. Start the agent

```bash
claude --dangerously-skip-permissions
```

Paste this prompt (verbatim):

```
Read agents/wave-1/AGENT_BRIEFING.md in full. Then read WIREFRAMES.md and USER_FLOWS.md in full. Then execute task-00 through task-10 in order, one at a time.

For each task:
1. Read the task file completely
2. Execute every step
3. Run the verification commands
4. Check every acceptance criterion
5. Take the Playwright screenshots
6. Run the Git block (commit + push)
7. Append to _progress.md
8. Move to the next task

DO NOT skip tasks. DO NOT improvise workarounds. If a task fails, stop and write a failure report. If you hit an escalation trigger listed in AGENT_BRIEFING.md, stop and ask.

The repo root is /workspaces/AgroPlatform. The frontend is ./frontend. You are already on branch feat/full-redesign-v2. Connected MCPs: magic, context7, playwright. Go.
```

### 4. Monitor progress

- `_progress.md` will be appended to after each task
- Each task commits to `feat/full-redesign-v2` — watch the branch
- Screenshots land in `docs/screenshots/wave-1/`
- Final output: PR against `main`

Expected runtime: **6–10 hours** of autonomous execution (depending on how many small visual fixes the polish step surfaces).

---

## What to expect after completion

### Visible changes

- Sidebar looks completely different — rail-collapsible, grouped, with status dot
- Topbar has tenant switcher + breadcrumbs (hover for siblings) + search box
- Login screen redesigned with SSO + magic link placeholders
- `⌘K` opens a real command palette
- `⌘/` opens keyboard shortcuts reference
- User menu has inline Appearance / Density / Language controls
- Pages unmigrated from AntD still show inside the new shell — they look "okay" but not finished. That's Wave 2's job.

### Measurable outcomes

- `.eslint-antd-allowlist.txt` shrinks by ≥ 8 entries
- No new AntD imports in any shell code
- Bundle may grow slightly from cmdk + new Radix primitives; offset by AntD shaking begins in later waves
- ~30 screenshots documenting the before/after

### Things to check manually

After merge, walk through `USER_FLOWS.md` on a staging environment. Every flow should work. If something's off, it's a polish item — log it and fix quickly.

---

## If the agent gets stuck

Common issues and what to do:

| Symptom | Likely cause | Fix |
|---|---|---|
| "shadcn component X not found" | Primitive wasn't installed in Phase 0 | Agent should run `npx shadcn@latest add <name>` |
| "authStore has no `availableTenants`" | Backend doesn't expose multi-tenant endpoint yet | Agent should stub + log as backend follow-up |
| "react-query not installed" | Sync status needs a fallback | Agent uses navigator.onLine only (already in task-01) |
| "DB migration error" | Not related to Wave 1 (frontend-only) | Agent should stop and ask |
| "Test credentials don't work" | Backend down / session expired | Agent should stop and ask |

If the agent hits an escalation trigger (listed in AGENT_BRIEFING.md), it stops and asks. Respond in the same Claude Code session to unblock.

---

## After Wave 1

Wave 2 scope (tentative, to confirm):

1. Migrate Dashboard cards (KPI tiles) to new tokens
2. Migrate Warehouses / Grain list + forms to new tokens + state primitives
3. Migrate Warehouses / Fuel similarly
4. Build first **marginality dashboard** component (key €100M differentiator vs SAS Agro)
5. Bring CSV import into the shell

That's a separate pack, built after we see what Wave 1 surfaces.

---

## Questions before running?

Things to double-check before starting the agent:

1. Is `feat/full-redesign-v2` merged ready with Phase 0? (should be — PR #557 was merged)
2. Does `tech-debt #558` (zod v4 + @hookform/resolvers v5 incompat) need to be resolved first? **Decision:** no, the `as any` cast on `resolver` is carried forward into task-05. Task to clean up goes on the Wave 2 list.
3. Backend contract for `login` / `switchTenant` — confirm shape before starting. If uncertain, let the agent discover + log follow-ups.

Once those are green, start the agent.
