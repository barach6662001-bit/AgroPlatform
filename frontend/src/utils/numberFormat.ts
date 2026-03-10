/**
 * Formats a number into Ukrainian abbreviated units.
 * - Values >= 1,000,000 → "X.XX млн"
 * - Values >= 1,000      → "X.XX тис."
 * - Otherwise            → full number (2 decimal places)
 */
export function formatUA(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(2)} млн`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(2)} тис.`;
  }
  return `${sign}${abs.toFixed(2)}`;
}
