# DESIGN-P7: i18n & Data Fixes

> Depends on: DESIGN-P2 (KpiCard) for proper display
> Scope: Fix all localization issues, broken KPIs, missing data. Backend seed changes if needed.

---

## Steps

### Step 23: Fix Cost Category i18n

**Problem:** Cost categories appear in English ("Fuel", "Seeds", "Labor", "Fertilizer", "Pesticide", "Machinery") on analytics pages and budget page, even though UI is in Ukrainian.

**Solution:** Create or update a category label mapping.

Find where cost categories are rendered. Likely approaches:
- Categories come from API as English enum strings
- Frontend renders them directly without translation

**Create mapping** in `frontend/src/i18n/` or in a new util file `frontend/src/utils/categoryLabels.ts`:

```typescript
export const costCategoryLabels: Record<string, string> = {
  // English keys → Ukrainian labels
  'Fuel': 'Пальне',
  'fuel': 'Пальне',
  'Seeds': 'Насіння',
  'seeds': 'Насіння',
  'Labor': 'Праця',
  'labor': 'Праця',
  'Fertilizer': 'Добрива',
  'fertilizer': 'Добрива',
  'Fertilizers': 'Добрива',
  'Pesticide': 'Пестициди',
  'pesticide': 'Пестициди',
  'Pesticides': 'Пестициди',
  'Machinery': 'Техніка',
  'machinery': 'Техніка',
  'Equipment': 'Обладнання',
  'equipment': 'Обладнання',
  'Other': 'Інше',
  'other': 'Інше',
  'Lease': 'Оренда',
  'lease': 'Оренда',
  'Rent': 'Оренда',
  'rent': 'Оренда',
};

export function getCategoryLabel(key: string): string {
  return costCategoryLabels[key] || key;
}
```

**Apply in all files that render categories:**
- `frontend/src/pages/Economics/CostAnalytics.tsx` — pie chart labels, table "КАТЕГОРІЯ" column, chart legend
- `frontend/src/pages/Economics/BudgetPage.tsx` — category column in budget table
- `frontend/src/pages/Economics/CostRecords.tsx` — category summary cards at top, table category column
- `frontend/src/pages/Analytics/` — any analytics using cost categories
- Any Recharts data that uses category as label

Search for all places that render category strings and wrap with `getCategoryLabel()`.

Also check the i18n files `frontend/src/i18n/uk.ts` and `frontend/src/i18n/en.ts` — add category translations there if the app uses the i18n system for this.

### Step 24: Fix Sales Page KPIs

Edit `frontend/src/pages/Sales/SalesList.tsx`.

**Current bugs:**
- "Загальна сума продажів" shows `5` (count instead of sum)
- "Загальна кількість" shows `$695.00` (unclear metric)

**Fix to 4 KPI cards using KpiCard component:**

```tsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
  <KpiCard
    label="Загальний дохід"
    value={formatUAH(totalRevenue)} // sum of all sale amounts: 540000+1560000+1102000+1100000+1080000 = 5,382,000
    trend="up"
  />
  <KpiCard
    label="Кількість угод"
    value={salesCount} // 5
  />
  <KpiCard
    label="Середній чек"
    value={formatUAH(totalRevenue / salesCount)} // ~1,076,400
  />
  <KpiCard
    label="Загальний обсяг"
    value={`${totalTons} т`} // 75+80+190+200+150 = 695 т
  />
</div>
```

Find where `totalRevenue` is calculated. It's likely summing the wrong field or counting rows instead of summing amounts. Fix the calculation:
- `totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0)` (or whatever the amount field is called)
- `totalTons = sales.reduce((sum, s) => sum + s.quantity, 0)`

### Step 25: Fix Audit Log — Resolve User UUIDs

Edit `frontend/src/pages/Admin/AuditLogPage.tsx` (or `Settings/AuditLogPage.tsx`).

**Current:** USER column shows raw UUID like `c3573023-3402-4e68-ae2e-0785b24fa9eb`.

**Fix options:**

**Option A (preferred — API join):** If the audit log API endpoint can include user details, request that the backend joins user email/name. Check `frontend/src/api/audit.ts` for the API call. If the response already includes user email but it's not displayed, update the column render.

**Option B (frontend lookup):** Fetch users list separately, create a map of `userId → userEmail`, and render the email in the column.

**Option C (minimal):** If only one user exists in demo, hardcode a fallback: if UUID matches known user, show "demo@agro.local (Адміністратор)".

The column render should show:
```tsx
{
  title: 'КОРИСТУВАЧ',
  dataKey: 'userId',
  render: (userId: string) => {
    const user = usersMap[userId];
    return user ? (
      <span>{user.email}</span>
    ) : (
      <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
        {userId.substring(0, 8)}...
      </span>
    );
  }
}
```

### Step 26: Fix Profile & Demo User Name

**Profile page** shows "Ім'я: —" and "Прізвище: —".

**Option A (backend seed):** Edit the demo user seed data to include:
- FirstName: "Олександр"
- LastName: "Петренко"
- Find the seed file, likely in `src/AgroPlatform.Infrastructure/` or `src/AgroPlatform.Api/` — search for `demo@agro.local` in the C# files.

**Option B (if seed is complex):** At minimum, update the Profile page to show "Адміністратор" or the email instead of "—" when name is empty:

```tsx
// Instead of showing "—"
{firstName || email?.split('@')[0] || '—'}
```

### Step 27: Fix Fleet Map — Seed GPS Data

Edit the machinery seed data to include GPS coordinates for all 5 machines.

**Search for** the machinery seed file in the backend (search for "John Deere" or "Claas Lexion" in C# files).

**Add coordinates** (Poltava oblast, central Ukraine — realistic agro region):

| Machine | Latitude | Longitude |
|---------|----------|-----------|
| Трактор John Deere 8R 310 | 49.5894 | 34.5514 |
| Комбайн Claas Lexion 770 | 49.5712 | 34.5823 |
| Обприскувач Amazone UX 5200 | 49.5956 | 34.5201 |
| Сівалка Horsch Pronto 9 DC | 49.5834 | 34.5689 |
| КамАЗ 45143 (зерновоз) | 49.5778 | 34.5442 |

Also: set the fleet map default center to `[49.585, 34.555]` and zoom level 13 in the FleetMap component.

**Remove** the "Від'єднано" badge from the fleet map UI, or change it to "Демо-режим" or hide it entirely for demo.

---

## Verification

1. `npx tsc --noEmit` — pass
2. `npm run build` — pass
3. All cost categories display in Ukrainian on CostAnalytics, Budget, CostRecords pages
4. Sales KPIs: card 1 shows ~5,382,000 UAH (not "5"), card 2 shows count, etc.
5. Audit log: user column shows email, not UUID
6. Profile: shows name or email, not "—"
7. Fleet map: shows 5 markers in Poltava region, no "Від'єднано" badge
