interface Props {
  value: number;
  unit: string;
  precision?: number;
  locale?: string;
}

export default function QuantityCell({ value, unit, precision = 2, locale = 'uk-UA' }: Props) {
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  }).format(value);

  return (
    <span style={{
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
      color: 'var(--text-primary)',
    }}>
      {formatted}
      <span style={{ color: 'var(--text-tertiary)', marginLeft: 4, fontSize: '0.9em' }}>
        {unit}
      </span>
    </span>
  );
}
