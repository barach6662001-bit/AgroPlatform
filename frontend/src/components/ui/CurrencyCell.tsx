import { useFormatCurrency } from '../../hooks/useFormatCurrency';

interface Props {
  /** Amount in UAH (base DB currency). Displayed in the user's preferred currency. */
  value: number;
  /**
   * Override display currency. Default: user preference.
   * Note: the `value` itself is always a UAH amount regardless of this prop.
   */
  currency?: 'UAH' | 'USD' | 'EUR';
}

export default function CurrencyCell({ value, currency }: Props) {
  const fmt = useFormatCurrency();
  const formatted = fmt(value, { target: currency });
  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      textAlign: 'right',
      display: 'inline-block',
      color: value < 0 ? 'var(--error)' : 'var(--text-primary)',
    }}>
      {formatted}
    </span>
  );
}
