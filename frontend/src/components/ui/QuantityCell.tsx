import s from './QuantityCell.module.css';
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
    <span className={s.colored}>
      {formatted}
      <span className={s.text09em}>
        {unit}
      </span>
    </span>
  );
}
