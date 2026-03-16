interface Props {
  size?: number;
}

export default function Logo({ size = 28 }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      width={size}
      height={size}
      style={{ flexShrink: 0 }}
    >
      <rect width="32" height="32" rx="8" fill="#0B1220" />
      <rect x="4" y="4" width="24" height="24" rx="2" stroke="#22C55E" strokeWidth="1.5" fill="none" opacity="0.35" />
      <line x1="4" y1="12" x2="28" y2="12" stroke="#22C55E" strokeWidth="1" opacity="0.35" />
      <line x1="4" y1="20" x2="28" y2="20" stroke="#22C55E" strokeWidth="1" opacity="0.35" />
      <line x1="12" y1="4" x2="12" y2="28" stroke="#22C55E" strokeWidth="1" opacity="0.35" />
      <line x1="20" y1="4" x2="20" y2="28" stroke="#22C55E" strokeWidth="1" opacity="0.35" />
      <rect x="5" y="5" width="6" height="6" rx="1.5" fill="#22C55E" />
      <rect x="13" y="13" width="6" height="6" rx="1.5" fill="#22C55E" opacity="0.65" />
      <rect x="21" y="21" width="6" height="6" rx="1.5" fill="#22C55E" />
      <rect x="21" y="5" width="6" height="6" rx="1.5" fill="#22C55E" opacity="0.25" />
      <rect x="5" y="21" width="6" height="6" rx="1.5" fill="#22C55E" opacity="0.25" />
    </svg>
  );
}
