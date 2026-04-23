import type { DashboardPeriod } from '../pages/DashboardV2/DashboardV2';

/**
 * Maps a {@link DashboardPeriod} to an inclusive-start / exclusive-end
 * UTC date range used by `GET /api/analytics/dashboard`.
 *
 * - `day`    → today 00:00 UTC → now
 * - `week`   → now − 7 days → now
 * - `month`  → 1st of current calendar month (UTC) → now
 * - `season` → **no range** (undefined) — backend returns all-time totals,
 *              matching the numbers shown on Finance pages (Sales/Costs).
 *
 * Returns ISO-8601 strings so they can be passed as query params directly,
 * or `undefined` to fetch the unfiltered (all-time) dashboard.
 */
export function periodToRange(
  period: DashboardPeriod,
  reference: Date = new Date(),
): { from: string; to: string } | undefined {
  const now = new Date(reference.getTime());
  const toIso = now.toISOString();

  let from: Date;
  switch (period) {
    case 'day': {
      from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      break;
    }
    case 'week': {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    }
    case 'month': {
      from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
      break;
    }
    case 'season':
    default:
      // "Season" = all-time (honest totals that match the Finance pages).
      return undefined;
  }
  return { from: from.toISOString(), to: toIso };
}
