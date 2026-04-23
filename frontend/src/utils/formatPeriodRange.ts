import type { DashboardPeriod } from '../pages/DashboardV2/DashboardV2';

/**
 * Human-readable label for the date range the dashboard is currently filtered
 * by. Mirrors {@link periodToRange} but formats the result for the UI instead
 * of sending it to the API.
 *
 * - `day`    → "23 квіт 2026"
 * - `week`   → "17 – 23 квіт 2026"
 * - `month`  → "квіт 2026"
 * - `season` → locale label for "all time"
 */
export function formatPeriodRange(
  period: DashboardPeriod,
  allTimeLabel: string,
  locale: 'uk' | 'en' = 'uk',
  reference: Date = new Date(),
): string {
  const now = new Date(reference.getTime());
  const lang = locale === 'uk' ? 'uk-UA' : 'en-US';

  const fmtDay = (d: Date) => d.toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtDayShort = (d: Date) => d.toLocaleDateString(lang, { day: 'numeric', month: 'short' });
  const fmtMonth = (d: Date) => d.toLocaleDateString(lang, { month: 'short', year: 'numeric' });

  switch (period) {
    case 'day':
      return fmtDay(now);
    case 'week': {
      const weekAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      return `${fmtDayShort(weekAgo)} – ${fmtDay(now)}`;
    }
    case 'month':
      return fmtMonth(now);
    case 'season':
    default:
      return allTimeLabel;
  }
}
