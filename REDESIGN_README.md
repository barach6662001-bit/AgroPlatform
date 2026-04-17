# AgroPlatform Redesign — Phase 0 Package

Starter pack for the shadcn/ui + Tailwind migration. Drop-in ready for Codespace.

## What's in here

```
agroplatform-redesign/
├── design-system/
│   ├── DESIGN_SYSTEM.md       ← visual law (tokens, typography, anti-patterns)
│   ├── MIGRATION_PLAN.md      ← AntD → shadcn strategy + component mapping
│   ├── tokens.css             ← canonical CSS variables (copy to src/styles/)
│   └── tailwind.config.ts     ← production Tailwind config
│
└── agents/phase-0/
    ├── AGENT_BRIEFING.md      ← start here (for Claude Code)
    ├── task-00-discover-and-branch.md
    ├── task-01-install-tailwind.md
    ├── task-02-init-shadcn.md
    ├── task-03-install-fonts.md
    ├── task-04-write-design-tokens.md
    ├── task-05-configure-tailwind.md
    ├── task-06-install-primitives.md
    ├── task-07-install-data-components.md
    ├── task-08-install-overlays.md
    ├── task-09-install-forms.md
    ├── task-10-install-datepicker.md
    ├── task-11-configure-dark-mode.md
    ├── task-12-preview-route.md
    ├── task-13-coexistence-and-lint.md
    └── task-14-final-qa-and-pr.md
```

## How to use

### 1. Drop into the repo

From the agroplatform repo root:

```bash
# assuming this zip is extracted at /tmp/agroplatform-redesign
cp -r /tmp/agroplatform-redesign/design-system ./
cp -r /tmp/agroplatform-redesign/agents ./agents
git add design-system agents
git commit -m "docs(design-system): phase 0 blueprint + agent tasks"
git push
```

### 2. Set up MCP servers in Codespace

Required before running tasks:

```bash
# Official shadcn MCP (primary)
claude mcp add --scope project shadcn https://ui.shadcn.com/mcp

# Chrome DevTools MCP (visual iteration)
claude mcp add --scope project chrome-devtools npx chrome-devtools-mcp

# 21st.dev Magic can stay for landing blocks later — not needed for phase 0
```

Verify with `/mcp` in Claude Code.

### 3. Point Claude Code at the briefing

Open Claude Code and paste:

```
Read /agents/phase-0/AGENT_BRIEFING.md, then execute every task file in order
from task-00 to task-14. After each task, verify acceptance criteria, run the
Git block exactly as written, and append to _progress.md. If anything fails,
stop and report — do not skip or improvise.
```

### 4. Monitor

Each task does `git push` at the end. You can follow along on GitHub. If a task
fails, the agent stops — you fix or unblock, then resume with:

```
Continue from task-NN.
```

### 5. Merge

Task 14 opens the PR. Review it, merge, move to Wave 1.

## What happens after Phase 0

Phase 0 is **foundation only**. Zero existing screens are migrated. When this
PR merges:

- Every old AntD screen looks exactly the same
- The `/__design-system` preview route shows the new design language
- New code must use shadcn (ESLint enforces this)

**Wave 1** (next phase, not in this package) migrates the app shell — sidebar,
topbar, auth. That's where the product visibly changes. Expect 1–2 weeks for
Wave 1.

## Design decisions (summary)

- **Aesthetic:** Palantir / Retool — data-density, quiet confidence
- **Stack:** shadcn/ui (new-york style) + Tailwind + IBM Plex Sans/Mono
- **Colors:** neutral-first (zinc greyscale) + one deep agri-green accent
- **Body size:** 13px base (dense, enterprise) — not 16px
- **Radii:** 2/4/6 px max — no `rounded-2xl`
- **Elevation:** borders over shadows
- **Dark mode:** first-class, toggled via `.dark` class + next-themes

Full rationale in `design-system/DESIGN_SYSTEM.md`.

## Total scope

- 15 agent tasks
- ~6–10 hours of Claude Code execution (with review gates)
- ~25 shadcn primitives installed
- ~8 new dependencies (tailwind, shadcn deps, rhf, zod, date-fns, tanstack-table, fontsource, next-themes)
- Zero breaking changes to existing code

## Escalate if

- An agent task fails with ambiguous errors
- A token value looks wrong in practice
- Bundle size jumps > 200KB (investigate before proceeding)
- Any legacy AntD screen visually breaks after token CSS loads
