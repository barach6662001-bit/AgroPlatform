import { useTranslation } from '../i18n';
import s from './Logo.module.css';

interface Props {
  size?: number;
  variant?: 'icon' | 'full';
}

function LogoIcon({ size }: { size: number }) {
  const id = 'agroLogo';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="none"
      width={size}
      height={size}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0F1A12" />
          <stop offset="1" stopColor="#06120A" />
        </linearGradient>
        <linearGradient id={`${id}-leaf`} x1="20" y1="6" x2="20" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#34D27A" />
          <stop offset="1" stopColor="#16A34A" />
        </linearGradient>
        <linearGradient id={`${id}-stem`} x1="20" y1="10" x2="20" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#86EFAC" />
          <stop offset="1" stopColor="#22C55E" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="20" cy="14" r="14" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#22C55E" stopOpacity="0.35" />
          <stop offset="1" stopColor="#22C55E" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Tile */}
      <rect x="1" y="1" width="38" height="38" rx="10" fill={`url(#${id}-bg)`} />
      <rect x="1" y="1" width="38" height="38" rx="10" fill={`url(#${id}-glow)`} />
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="9.5"
        stroke="rgba(34, 197, 94, 0.35)"
        strokeWidth="1"
      />

      {/* Center stem */}
      <path
        d="M20 32 L20 14"
        stroke={`url(#${id}-stem)`}
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Left leaf */}
      <path
        d="M20 24 C 14 23, 11 19, 11 14 C 16 14, 19 17, 20 22 Z"
        fill={`url(#${id}-leaf)`}
        opacity="0.95"
      />
      {/* Right leaf */}
      <path
        d="M20 22 C 21 17, 24 14, 29 14 C 29 19, 26 23, 20 24 Z"
        fill={`url(#${id}-leaf)`}
        opacity="0.95"
      />
      {/* Top sprout */}
      <path
        d="M20 14 C 18 12, 17.5 10, 18.5 7.5 C 20.5 8.5, 21.5 10.5, 20 14 Z"
        fill={`url(#${id}-leaf)`}
      />
      <path
        d="M20 14 C 22 12, 22.5 10, 21.5 7.5 C 19.5 8.5, 18.5 10.5, 20 14 Z"
        fill={`url(#${id}-leaf)`}
        opacity="0.85"
      />

      {/* Grain dot accent */}
      <circle cx="20" cy="9.5" r="1" fill="#86EFAC" />

      {/* Soil tick */}
      <path
        d="M14 32 L26 32"
        stroke="rgba(134, 239, 172, 0.45)"
        strokeWidth="1"
        strokeLinecap="round"
      />
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
