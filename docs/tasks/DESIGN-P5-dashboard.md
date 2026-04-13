# DESIGN-P5: Dashboard Redesign

> Reference: `docs/design-system.md` sections 4, 5 (Dashboard)
> Depends on: DESIGN-P1, DESIGN-P2 (KpiCard component)
> Scope: Fix Dashboard KPI data + redesign layout

---

## Steps

### Step 16: Fix Dashboard KPI Data

The Dashboard currently shows "Витрати за місяць: 0.00 ₴", "Дохід за місяць: 0.00 ₴", "Прибуток: 0.00 ₴" because demo data is from past months and the filter shows current month only.

**Option A (preferred — backend):** Edit the Dashboard API call or the analytics endpoint to return "за сезон" (full year 2026) instead of "за місяць". Find the API call in `frontend/src/pages/Dashboard.tsx` or `frontend/src/api/analytics.ts`. Change the date range filter to cover the full demo data range (Jan-Apr 2026).

**Option B (frontend fallback):** If the API call accepts date params, change them to: `startDate: '2026-01-01'`, `endDate: '2026-12-31'`. Update the KPI label from "за місяць" to "за сезон 2026".

Expected correct values (from demo data):
- Загальна площа: 350.5 га
- Загальні витрати: ~558,990 UAH (або ~1,069,510 including all categories)
- Дохід: ~5,382,000 UAH
- Прибуток: ~4,823,010 UAH

### Step 17: Redesign Dashboard Layout

Edit `frontend/src/pages/Dashboard.tsx`.

**New layout structure (top to bottom):**

**Row 1 — Page header:**
```
Головна панель                               [Сезон: 2026 ▾]
Зведення по всьому підприємству
```
- Title: 22px semibold
- Subtitle: 13px muted
- Optional: season selector dropdown, right-aligned

**Row 2 — KPI Cards (use KpiCard from P2):**
```
[Загальна площа]  [Витрати за сезон]  [Дохід за сезон]  [Прибуток ★ hero]
  350.5 га          558,990 UAH        5,382,000 UAH     4,823,010 UAH
                    ↑ vs мин. сезону   ↑ vs мин. сезону  маржа: 89.6%
```
- CSS Grid: `grid-template-columns: 1fr 1fr 1fr 1.5fr` (Прибуток wider)
- Gap: 16px
- Прибуток card: `hero={true}`

**Row 3 — Alert Banner (if any alerts):**
```
⚠ 1 одиниця техніки на ремонті  ·  ⏱ 2 незавершених операцій     [Переглянути →]
```
- Single row, full width
- Background: rgba(245,158,11,0.06)
- Border: 1px solid rgba(245,158,11,0.15)
- Border-radius: 8px
- Padding: 10px 16px
- Icon: AlertTriangle from Lucide, 16px, color #F59E0B
- Text: 13px, color var(--text-primary)
- Link: "Переглянути →", color var(--color-primary)
- If no alerts: don't render this row

**Row 4 — Chart: Витрати vs Дохід по місяцях**
```
[===== Full width area/bar chart, 280px height =====]
```
- Full width card
- Title inside card: "Витрати vs Дохід по місяцях" — 14px semibold
- Chart type: Recharts AreaChart or ComposedChart
- Two series: Витрати (red/coral area, fill gradient down to transparent) + Дохід (green area, fill gradient)
- Height: 280px
- X axis: months (Січ, Лют, Бер, Кві, ...)
- Y axis: formatted UAH values with space separators
- Grid: horizontal only, dashed, rgba(255,255,255,0.04)
- Tooltip: dark themed (see design-system.md)
- If no chart data from API, use a simple placeholder or skip this row

**Row 5 — Two columns (60/40 split):**

Left (60%): **Стан полів** table
- Use DataTable component
- Columns: Назва, Поточна культура (StatusBadge), Площа (га)
- Compact rows, 40px height
- Max 7 rows, no pagination needed
- Card wrapper with title "Стан полів" 14px semibold

Right (40%): **Останні операції** timeline
- Keep existing timeline format (it's actually good)
- Restyle items: remove green circle backgrounds, use StatusBadge for "Завершена"
- Each item: operation name (14px), field name (12px muted), date (12px muted right-aligned), status badge
- Card wrapper with title "Останні операції" 14px semibold
- Max 7 items, link "Показати всі →" at bottom

**Row 6 — Quick Actions (compact):**
```
[📝 Записати операцію] [⛽ Видати паливо] [🌾 Прийняти зерно] [💰 Записати витрату]
```
- Horizontal flex row, NOT 4 separate cards
- Each item: icon (Lucide, 18px) + label (13px), padding 10px 16px, gap 12px
- Background: var(--color-card-bg), border: 1px solid var(--border-default), border-radius: 8px
- Hover: border-color var(--border-hover), background var(--color-hover-bg)
- Total height: ~48px per action
- Icons: differentiated by color:
  - Записати операцію: icon Clipboard, color #3B82F6
  - Видати паливо: icon Fuel, color #F59E0B
  - Прийняти зерно: icon Wheat, color #22C55E
  - Записати витрату: icon Receipt, color #8B5CF6

**Remove or move down:**
- "Стрічка активності" section — move to bottom or remove if it adds no value

### Step 18: Add CountUp Animation to KPI

Install: `npm install react-countup`

In KpiCard component, wrap the numeric value with `<CountUp>`:
- Duration: 800ms
- Easing: easeOutCubic
- Only animate on first mount (not on re-renders)
- For non-numeric values (like "350.5 га"): parse the number part, animate it, append the unit

```tsx
import CountUp from 'react-countup';

// Inside KpiCard:
<CountUp
  end={numericValue}
  duration={0.8}
  separator=" "
  decimal=","
  decimals={decimals}
  suffix={suffix}
/>
```

---

## Verification

1. `npx tsc --noEmit` — pass
2. `npm run build` — pass
3. Dashboard KPI values are NOT zero — show real demo data
4. KPI numbers animate on page load
5. Alert banner appears with machinery/operations warnings
6. Quick actions are compact horizontal row, not large cards
7. Прибуток KPI card has gradient top border (hero style)
