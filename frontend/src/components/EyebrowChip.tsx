import s from './EyebrowChip.module.css';

interface Props {
  label: string;
  pulse?: boolean;
}

export default function EyebrowChip({ label, pulse = true }: Props) {
  return (
    <span className={s.chip}>
      <span className={`${s.dot} ${pulse ? s.pulse : ''}`} />
      <span className={s.label}>{label}</span>
    </span>
  );
}
