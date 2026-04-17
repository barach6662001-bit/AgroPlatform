# Magic MCP Cheatsheet — How to Drive 21st.dev Effectively

**Audience:** Claude Code / autonomous agent
**Context:** User's repo has magic MCP (21st.dev) connected. Wave 1.5 REQUIRES every visual component to come from magic MCP first, written from scratch only as fallback.

---

## Tools the magic MCP exposes

Typical magic MCP tools (names may vary slightly by version):

1. **`21st_magic_component_inspiration`** — search for inspiration / browse trending components matching a description
2. **`21st_magic_component_builder`** — generate / install a specific component for your project
3. **`logo_search`** — find brand logos (if needed for investor dashboard partner logos)
4. **`21st_magic_component_refiner`** — iterate on existing component with feedback

**To see exact tool names in your environment**, call `tool_search` with `keywords: ["21st", "magic", "component"]` first. If the above names don't exist, use whatever magic MCP exposes.

---

## Search query patterns — WORDS MATTER

Bad queries (too generic):
- ❌ "card"
- ❌ "dashboard"
- ❌ "chart"

Good queries (visual DNA + function):
- ✅ "animated KPI card with sparkline and trend arrow"
- ✅ "glassmorphism stats grid with hover glow"
- ✅ "radial semi-circle progress gauge dark mode"
- ✅ "live activity feed with avatars and relative time"
- ✅ "agritech NDVI field map with culture legend"

### Structure your queries

```
[visual adjective] + [component type] + [key feature] + [style modifier]
```

Examples:
- "gradient hero section with animated number counter modern dark"
- "minimal metric card with sparkline tailwind shadcn"
- "flashy dashboard tile with glow border on hover"

### If first query returns nothing useful, escalate:

1. **Remove adjectives**: "hero section with animated counter"
2. **Add framework**: "react tailwind hero section"
3. **Add stylistic reference**: "stripe-style stats card" / "linear-style activity feed"
4. **Go simpler**: "stats card"

---

## Workflow per component

```
Step 1. Search
  → 21st_magic_component_inspiration with descriptive query

Step 2. Review
  → Look at 3-5 returned components
  → Pick one matching WIREFRAMES.md layout
  → Pick one matching AESTHETIC.md aesthetics (gradient/glow/animation DNA)

Step 3. Install
  → 21st_magic_component_builder with the component reference
  → Follow install instructions (usually places files in src/components/ui/ or similar)
  → Check for new dependencies in package.json (install if needed)

Step 4. Adapt
  → Rename component to match project convention (PascalCase, e.g., MetricCard → InvestorKPICard)
  → Replace dummy data with real props
  → Apply tokens from AESTHETIC.md (colors, spacing, animations)
  → Keep visual DNA intact (don't strip away gradients/glow — that's why we picked 21st.dev)

Step 5. Integrate
  → Import into the page (e.g., pages/InvestorDashboard.tsx)
  → Wire to data source (authStore / react-query / Zustand)
  → Test in dev
```

---

## Common failures and fixes

### "Magic MCP returned nothing useful"
→ **Try 2 more queries** with different wording. If 3rd fails:
→ Check `context7` for similar patterns in shadcn docs
→ Only then write from scratch, following AESTHETIC.md strictly

### "Magic MCP installed a file with hardcoded colors"
→ Open the file
→ Replace all hex colors with `var(--accent-*)` tokens from AESTHETIC.md
→ Replace all fontSize/fontWeight with token classes

### "Magic MCP component uses a library we don't have"
→ Check package.json for alternatives:
  - framer-motion → if not installed, add it (`npm install framer-motion`)
  - recharts → already installed
  - lucide-react → already installed
  - @radix-ui/* → selectively install if missing primitives
→ If the library is heavy (>500KB), look for lighter alternative via another magic search

### "Component is too complex (500+ lines)"
→ Split into sub-components
→ Keep only the visual structure, strip business logic
→ Re-apply our own state management via props

### "Component doesn't match our data shape"
→ Add adapter layer — map your real data to the component's expected props
→ Don't fight the component's shape, translate instead

---

## Rules for installed 21st components

Every 21st component installed must be:
1. **Dark-mode compatible** — if it comes light-only, add dark variants using CSS vars
2. **Token-driven** — no raw hex, no raw px for text sizes
3. **Animated** — if it's static (no hover/mount animation), add at least hover glow + mount fade-in
4. **Accessible** — keyboard navigable, aria labels, focus rings
5. **Tabular-num where numeric** — any displayed number uses `font-variant-numeric: tabular-nums`

---

## When 21st component is better than custom

21st is almost always better than custom when it comes to:
- Gradient backgrounds (they've got the good ones)
- Glow/shadow effects (industry-tested formulas)
- Hover micro-animations (feels "alive")
- Loading states (shimmer done right)
- Empty states (rich illustrations, not just "no data")
- Navigation patterns (sidebars, tabs, breadcrumbs)
- Activity feeds (avatar + relative time + event)

Custom is fine for:
- Pure data tables with many columns (no flashy needed)
- Forms with complex validation
- Business-specific widgets (like field map — partially custom)

---

## Track what you installed

Every task's `_progress.md` entry MUST list:
- Which magic MCP components were used
- Which were written custom (with reason)

Example:
```
## task-01 — hero components
- Completed: 2026-04-17 14:22 UTC
- Commit: abc123
- Magic components used:
  - 21st/animated-metric-card (for KPI grid)
  - 21st/gradient-hero-banner (for season banner)
  - 21st/sparkline-inline (adapted to recharts since installed)
- Custom written: none
- Screenshots: docs/screenshots/wave-1-5/task-01-{light,dark}.png
```

If "Custom written" appears for a component that should have come from 21st, justify with "3 queries failed: [list queries]".
