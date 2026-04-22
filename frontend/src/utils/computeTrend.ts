/**
 * Compute period-over-period trend from a series of numeric values.
 *
 * Returns an arrow-prefixed percentage string (e.g. "↑ 8%") or `undefined`
 * when the delta is not meaningful enough to display.
 *
 * Hide-the-chip rules (kept identical to the inline copy in
 * pages/Dashboard.tsx — they are the regression guards from PR #580):
 *   • fewer than two finite numeric points
 *   • previous value is zero (would yield ±Infinity)
 *   • current value is zero (a "↑ 8%" chip next to "0,00 ₴" is misleading)
 *   • |percentage| < 0.5 % (visual noise)
 */
export function computeTrend(
  values: ReadonlyArray<number | undefined | null>,
): string | undefined {
  const nums = values.filter((v): v is number => typeof v === 'number' && !isNaN(v));
  if (nums.length < 2) return undefined;
  const current = nums[nums.length - 1];
  const previous = nums[nums.length - 2];
  if (!previous || current === 0) return undefined;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  if (!isFinite(pct) || Math.abs(pct) < 0.5) return undefined;
  const arrow = pct >= 0 ? '↑' : '↓';
  return `${arrow} ${Math.abs(pct).toFixed(0)}%`;
}
