import s from './Logo.module.css';
interface Props {
  size?: number;
  variant?: 'icon' | 'full';
}

function LogoIcon({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      width={size}
      height={size}
      className={s.block0}
    >
      <rect width="32" height="32" rx="8" fill="var(--bg-surface)" />
      <rect x="4" y="4" width="24" height="24" rx="2" stroke="var(--brand)" strokeWidth="1.5" fill="none" opacity="0.35" />
      <line x1="4" y1="12" x2="28" y2="12" stroke="var(--brand)" strokeWidth="1" opacity="0.35" />
      <line x1="4" y1="20" x2="28" y2="20" stroke="var(--brand)" strokeWidth="1" opacity="0.35" />
      <line x1="12" y1="4" x2="12" y2="28" stroke="var(--brand)" strokeWidth="1" opacity="0.35" />
      <line x1="20" y1="4" x2="20" y2="28" stroke="var(--brand)" strokeWidth="1" opacity="0.35" />
      <rect x="5" y="5" width="6" height="6" rx="1.5" fill="var(--brand)" />
      <rect x="13" y="13" width="6" height="6" rx="1.5" fill="var(--brand)" opacity="0.65" />
      <rect x="21" y="21" width="6" height="6" rx="1.5" fill="var(--brand)" />
      <rect x="21" y="5" width="6" height="6" rx="1.5" fill="var(--brand)" opacity="0.25" />
      <rect x="5" y="21" width="6" height="6" rx="1.5" fill="var(--brand)" opacity="0.25" />
    </svg>
  );
}

export default function Logo({ size = 28, variant = 'icon' }: Props) {
  if (variant === 'icon') return <LogoIcon size={size} />;

  return (
    <div className={s.flex_center}>
      <LogoIcon size={size} />
      <div className={s.block2}>
        <div style={{ fontWeight: 700, fontSize: size * 0.57, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
          Agro<span className={s.colored}>Tech</span>
        </div>
        <div style={{ fontSize: size * 0.32, color: 'var(--text-tertiary)', letterSpacing: '0.5px', textTransform: 'uppercase' as const }}>
          Farm Management
        </div>
      </div>
    </div>
  );
}
