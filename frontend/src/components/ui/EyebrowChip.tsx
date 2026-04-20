import s from './EyebrowChip.module.css';

interface Props {
  label: string;
  dotColor?: string;
}

export default function EyebrowChip({ label, dotColor }: Props) {
  return (
    <span className={s.chip}>
      <span
        className={s.dot}
        style={dotColor ? { background: dotColor, boxShadow: `0 0 12px ${dotColor}` } : undefined}
      />
      {label}
    </span>
  );
}
