# Wave 1.5 Pack — 21st.dev-grade Dashboards

## What this is

A complete, agent-executable task pack for redesigning AgroPlatform dashboards to 21st.dev visual quality. Every visual component must come from the **magic MCP (21st.dev)** — the agent is forbidden from writing components from scratch (except as last resort after 3 failed magic searches).

**Scope:** Dashboard content only. Wave 1 shell (sidebar, topbar, user menu, command palette) stays untouched.

**Output:** 4 role-aware dashboards:
- **Investor** (SuperAdmin, CompanyAdmin, Viewer) — glossy, money-shot
- **Manager** — operations-focused
- **Worker** (WarehouseOperator) — dense, functional
- **Finance** (Accountant) — financial-focused

## How to use

### 1. Drop into repo

```bash
# From your AgroPlatform root:
cd /workspaces/AgroPlatform
git checkout feat/full-redesign-v2   # or create if missing
# copy everything from agents/wave-1-5/ in this zip to agents/wave-1-5/ in repo
```

### 2. Verify prerequisites

```bash
claude mcp list
# Must show:
#   magic     ✓ Connected
#   context7  ✓ Connected
#   playwright ✓ Connected
```

### 3. Launch the agent

```bash
cd /workspaces/AgroPlatform
claude --dangerously-skip-permissions
```

Then paste the prompt below.

---

## Agent prompt (paste this into Claude Code)

```
You are executing Wave 1.5 — 21st.dev-grade dashboard redesign for AgroPlatform.

### Critical rules (non-negotiable)

1. Read `agents/wave-1-5/AGENT_BRIEFING.md` IN FULL before doing anything else.
2. Then read in order: AESTHETIC.md, WIREFRAMES.md, USER_FLOWS.md, MAGIC_CHEATSHEET.md.
3. EVERY visual component MUST come from 21st.dev via the magic MCP. Do NOT write visual components from scratch. If magic MCP doesn't return what you need, search with different queries up to 3 times. Only on a 3rd failure, fall back to writing it yourself following AESTHETIC.md tokens.
4. Execute tasks in order: task-00 → task-01 → ... → task-11. Do not skip.
5. After each task: commit + push, take Playwright screenshots, append entry to _progress.md with which magic MCP components were used.
6. If any step fails or is ambiguous: STOP and write a failure report in _progress.md, don't continue.
7. Don't touch the Wave 1 shell (Sidebar, Topbar, UserMenu, CommandPalette, auth pages). Only change dashboard CONTENT.
8. Branch: feat/full-redesign-v2 (should be checked out already).
9. All new numbers animate via useCountUp on mount. All numeric displays have tabular-nums.
10. At the end of task-11, open a PR against main.

Start by reading AGENT_BRIEFING.md, then execute task-00.
```

---

## What's in this pack

```
agents/wave-1-5/
├── AGENT_BRIEFING.md                Overall rules + the one critical rule (use magic MCP)
├── AESTHETIC.md                     Design tokens, gradients, shadows, animations, typography
├── WIREFRAMES.md                    ASCII wireframes for all 4 role dashboards
├── USER_FLOWS.md                    Role detection, data flows, polling intervals
├── MAGIC_CHEATSHEET.md              How to drive 21st.dev MCP effectively
├── _progress.md                     Agent appends here after each task
│
├── task-00-aesthetic-foundation.md         Tokens + useCountUp + framer-motion + force-dark
├── task-01-hero-components.md              Season banner + 4 KPI cards (via magic)
├── task-02-dashboard-router.md             Dashboard.tsx becomes role router
├── task-03-investor-dashboard.md           Full InvestorDashboard layout
├── task-04-field-map-3d.md                 NDVI satellite field map (Leaflet + Esri)
├── task-05-activity-feed.md                Live activity feed with staggered fade-in
├── task-06-finance-section.md              EBITDA + cost monitoring + payments
├── task-07-manager-dashboard.md            Operations-focused role view
├── task-08-worker-dashboard.md             Dense functional warehouse operator view
├── task-09-finance-dashboard.md            Accountant financial overview
├── task-10-empty-states-polish.md          Rich empty + shimmer states
└── task-11-playwright-qa-and-pr.md         17-screenshot sweep + PR
```

## What you get when done

- 4 distinct dashboards auto-selected by role
- Satellite field map with NDVI color overlay
- Live activity feed with pulse indicator
- Animated counters, glow hover states, gradient mesh backgrounds, noise textures
- Shimmer skeletons matching each layout
- Rich empty states per context
- All data hooks with mock fallback (works without backend endpoints)
- Playwright screenshots at 1440×900 and 390×844
- Single PR against main

## Expected duration

Based on Wave 1 (12 tasks in 19 min): **~25-35 min** autonomous execution.
Wave 1.5 is more visual/UI work and hits magic MCP a lot (network calls), so expect slower per-task.

## Follow-ups after Wave 1.5

- Backend endpoints for the 4 dashboards (hooks are typed, see each task file for shape)
- Mapbox GL upgrade with API key (replaces Leaflet for 3D terrain)
- Real Sentinel-2 NDVI integration (Wave 3)
- SignalR live activity (Wave 3)
- Light mode polish (Wave 2 — currently dark-first)
