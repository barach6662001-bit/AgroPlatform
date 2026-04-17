# Wave 1.5 Wireframes — Role-based Dashboards

ASCII wireframes for each of the 4 role dashboards. These are the target layouts.

---

## 1. InvestorDashboard (SuperAdmin, CompanyAdmin)

This is the **money-shot**. What a potential investor sees when they're demoed the product.

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [SEASON BANNER — glow, pulse dot, current day counter, status]                       │
│                                                                                       │
│  СЕЗОН 2026                                   [+ Додати поля →]                      │
│  День 107 / 365                                                                      │
│  ● Задовільно · Загальний стан                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┬──────────────────────────┐
│ KPI: Total Revenue│ KPI: Margin       │ KPI: Active Fields│ KPI: NDVI Average        │
│ ₴12.84M           │ 34.2%             │ 47                │ 0.73                     │
│ +18.4% vs season  │ +4.1% +₴520K     │ 2340 ha total     │ -2.3% cloud cover        │
│ [sparkline green] │ [sparkline blue]  │ [sparkline purple]│ [sparkline amber]        │
└──────────────────┴──────────────────┴──────────────────┴──────────────────────────┘

┌────────────────────────────────────────────────────────┬────────────────────────────┐
│ NDVI FIELD MAP (3D, rotatable, clickable regions)       │ LIVE ACTIVITY FEED         │
│                                                         │                            │
│   [satellite imagery of fields,                         │  ● 2m ago                  │
│    NDVI color overlay,                                  │    Harvesting completed    │
│    animated cloud shadows,                              │    Field XRI-BOT-001       │
│    tractor markers with pulse dots,                     │    by Podolyanuk V.        │
│    weather widget in corner]                            │                            │
│                                                         │  ● 15m ago                 │
│   Legend:                                               │    GPS device synced       │
│   [NDVI color scale 0.0 - 1.0]                          │    CASE 310 tractor        │
│                                                         │                            │
│   Cultures:                                             │  ● 1h ago                  │
│   ● Sunflower · ● Wheat · ● Corn · ● Rapeseed          │    Invoice paid            │
│                                                         │    UAH 186,450 to contractor│
│                                                         │                            │
│                                                         │  [Show more ↓]             │
└────────────────────────────────────────────────────────┴────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┬──────────────────────────┐
│ COST PER HA       │ PROFIT PER HA     │ FUEL EFFICIENCY   │ TEAM PRODUCTIVITY        │
│ Semi-circle gauge │ Semi-circle gauge │ Large number +    │ Sparkline + top 3        │
│ 1.29k ₴           │ 60.40k ₴          │ arrow trend       │ performers               │
│ of 2.0k target    │ of 55k target     │ 2.3 l/ha          │ [avatars + numbers]      │
└──────────────────┴──────────────────┴──────────────────┴──────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────┐
│ MARGINALITY BY CULTURE                                                                │
│                                                                                       │
│  Pie chart (donut)                     Horizontal bar chart                          │
│  [multi-color per culture]             ● Sunflower  ──────────── +₴4.68M             │
│  Center: "Total: ₴12.84M"              ● Wheat      ────────── +₴2.26M                │
│                                        ● Corn       ────── +₴1.17M                    │
│                                        ● Rapeseed   ─── +₴0.86M                       │
│                                        ● Soy        ─ +₴0.42M                          │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### Rules
- Everything uses gradient mesh background
- All numbers use useCountUp on mount
- Hover on any KPI = glow intensifies, border accent brightens
- Field map clicks zoom into specific field
- Activity feed auto-updates every 30s (or on demand)
- Semi-circle gauges animate fill from 0 on mount
- Donut chart segments animate from 0 degrees to full

---

## 2. ManagerDashboard (Manager)

Operations-focused. Same aesthetic, different content priority.

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER: "Ранковий огляд · 17 квітня, 08:32"    [Генерувати звіт]                      │
└──────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┬──────────────────────────┐
│ Operations Today  │ Active Team       │ Equipment Online  │ Weather at Fields        │
│ 12                │ 8 / 10            │ 23 / 25           │ 18°C · Dry               │
│ 3 critical        │ Hryhorovych late  │ 2 needs service   │ +2 rain days this week   │
└──────────────────┴──────────────────┴──────────────────┴──────────────────────────┘

┌────────────────────────────────────────────────────────┬────────────────────────────┐
│ ACTIVE OPERATIONS (real-time)                           │ ALERTS & BLOCKERS          │
│                                                         │                            │
│  🟢 Harvesting                          Field XRI-BOT   │  🔴 Fuel low               │
│    Morgunok A. · CASE 310 · 67% done    12.3 t/h       │     WH-Silo-2 · 15% left   │
│                                                         │     [Order now →]          │
│  🟡 Fertilization                        Field HRY-PEN  │                            │
│    Podolyanuk V. · Amazone · 34% done   8.4 t/h        │  🟡 Contract expires       │
│                                                         │     Grain trader LLC       │
│  🟢 Spraying                             Field HOL-KRU  │     in 12 days             │
│    Lyzko Yu. · Challenger · 91% done    4.2 ha/h       │     [Review →]             │
│                                                         │                            │
│  [All operations (12) →]                                │                            │
└────────────────────────────────────────────────────────┴────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────┐
│ FIELD STATUS OVERVIEW                                                                 │
│                                                                                       │
│  Grid of mini field cards (3 rows × 6 cols):                                          │
│  ┌──────┬──────┬──────┬──────┬──────┬──────┐                                          │
│  │NDVI  │NDVI  │NDVI  │NDVI  │NDVI  │NDVI  │  Each card:                              │
│  │circle│circle│circle│circle│circle│circle│  - Field ID                               │
│  │XRI-01│XRI-02│HOL-03│HRY-04│MON-05│GOL-06│  - Culture color dot                      │
│  │Sunfl │Wheat │Corn  │Rape  │Soy   │Wheat │  - NDVI mini gauge                        │
│  │ 0.74 │ 0.68 │ 0.81 │ 0.62 │ 0.77 │ 0.71 │  - Status (active/fallow/harvested)       │
│  └──────┴──────┴──────┴──────┴──────┴──────┘                                          │
│  [Show all 47 fields →]                                                              │
└──────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┬────────────────────────────┐
│ TEAM PERFORMANCE TODAY                                  │ TASKS I NEED TO APPROVE    │
│                                                         │                            │
│  [Avatar] Podolyanuk V.      12.3 t/h  ⭐⭐⭐⭐⭐         │  [3] Operations pending    │
│  [Avatar] Migov V.           8.4 t/h   ⭐⭐⭐⭐         │  [2] Timesheets to sign    │
│  [Avatar] Morgunok A.        7.6 t/h   ⭐⭐⭐⭐         │  [1] Purchase request      │
│  [Avatar] Lyzko Yu.          5.1 t/h   ⭐⭐⭐           │                            │
│  [Avatar] No-driver          3.2 t/h   (unassigned)    │  [Review all →]            │
└────────────────────────────────────────────────────────┴────────────────────────────┘
```

---

## 3. WorkerDashboard (WarehouseOperator)

Dense, functional, no eye-candy hero. Goal: workers finish their tasks fast.

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ Мої завдання на сьогодні                        [Швидка дія: + Приймання]             │
└──────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┬──────────────────────────┐
│ Прийняти         │ Перемістити       │ Списати           │ Інвентаризація           │
│ 3 pending         │ 1 pending         │ 0                 │ Next: Friday             │
│ [→]               │ [→]               │                   │                          │
└──────────────────┴──────────────────┴──────────────────┴──────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────┐
│ MY WAREHOUSE STATE — WH-Silo-2                                                        │
│                                                                                       │
│  Dense table:                                                                         │
│  Batch ID    Culture      Qty (t)   Status    Last action           Actions          │
│  B-001       Sunflower    1240.5    Active    Yesterday · Receive   [+] [→] [−]      │
│  B-002       Corn         320.0     Active    2 days ago · Transfer [+] [→] [−]      │
│  B-003       Wheat        890.2     Reserved  1 week ago · Reserve  [+] [→] [−]      │
│  ...                                                                                   │
│  [All batches (42) →]                                                                 │
└──────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┬────────────────────────────┐
│ RECENT ACTIVITY (mine)                                   │ QUICK ACTIONS              │
│                                                         │                            │
│  2m ago · Received 12.5t Corn to B-042                 │  [+ Приймання]             │
│  15m ago · Transferred 8.0t Wheat B-001 → B-015         │  [↔ Переміщення]          │
│  1h ago · Reserved 340t Sunflower B-003                 │  [− Списання]              │
│  3h ago · Started shift                                  │  [≡ Інвентаризація]       │
│                                                         │  [📊 Денний звіт]           │
└────────────────────────────────────────────────────────┴────────────────────────────┘
```

**Key difference:** WorkerDashboard doesn't have the animated hero / glossy gradients on content. It keeps the design-system tokens (still uses accent colors for buttons), but prioritizes functional density. No sparklines, no glow, no noise textures on main area — just clean tables.

(The shell is the same across all roles — sidebar/topbar stay glossy.)

---

## 4. FinanceDashboard (Accountant)

Financial focus. Tables heavy but still polished.

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ Фінансовий огляд · Q2 2026                     [Завантажити Excel] [Фільтри]         │
└──────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┬──────────────────────────┐
│ Cash In           │ Cash Out          │ Net Margin        │ Overdue Receivables      │
│ ₴8.42M            │ ₴5.61M            │ 33.4%             │ ₴342K (3 invoices)       │
│ +2.1% vs Q1       │ -5.6% vs Q1       │ +3.2pp            │ oldest 12 days           │
└──────────────────┴──────────────────┴──────────────────┴──────────────────────────┘

┌────────────────────────────────────────────────────────┬────────────────────────────┐
│ CASHFLOW TREND (12 months, area chart with gradient)    │ ACCOUNTS PAYABLE           │
│                                                         │                            │
│  [SVG area chart, smooth curve,                         │  Contractor  Amount  Due   │
│   gradient fill from green-600 to transparent,          │  Syngenta    ₴120K   3d   │
│   hover dots show exact values]                         │  Ukrnafta    ₴85K    7d   │
│                                                         │  BASF        ₴62K    14d  │
│                                                         │  ...                       │
│                                                         │  [All (23) →]             │
└────────────────────────────────────────────────────────┴────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────┐
│ MARGINALITY BY FIELD                                                                  │
│                                                                                       │
│  Dense table, sortable, filterable, with horizontal progress bars in rows:            │
│                                                                                       │
│  Field ID     Culture    Area    Cost/ha   Revenue    Profit    Margin%  [progress]  │
│  XRI-BOT-001  Sunflower  96.06   5.49k     9.26M     4.68M     50.5%    ████████    │
│  HOL-KRU-004  Corn       181.50  2.12k     9.26M     4.80M     51.8%    ████████    │
│  ...                                                                                  │
│  Total        47 fields  2340    [avg]     ₴12.84M   ₴4.39M    34.2%   ███████      │
└──────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┬────────────────────────────┐
│ COST CATEGORIES (pie + legend)                          │ UPCOMING PAYMENTS           │
│                                                         │                            │
│  🟢 Fuel 29.2%                                         │  Tomorrow   ₴42K wages     │
│  🔵 Fertilizers 18.5%                                  │  Apr 20     ₴120K loan     │
│  🟡 Seeds 14.3%                                        │  Apr 23     ₴85K fuel      │
│  🟣 Labor 21.1%                                        │                            │
│  🟠 Chemicals 9.8%                                     │  [Calendar view →]         │
│  ⚫ Other 7.1%                                         │                            │
└────────────────────────────────────────────────────────┴────────────────────────────┘
```

---

## Rules for all four

- **Shell stays same** (sidebar, topbar from Wave 1)
- **Content area** auto-adapts by role
- **First render**: show shimmer skeleton matching layout
- **On data load**: animate counters up, animate charts from 0
- **Empty states**: match rich 21st.dev empty state components, not basic
- **Loading states**: shimmer skeletons, not simple spinners
- **Mobile**: all grids collapse to single column, sparklines resize, charts stack

## Component map (magic MCP search queries)

Use these queries when searching magic MCP:

| Component | Query |
|---|---|
| Season banner | "hero banner with gradient glow and stats" |
| KPI card with sparkline | "metric card with sparkline chart and trend indicator" |
| Semi-circle gauge | "radial progress gauge semi circle" |
| Field map with overlay | "map component with overlay markers and legend" |
| Live activity feed | "activity feed timeline with avatars and timestamps" |
| Donut chart | "donut chart with custom colors and center label" |
| Stat comparison | "comparison chart horizontal bar with labels" |
| Operations list | "real-time list with status badges and progress" |
| Field grid cards | "compact card grid with icon and mini gauge" |
| Rich empty state | "empty state illustration with action button" |
| Shimmer skeleton | "skeleton loading animation shimmer" |
| Cashflow area chart | "area chart with gradient fill and hover tooltip" |
| Data table | "sortable data table with inline progress bars" |

If first query fails, try variations — add "dark mode", add framework name ("react tailwind"), add stylistic terms ("glassmorphism", "neumorphism", "modern").
