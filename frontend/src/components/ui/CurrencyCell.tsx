interface Props {
  value: number;
  currency?: string;
  locale?: string;
}

export default function CurrencyCell({ value, currency = 'UAH', locale = 'uk-UA' }: Props) {
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

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
