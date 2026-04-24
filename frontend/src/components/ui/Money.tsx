import type { CSSProperties } from 'react';
import { useFormatCurrency } from '../../hooks/useFormatCurrency';

interface MoneyProps {
  /** Amount expressed in UAH (base DB currency). */
  value: number | null | undefined;
  /** Render with 0 fraction digits when false (default 2). */
  decimals?: boolean;
  /** Optional explicit per-unit suffix (e.g. "/га", "/т"). */
  perUnit?: string;
  /** Colour the value as monetary (right-aligned mono). */
  tabular?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Reactive monetary display.
 *
 * The input is always a UAH amount (per the locked currency decision: all
 * stored money is UAH). The component reads the user's current preferred
 * currency + cached NBU rate from the currency store and renders the
 * converted value. Re-renders automatically when the user switches currency.
 *
 * Prefer `<Money value={uah}/>` over `formatUAH(uah)` in JSX.
 */
export default function Money({ value, decimals = true, perUnit, tabular, className, style }: MoneyProps) {
  const fmt = useFormatCurrency();
  const v = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  const text = fmt(v, { fractionDigits: decimals ? 2 : 0 });
  return (
    <span
      className={className}
      style={tabular ? { fontVariantNumeric: 'tabular-nums', ...style } : style}
    >
      {text}{perUnit ? perUnit : ''}
    </span>
  );
}
