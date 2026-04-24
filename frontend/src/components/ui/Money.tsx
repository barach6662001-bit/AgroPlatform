import type { CSSProperties } from 'react';
import { useFormatCurrency } from '../../hooks/useFormatCurrency';

interface MoneyProps {
  /** Amount expressed in UAH (base DB currency). */
  value: number | null | undefined;
  /** Optional date for per-row historical conversion (advisory in this PR). */
  date?: Date;
  /** Render with 0 fraction digits when false (default 2). */
  decimals?: boolean;
  /** Text to display when value is null/undefined/NaN. Default "—". */
  nullText?: string;
  /** Optional explicit per-unit suffix (e.g. "/га", "/т"). */
  perUnit?: string;
  /** Right-aligned tabular numerals for table columns. */
  tabular?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Reactive monetary display — single source of truth for rendering money.
 *
 * The input is always a UAH amount (per the locked currency decision: all
 * stored money is UAH). The component reads the user's current preferred
 * currency + cached NBU rate from the currency store and renders the
 * converted value. Re-renders automatically when the user switches currency.
 *
 * Prefer `<Money value={uah}/>` over `formatUAH(uah)` in JSX.
 */
export default function Money({
  value,
  date,
  decimals = true,
  nullText = '—',
  perUnit,
  tabular,
  className,
  style,
}: MoneyProps) {
  const fmt = useFormatCurrency();
  const text = fmt(value, { fractionDigits: decimals ? 2 : 0, date });

  if (text === '—') {
    return <span className={className} style={style}>{nullText}</span>;
  }

  return (
    <span
      className={className}
      style={tabular ? { fontVariantNumeric: 'tabular-nums', ...style } : style}
    >
      {text}{perUnit ? perUnit : ''}
    </span>
  );
}
