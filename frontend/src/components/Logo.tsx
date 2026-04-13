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
      style={{ display: 'block' }}
    >
      {/* Background — dark rounded square */}
      <rect width="32" height="32" rx="8" fill="var(--brand, #22C55E)" />

      {/* Stylized "A" letterform — represents both Agriculture and Analytics */}
      <path
        d="M16 6L8 26h4l1.5-5h5L20 26h4L16 6zm-1.2 12L16 12.5 17.2 18h-2.4z"
        fill="white"
        opacity="0.95"
      />

      {/* Three horizontal data lines — subtle tech reference */}
      <line x1="10" y1="28" x2="14" y2="28" stroke="white" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
      <line x1="16" y1="28" x2="18" y2="28" stroke="white" strokeWidth="1" opacity="0.2" strokeLinecap="round" />
      <line x1="20" y1="28" x2="22" y2="28" stroke="white" strokeWidth="1" opacity="0.15" strokeLinecap="round" />
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
