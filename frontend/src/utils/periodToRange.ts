import type { DashboardPeriod } from '../pages/DashboardV2/DashboardV2';

/**
 * Maps a {@link DashboardPeriod} to an inclusive-start / exclusive-end
 * UTC date range used by `GET /api/analytics/dashboard`.
 *
 * - `day`    → today 00:00 UTC → now
 * - `week`   → now − 7 days → now
 * - `month`  → 1st of current calendar month (UTC) → now
 * - `season` → Mar 1 of current year (UTC) → now
 *              (TODO: per-tenant season config)
 *
 * Returns ISO-8601 strings so they can be passed as query params directly.
 */
export function periodToRange(period: DashboardPeriod, reference: Date = new Date()): { from: string; to: string } {
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
    default: {
      from = new Date(Date.UTC(now.getUTCFullYear(), 2 /* March */, 1, 0, 0, 0, 0));
      // If "now" is before March 1, use previous year's season start.
      if (from.getTime() > now.getTime()) {
        from = new Date(Date.UTC(now.getUTCFullYear() - 1, 2, 1, 0, 0, 0, 0));
      }
      break;
    }
  }
  return { from: from.toISOString(), to: toIso };
}
