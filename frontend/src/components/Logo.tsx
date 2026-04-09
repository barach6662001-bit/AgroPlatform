import { useTranslation } from '../i18n';
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
      {/* Leaf / grain shape */}
      <path
        d="M16 5C10 11 8 17 11 23C13 19 14.5 16 16 14C17.5 16 19 19 21 23C24 17 22 11 16 5Z"
        fill="var(--brand)"
        opacity="0.9"
      />
      {/* Stem */}
      <line x1="16" y1="14" x2="16" y2="28" stroke="var(--brand)" strokeWidth="1.5" opacity="0.5" />
      {/* Data dots — subtle tech reference */}
      <circle cx="12.5" cy="17.5" r="1.5" fill="var(--bg-surface)" opacity="0.8" />
      <circle cx="16" cy="19.5" r="1.5" fill="var(--bg-surface)" opacity="0.8" />
      <circle cx="19.5" cy="17.5" r="1.5" fill="var(--bg-surface)" opacity="0.8" />
    </svg>
  );
}

export default function Logo({ size = 28, variant = 'icon' }: Props) {
  const { t } = useTranslation();

  if (variant === 'icon') return <LogoIcon size={size} />;

  return (
    <div className={s.flex_center}>
      <LogoIcon size={size} />
      <div className={s.block2}>
        <div className={s.brandName} style={{ fontSize: size * 0.57 }}>
          {(() => {
            const name = t.app.brandName;
            // Split at "Тех" or "Tech" to color the second part
            const match = name.match(/^(.+?)(Тех|Tech)$/);
            if (match) return <>{match[1]}<span className={s.colored}>{match[2]}</span></>;
            return name;
          })()}
        </div>
        <div className={s.brandTagline} style={{ fontSize: size * 0.32 }}>
          {t.app.brandTagline}
        </div>
      </div>
    </div>
  );
}
