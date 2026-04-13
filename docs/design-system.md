# AgroPlatform — Premium Design Transformation

---

## 1. DESIGN DIRECTION

**Визуальная концепция: "Command Center"**

Продукт должен ощущаться как mission-critical операционный центр агрохолдинга. Не админка. Не CRM. Это — control room, где каждый пиксель передаёт: «здесь управляют активами на миллионы».

**Референсы:** Linear (плотность + чистота), Vercel (контраст + типографика), Arc Browser (глубина + слои), Raycast (скорость + polish), Stripe Dashboard (данные + доверие).

**Ключевые характеристики:**

- **Плотность:** Высокая, но дышащая. Больше данных на экран, меньше пустых зон. Таблицы компактнее, KPI плотнее.
- **Контраст:** Агрессивный. Белый текст чётко читается. Акцентные цвета бьют. Границы тонкие, но видимые.
- **Характер:** Холодный профессионализм. Никакой игривости. Числа крупные. Шрифт — geometric sans.
- **Ощущение:** Открываешь — и сразу видишь деньги, гектары, тонны. Информация атакует, но структурировано.

---

## 2. GLOBAL UI TRANSFORMATION

### Типографика

- **Заменить Inter на Geist Sans** (или оставить Inter, но пересобрать scale)
- Display / hero числа: 600 weight, 32-40px, letter-spacing: -0.025em
- KPI values: 600 weight, 28-32px, tabular-nums, letter-spacing: -0.02em
- Table headers: 500 weight, 11px, uppercase, letter-spacing: 0.06em, color: rgba(255,255,255,0.45)
- Table body: 400 weight, 13px, color: rgba(255,255,255,0.85)
- Labels / secondary: 400 weight, 12px, color: rgba(255,255,255,0.5)
- Page title: 600 weight, 22px, color: #fff
- Page subtitle: 400 weight, 13px, color: rgba(255,255,255,0.4)

### Spacing система

- Базовый модуль: 4px
- Внутренний padding карточек: 20px
- Gap между карточками: 16px
- Section gap (между блоками на странице): 24px
- Sidebar item height: 36px (сейчас слишком высокий)
- Table row height: 44px (сейчас ~52px — слишком рыхло)

### Карточки (Cards)

- Background: rgba(255,255,255,0.03) — не rgba(255,255,255,0.06), текущий слишком светлый
- Border: 1px solid rgba(255,255,255,0.06)
- Border-radius: 12px
- НЕТ box-shadow по умолчанию
- Hover: border-color → rgba(255,255,255,0.12), transition 150ms ease
- Добавить subtle gradient: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)

### Кнопки

- Primary: background: linear-gradient(180deg, #22C55E 0%, #16A34A 100%), height: 36px, border-radius: 8px, font-weight: 500, font-size: 13px, NO green glow
- Primary hover: brightness(1.1), translateY(-0.5px)
- Secondary / Ghost: background: rgba(255,255,255,0.06), border: 1px solid rgba(255,255,255,0.1), color: rgba(255,255,255,0.8)
- Danger: background: transparent, border: 1px solid rgba(239,68,68,0.3), color: #EF4444
- Icon buttons: 32×32px, border-radius: 8px, background: transparent, hover: rgba(255,255,255,0.06)
- Убрать Ant Design default зелёную pill-кнопку. Она выглядит как Android 2012.

### Таблицы

- Header: background: rgba(255,255,255,0.02), border-bottom: 1px solid rgba(255,255,255,0.08), NO background на header cells
- Header text: 11px, uppercase, letter-spacing: 0.06em, font-weight: 500, color: rgba(255,255,255,0.4)
- Row: border-bottom: 1px solid rgba(255,255,255,0.04)
- Row hover: background: rgba(255,255,255,0.03), transition: 100ms
- Row selected: background: rgba(34,197,94,0.06), border-left: 2px solid #22C55E
- Cell padding: 12px 16px
- Убрать vertical column borders (сейчас таблицы выглядят как Excel)
- Zebra striping: НЕТ. Только hover.
- Action buttons в строке: ghost icon-only, появляются только на hover строки

### Формы

- Input height: 36px
- Input background: rgba(255,255,255,0.04)
- Input border: 1px solid rgba(255,255,255,0.1)
- Input focus: border-color: #22C55E, box-shadow: 0 0 0 3px rgba(34,197,94,0.1)
- Label: 12px, font-weight: 500, color: rgba(255,255,255,0.6), margin-bottom: 6px
- Select dropdown: same styling, chevron icon 16px

### Sidebar

- Width: 240px (сейчас ~168px — слишком узкий для украинских слов)
- Background: rgba(0,0,0,0.4) с backdrop-filter: blur(20px)
- Или solid: #0A0E14
- Item height: 36px
- Item padding: 8px 12px
- Item text: 13px, font-weight: 400, color: rgba(255,255,255,0.55)
- Item hover: background: rgba(255,255,255,0.04), color: rgba(255,255,255,0.85)
- Item active: background: rgba(34,197,94,0.08), color: #22C55E, font-weight: 500, border-left: 2px solid #22C55E (вместо фона)
- Group headers: 10px uppercase, letter-spacing: 0.08em, color: rgba(255,255,255,0.3), padding: 20px 12px 6px
- Dividers между группами: 1px solid rgba(255,255,255,0.04), margin: 8px 0
- Icons: 16px, stroke-width: 1.5, Lucide icon set, color: inherit
- Sub-items: indent 28px от parent, dot indicator вместо нулевого отступа
- Footer (user): аватар 28px circle с инициалами + имя 13px + role 11px muted

### Header

- Height: 48px (сейчас ~52px)
- Background: transparent (контент скроллится под него) или #0B1220
- Border-bottom: 1px solid rgba(255,255,255,0.06)
- Search: expandable input, 240px default → 400px on focus, placeholder "Пошук...", border: 1px solid rgba(255,255,255,0.08), ⌘K badge внутри справа
- Notifications bell: 20px icon, dot indicator #EF4444 если есть непрочитанные
- Theme toggle: icon-only, 20px
- User menu: аватар 28px → dropdown

---

## 3. VISUAL POLISH LAYER

### Тени и глубина

- Level 0 (base): no shadow
- Level 1 (cards): 0 1px 2px rgba(0,0,0,0.3)
- Level 2 (dropdowns, modals): 0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)
- Level 3 (command palette): 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)
- Sidebar: box-shadow: 1px 0 0 0 rgba(255,255,255,0.04) (right edge)

### Границы

- Global border color: rgba(255,255,255,0.06) — текущие слишком контрастные
- Border-radius scale: 6px (tags, badges), 8px (buttons, inputs), 12px (cards), 16px (modals)
- Убрать все double borders (таблица внутри карточки = карточка без border, таблица со своим)

### Hover / Active / Focus

- Все interactive elements: transition: all 150ms ease
- Hover: lift 0.5px (translateY) + lighten border
- Active: scale(0.98) + darken background
- Focus-visible: 2px ring #22C55E с 3px offset, полупрозрачный
- Links: color: #22C55E, hover: underline, active: #16A34A

### Микро-анимации

- Page transitions: fade-in 200ms ease, translateY(4px → 0)
- Card mount: opacity 0→1, translateY(8px→0), stagger 50ms
- Number counting: countUp animation для KPI при mount (800ms ease-out)
- Table row enter: opacity fade 150ms
- Sidebar expand/collapse: height transition 200ms
- Toast notifications: slide-in from right, 300ms cubic-bezier
- Skeleton shimmer: linear gradient sweep 1.5s infinite

### Цвет в dark theme

- Background scale:
  - Page bg: #0B1220
  - Card bg: #0F1629
  - Elevated bg: #141B2D
  - Input bg: #111827
  - Hover bg: #1A2332

- Accent palette:
  - Primary green: #22C55E (не #10B981 — слишком тусклый для dark)
  - Success: #22C55E
  - Warning: #F59E0B
  - Danger: #EF4444
  - Info: #3B82F6
  - Revenue / Money: #22C55E
  - Expense / Cost: #EF4444
  - Neutral accent: #6366F1 (для графиков, вторичных метрик)

- Text scale:
  - Primary text: rgba(255,255,255,0.92)
  - Secondary text: rgba(255,255,255,0.55)
  - Tertiary text: rgba(255,255,255,0.35)
  - Disabled: rgba(255,255,255,0.2)

---

## 4. DATA VISUALIZATION UPGRADE

### KPI-карточки (полный редизайн)

Текущее: плоские карточки с иконкой, лейблом и числом. Все одинакового размера. Иконки абстрактные.

Новое:

```
┌──────────────────────────┐
│ Загальна площа        ↗  │
│ ■■■■■■■■■□□ 78%          │
│ 350.5 га                 │
│ +12.5 від мин. сезону    │
└──────────────────────────┘
```

- Иерархия: label (11px muted) → value (28px semibold white) → delta (12px green/red)
- Sparkline или mini bar внутри карточки (7 точек, последние 7 недель)
- Trend indicator: ↑ зелёный, ↓ красный, → серый
- Delta: "+12.5%" или "+45,000 UAH" — always show change
- Hero KPI (1 штука, например Прибуток): 2x ширина, 40px число, gradient border top #22C55E→#3B82F6
- НЕТ иконок-кружков. Они ничего не добавляют.

### Иерархия метрик

- Top level (Dashboard): 4 KPI карточки, первая (ключевая) в 1.5x ширину
- Section level (Analytics pages): 3 KPI в ряд, все одинаковые
- Inline metric (в таблице): mono font, right-aligned, color-coded

### Графики

- Библиотека: оставить Recharts, но полностью кастомизировать
- Background: transparent (не карточка внутри карточки)
- Grid: horizontal only, color rgba(255,255,255,0.04), dashed
- Axis labels: 11px, rgba(255,255,255,0.35)
- Axis lines: НЕТ (только grid)
- Bar chart: border-radius: 4px top, минимум 24px ширина, gap 4px
- Bar colors: single metric → gradient green (#22C55E → #16A34A), dual → green + blue (#3B82F6)
- Line chart: stroke-width: 2, dot: false, activeDot: { r: 4, fill: '#22C55E', stroke: '#0B1220', strokeWidth: 2 }
- Area fill: linear gradient top → bottom, opacity 0.15 → 0
- Pie/Donut: innerRadius: 60%, padAngle: 2, cornerRadius: 4
- Pie colors: ['#22C55E', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4']
- Tooltip: bg: #1A2332, border: 1px solid rgba(255,255,255,0.1), border-radius: 8px, padding: 12px, no arrow
- Legend: dot 8px + text 12px, horizontal, spaced 24px, no box

### Устранение "библиотеки по умолчанию"

- Убрать Ant Design Empty state illustration (серый цилиндр) → кастомный SVG icon 48px + текст
- Убрать default Ant Spin → кастомный skeleton shimmer
- Убрать default Ant badge colors → свои
- Убрать default Ant notification → toast в правом верхнем, minimal

---

## 5. PAGE-LEVEL REDESIGN

### Login

**Сейчас:** Двухколоночный layout. Слева — текст + broken иллюстрация + feature list. Справа — форма. Огромное пустое пространство сверху. Кнопка "Увійти" — яркий зелёный pill. Нет demo-кнопки.

**Новый layout:**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│     ┌─────────────────────┐                     │
│     │   АгроTex            │    [UA ▾]          │
│     │                     │                     │
│     │   ┌───────────────┐ │                     │
│     │   │  Email         │ │                     │
│     │   └───────────────┘ │                     │
│     │   ┌───────────────┐ │                     │
│     │   │  Пароль        │ │                     │
│     │   └───────────────┘ │                     │
│     │   [████ Увійти ████]│                     │
│     │                     │                     │
│     │   ─── або ───       │                     │
│     │   [ Увійти як Demo ]│                     │
│     │                     │                     │
│     │   350.5 га · 5 техн.│                     │
│     │   12+ підприємств   │                     │
│     └─────────────────────┘                     │
│                                                 │
│   ● ● ● animated particles bg                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

- Центрированная карточка 420px шириной на полноэкранном фоне
- Фон: subtle animated gradient mesh (#0B1220 → #0F1A2E → #0B1220)
- Или: grid dots pattern (как Linear login)
- Логотип вверху карточки, 32px
- Stats bar внизу карточки: "350.5 га · 5 од. техніки · 12+ підприємств"
- Demo кнопка: ghost стиль, "Увійти як Demo →"
- Убрать feature list — он не нужен на login. Перенести на /landing.

### Dashboard

**Сейчас:** 4 KPI → alerts → quick actions → двухколоночная (поля + операції) → activity feed. Проблема: KPI нули, quick actions занимают много места, нет визуального фокуса.

**Новый layout:**

```
Row 1: [KPI: Площа] [KPI: Витрати] [KPI: Дохід] [KPI: Прибуток ★]
Row 2: [Alert banner: 1 техніка на ремонті · 2 незавершені операції]
Row 3: [== Витрати vs Дохід по місяцях (chart, full width) ===========]
Row 4: [Стан полів (table 60%)] [Останні операції (timeline 40%)]
Row 5: [Quick actions — compact icon row, not full cards]
```

- KPI row: все 4 в одну линию, "Прибуток" — hero-карточка с gradient top border
- Alert banner: 1 строка, жёлтая иконка ⚠️, текст, кликабельная → link
- Chart: полная ширина, 280px высота, area chart витрати vs дохід по місяцях, gradient fill
- Quick actions: компактная полоска из 4 icon+label элементов, не 4 отдельные карточки. Высота 48px, не 72px.

### Sales (Продажі)

**Сейчас:** Два KPI (оба с ошибками), фильтры, таблица. KPI путают count и sum.

**Новый layout:**

```
Row 1: [KPI: Загальний дохід 5,382,000 UAH] [KPI: Угод: 5] [KPI: Сер. чек: 1,076,400] [KPI: Обсяг: 695 т]
Row 2: [Filters: покупець · дата]  [+ Додати продаж]
Row 3: [Table: дата · покупець · продукт · кількість · ціна · сума · маржа]
```

- 4 KPI вместо 2
- Добавить колонку "Маржа" в таблицу
- Суммы: font-variant-numeric: tabular-nums, right-aligned
- Покупці: badges с первыми буквами (KH = Kernel Holding), colored

### Budget (Бюджет)

**Сейчас:** 4 KPI → таблица категорій з input → chart. Категории mixed language.

**Новый layout:**

- KPI row: "Заплановано" (нейтральный) · "Фактично" (синій) · "Відхилення" (червоний) · "Виконання" (gauge-style)
- Таблица: убрать inline input. Сделать каждую категорию кликабельной → открывает modal/drawer для редагування
- Або: inline edit по click на ячейку "Планова сума"
- Progress bar для каждой категории: thin 4px bar, green если <80%, amber 80-100%, red >100%
- Chart "План vs Факт": grouped bar chart, план = ghost/outline bar, факт = solid bar
- ВСЕ категории — украинською: Насіння, Добрива, Пестициди, Пальне, Праця, Техніка, Інше

### Analytics (Аналітика витрат)

**Сейчас:** 3 KPI → pie chart + bar chart → table. Категории на английском. Pie chart — Ant Design default.

**Новый layout:**

- KPI: "Загальні витрати" (red) · "Дохід" (green) · "Прибуток" (white, hero)
- Donut chart (не pie): innerRadius 65%, center text = total, кастомная легенда справа (vertical list: dot + label + value + %)
- Bar chart: horizontal bars (не вертикальні), sorted by value desc, label слева, value справа
- Table: убрати, дані вже є в charts
- ВСЕ категории українською

### Tables (универсально)

**Сейчас:** Ant Design Table default. Vertical borders, wide padding, no hover, muted header.

**Новый стандарт:**

- НЕТ vertical borders
- Header: uppercase 11px, muted, sticky
- Row height: 44px
- Hover: full row background change
- Action column: icons appear on hover only (ghost state)
- Numeric columns: right-aligned, tabular-nums
- Status badges: filled pill, 6px padding-y, 10px font, rounded-full
- Empty state: custom icon + text + CTA button
- Pagination: compact, right-aligned, "Показано 1-20 з 156"

---

## 6. MAKE IT FEEL EXPENSIVE CHECKLIST

**Первые 10 секунд:**
- [ ] Login → centered card on dark gradient background with subtle animation
- [ ] Dashboard KPI числа ≠ 0, крупні, з delta trends
- [ ] CountUp animation на KPI при загрузці
- [ ] Sidebar має depth (тінь або backdrop-blur)
- [ ] Page title 22px semibold, не bold, не default Ant

**Первые 60 секунд:**
- [ ] Таблиці без vertical borders, compact, з hover
- [ ] Графіки з gradient fills, custom tooltip, no default recharts look
- [ ] Кнопки з subtle gradient, не flat color
- [ ] Search bar розгортається при focus
- [ ] Breadcrumbs на всіх сторінках

**Perceived value:**
- [ ] Числа використовують tabular-nums (моноширинні цифри)
- [ ] Всі гривневі суми відформатовані з пробілами (1 234 567 UAH)
- [ ] Skeleton loading замість spinner
- [ ] Toast notifications замість Ant message
- [ ] Empty states з ілюстрацією та CTA
- [ ] Tags/badges з consistent color system
- [ ] Все українською, ніяких англійських категорій

**Убрати MVP-відчуття:**
- [ ] Замінити Ant Design Empty illustration на кастомний SVG
- [ ] Замінити default Ant notification на custom toast
- [ ] Замінити зелену pill-кнопку на gradient кнопку з правильним radius
- [ ] Замінити default Ant Table header на кастомний
- [ ] Прибрати vertical borders з таблиць
- [ ] Додати page transition animations

---

## 7. FINAL TASK ДЛЯ АГЕНТА

### Phase 1: Design System Foundation

1. Create `/frontend/src/styles/tokens.css` with all CSS custom properties: colors (page-bg: #0B1220, card-bg: #0F1629, elevated-bg: #141B2D), text opacity scale (0.92, 0.55, 0.35, 0.2), border colors, border-radius scale (6/8/12/16px), spacing scale (4px base)
2. Update Ant Design theme in `darkTheme.ts`: set colorPrimary to #22C55E, borderRadius to 8, colorBgContainer to #0F1629, colorBgElevated to #141B2D, colorBorder to rgba(255,255,255,0.06), colorText to rgba(255,255,255,0.92), colorTextSecondary to rgba(255,255,255,0.55), fontSize to 13, controlHeight to 36
3. Add global CSS overrides in `index.css`: body background #0B1220, all `.ant-table` remove vertical borders (border-right: none on th/td), table header 11px uppercase letter-spacing 0.06em, table row hover background rgba(255,255,255,0.03), transition 100ms
4. Replace Inter font with Geist Sans (or keep Inter but enforce -0.025em letter-spacing on numbers >20px)

### Phase 2: Component Overhaul

5. Create `KpiCard.tsx` component: props {label, value, delta, deltaLabel, trend: 'up'|'down'|'neutral', sparkData?, hero?: boolean}. Display: label 11px muted top, value 28px semibold white, delta 12px colored bottom. Hero variant: 2x width, 32px value, gradient top border.
6. Replace all existing KPI card usages on Dashboard, Sales, Budget, Analytics, Marginality with new KpiCard
7. Create `DataTable.tsx` wrapper around Ant Table: removes vertical borders, sets header style (uppercase 11px muted), adds row hover, sets row height 44px, action buttons appear on hover only, right-aligns numeric columns
8. Replace all `<Table>` usages with `<DataTable>` across all pages
9. Create `StatusBadge.tsx`: small pill badge, props {status, color}. Consistent across all pages (operations type, machinery status, field ownership)
10. Create `EmptyState.tsx`: custom SVG icon 48px + title 16px + description 13px muted + optional CTA button. Replace all Ant Empty components
11. Update all button styles: primary = gradient green, secondary = ghost with border, danger = red outline. Remove Ant default green pill look. border-radius: 8px.

### Phase 3: Sidebar & Header

12. Restyle sidebar: width 240px, background #0A0E14, item height 36px, active item = left border green + green text (not full bg highlight), group headers 10px uppercase muted, add Lucide icons 16px to all top-level items, sub-items indented 28px with dot indicator
13. Restyle sidebar footer: add avatar circle 28px with initials + name + role on 2 lines, truncate long emails with ellipsis
14. Restyle header: height 48px, search input expandable 240→400px on focus with ⌘K badge inside, notification bell with red dot, theme toggle icon-only

### Phase 4: Login Redesign

15. Redesign Login page: centered card 420px width, remove left-side feature list, add subtle gradient mesh or grid dots background animation (CSS only), logo 32px top of card, email + password inputs, primary "Увійти" button full width, divider "або", ghost "Увійти як Demo →" button, stats bar at bottom "350.5 га · 5 од. техніки"

### Phase 5: Dashboard Redesign

16. Fix Dashboard KPI: change API call or filter to show "за сезон" or "за весь час" instead of "за місяць" so numbers are not zero
17. Redesign Dashboard layout: KPI row (4 cards, Прибуток = hero), single-line alert banner, full-width area chart "Витрати vs Дохід по місяцях", two-column (Стан полів 60% + Останні операції 40%), compact quick actions row (4 icon+label items, 48px height)
18. Add countUp animation to KPI values on mount

### Phase 6: Charts & Data Viz

19. Create Recharts theme wrapper: set global defaults — transparent background, horizontal-only grid rgba(255,255,255,0.04) dashed, axis labels 11px muted, no axis lines, tooltip dark bg (#1A2332) with border, bar border-radius 4px
20. Update bar chart colors: green gradient for revenue, blue for costs, amber for planned
21. Update pie/donut charts: innerRadius 65%, padAngle 2, cornerRadius 4, custom color palette ['#22C55E','#3B82F6','#F59E0B','#8B5CF6','#EC4899','#06B6D4']
22. Replace pie chart legend with vertical custom legend: colored dot + label + value + percentage

### Phase 7: i18n & Data Fixes

23. Fix all cost category i18n: Fuel→Пальне, Seeds→Насіння, Labor→Праця, Fertilizer→Добрива, Pesticide→Пестициди, Machinery→Техніка, Equipment→Обладнання, Other→Інше. Apply in all charts, tables, budget page
24. Fix Sales page KPIs: card 1 = "Загальний дохід" showing sum of all sales amounts, card 2 = "Кількість угод" showing count, add card 3 = "Середній чек", card 4 = "Загальний обсяг (т)"
25. Fix Audit log: resolve user UUID to email/name via API join
26. Fix Profile: seed demo user with name "Олександр Петренко", role "Адміністратор"
27. Fix Fleet map: seed GPS coordinates for 5 machines (Poltava oblast area: lat ~49.5, lon ~34.5), remove "Від'єднано" badge for demo

### Phase 8: Polish

28. Add skeleton loading states: Ant Skeleton for KPI cards (4 rectangles), tables (8 rows × columns), charts (rectangle with shimmer). Show during data fetch.
29. Add page transition: wrapper component, opacity 0→1 + translateY(4px→0), 200ms ease on route change
30. Add consistent breadcrumbs to ALL pages (including root list pages like Fields, Machinery, Operations)
31. Format all UAH amounts with space thousand separator: 1 234 567 UAH. Use Intl.NumberFormat('uk-UA').
32. Set font-variant-numeric: tabular-nums on all number displays
33. Standardize pagination across all tables: compact style, right-aligned, show "Показано X-Y з Z", same pageSize options
