# Wave 1.5 Agent Briefing — The 21st.dev Redesign

**Audience:** Claude Code (autonomous execution)
**Goal:** Redesign all page content (Dashboard + key modules) to look like a **2026 YC-grade SaaS product**. Gradients, glow, animated counters, noise textures, liquid interactions. Level up past SAS Agro / FarmingOS (the direct competitor — user wants to outshine them visually).

**Branch:** `feat/full-redesign-v2` (continue on this branch, already checked out)
**Frontend:** `./frontend`
**Autopilot:** `claude --dangerously-skip-permissions`

---

## THE SINGLE MOST IMPORTANT RULE

> **EVERY visual component MUST be sourced from 21st.dev through the `magic` MCP server. Do NOT write raw CSS for visual components. Do NOT invent components from scratch. If magic MCP doesn't have what you need, you search harder with different queries. Only if 3+ searches fail do you fall back to writing it yourself.**

This is the #1 rule because the previous attempt (Wave 1) failed visually — agent wrote sterile Palantir-style components by hand. Wave 1.5 MUST use 21st.dev's showcase components which have the gradient/glow/animation DNA the user wants.

### How to use magic MCP

The magic MCP exposes tools for fetching 21st.dev components. Your workflow for EVERY component:

1. **Search magic MCP** with a descriptive query:
   - "hero section with gradient mesh and animated counter"
   - "stats card with glow on hover"
   - "dashboard kpi cards grid"
   - "live activity feed with avatars"
   - "feature grid with icons and hover effects"
2. **Review returned components** — pick the one that best matches WIREFRAMES.md
3. **Install the component** — follow magic MCP's install instructions (usually copies files into `src/components/ui/` or a similar path)
4. **Adapt** — rename, wire to real data, adjust props. Keep the visual DNA.

### When magic fails

If after 3 different search queries you still don't find the component:
1. Check `context7` MCP for Tailwind/shadcn documentation
2. Look at existing 21st.dev components already installed for patterns
3. ONLY THEN write it yourself, but follow these tokens (see AESTHETIC.md)

### Anti-patterns (DON'T DO)

- ❌ Writing a KPI card from scratch before searching magic MCP
- ❌ Using flat backgrounds (must have gradient mesh / subtle texture)
- ❌ Using plain white/gray cards (must have gradient borders or glow)
- ❌ Showing static numbers (must animate on mount via useCountUp)
- ❌ Using AntD-era layouts (you have shadcn + Tailwind, use them)
- ❌ Removing Wave 1 shell (sidebar, topbar, user menu — leave untouched)
- ❌ Skipping `search_mcp` for a component just because you think you can write it

---

## Context from previous waves

### What's done (don't touch)
- **Phase 0**: shadcn/ui primitives, tokens.css, theme system, IBM Plex fonts, dark mode
- **Wave 1 (shell)**: Sidebar, Topbar, UserMenu, TenantSwitcher, CommandPalette (⌘K), KeyboardShortcutsModal (⌘/), Login, SelectTenant, ChangePassword, MobileDrawer, 404/403/500 pages, State primitives (EmptyState/LoadingState/ErrorState)

### What failed visually (this wave fixes)
- Dashboard content looks sterile, empty, "2001 year"
- KPIs are flat text like "0.00 млн ₴" — no hierarchy, no animation
- Synthetic season banner had off-brand blue gradient
- Cards have no glow, no gradient borders, no hover states
- Typography has no premium feel
- Background is flat black — no mesh, no noise

### What we're competing against
SAS Agro / FarmingOS (sasagro.com) — user's direct competitor:
- Black bg + white bold headings
- KPI top-row on every screen (4-6 cards)
- Vertical nav with category icons (left) + culture icons (right)
- Semi-circle gauges for "Cost per hectare", "Profit per hectare"
- Multi-color donut charts per culture (yellow=sunflower, green=wheat, pink=rapeseed, blue=corn...)
- Horizontal progress bars in tables (plan vs fact)
- Dense but readable

We copy their content structure but add 21st.dev layer on top: gradients, glow, animated counters, 3D map, liquid transitions, noise textures, shimmer skeletons. Goal: same functional density, but feels 5 years ahead.

---

## Execution rules

### Per-task workflow
1. Read the task file in full
2. Read WIREFRAMES.md section referenced in the task
3. Read AESTHETIC.md for visual tokens
4. Start with magic MCP search for the component(s) needed
5. Install + adapt them
6. Run verification
7. Take Playwright screenshots (light + dark, at least)
8. Run Git block
9. Append to _progress.md
10. Next task

### Escalation (STOP and ask)
- Any 3rd magic MCP query fails → write failure report, do not proceed
- Required real data endpoint doesn't exist → stub with realistic mock data + log as backend follow-up
- Backend role-detection API differs from assumed shape → adapt but log in _progress.md
- Any visual change that might break Wave 1 shell → STOP, ask

### Branch/commit rules
- Stay on `feat/full-redesign-v2`
- Commit + push after EVERY task (not batched)
- Commit format: `feat(dashboard): <what>` or `style(tokens): <what>`
- Include `Task: wave-1-5/task-NN` trailer

### Role-based Dashboard rendering
Per user decision: **auto by role**, no toggle.
- SuperAdmin, CompanyAdmin → **Investor View** (glossy, gradient-rich, animated, NDVI map, financial highlights, live feed)
- Manager → **Manager View** (same Investor aesthetic but operational focus — fields list, active operations, team status)
- WarehouseOperator → **Worker View** (dense tables, quick actions, no eye-candy hero section)
- Accountant → **Finance View** (financial KPIs, invoices, marginality tables — dense)

Implementation: `frontend/src/pages/Dashboard.tsx` becomes a router that renders one of:
- `<InvestorDashboard />`
- `<ManagerDashboard />`
- `<WorkerDashboard />`
- `<FinanceDashboard />`

Based on `authStore.user.role`.

---

## Task order

```
task-00-aesthetic-foundation.md        — new design tokens, backgrounds, typography
task-01-hero-components.md             — KPI hero grid, season banner, animated counters (via magic)
task-02-dashboard-router.md            — role-based Dashboard.tsx router
task-03-investor-dashboard.md          — full InvestorDashboard view (hero + map + feed + finance)
task-04-field-map-3d.md                — NDVI field map with 3D/parallax effect (via magic)
task-05-activity-feed.md               — live activity feed with avatars (via magic)
task-06-finance-section.md             — marginality + cost monitoring cards (via magic)
task-07-manager-dashboard.md           — Manager role view (operations-focused)
task-08-worker-dashboard.md            — Worker role view (dense, functional)
task-09-finance-dashboard.md           — Accountant role view
task-10-empty-states-polish.md         — replace generic EmptyState with 21st-dev rich empty states
task-11-playwright-qa-and-pr.md        — full screenshot sweep, fix regressions, open PR
```

---

## Definition of done

Wave 1.5 is complete when:
- All 12 tasks are ✅ in `_progress.md`
- Every page content area uses components sourced from magic MCP (logged in `_progress.md`)
- `/dashboard` auto-renders one of 4 role views based on login
- InvestorDashboard has: glossy hero, animated counters, NDVI map, activity feed, finance section
- Screenshots captured for all 4 role dashboards (light + dark)
- `npm run build` passes
- Bundle delta acceptable (+50KB JS ok if 21st components added animations/effects)
- PR opened against main titled `feat(dashboard): Wave 1.5 — 21st.dev-grade dashboards`

---

## Critical file list to read before starting

After reading this file, in order:
1. `agents/wave-1-5/AESTHETIC.md` — color tokens, gradients, shadows, animations
2. `agents/wave-1-5/WIREFRAMES.md` — layout for each role's dashboard
3. `agents/wave-1-5/USER_FLOWS.md` — what clicks where, role detection, data flows
4. `agents/wave-1-5/MAGIC_CHEATSHEET.md` — how to drive magic MCP effectively

Then start `task-00`.
