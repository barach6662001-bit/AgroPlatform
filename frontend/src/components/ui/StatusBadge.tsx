type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default' | 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'orange' | 'purple';

interface Props {
  status: StatusType;
  text: string;
}

const statusColors: Record<StatusType, { dot: string; bg: string; text: string; border: string }> = {
  success: { dot: '#22C55E', bg: 'rgba(34,197,94,0.10)', text: '#22C55E', border: 'rgba(34,197,94,0.30)' },
  warning: { dot: '#F59E0B', bg: 'rgba(245,158,11,0.10)', text: '#F59E0B', border: 'rgba(245,158,11,0.30)' },
  error:   { dot: '#EF4444', bg: 'rgba(239,68,68,0.10)', text: '#EF4444', border: 'rgba(239,68,68,0.30)' },
  info:    { dot: '#3B82F6', bg: 'rgba(59,130,246,0.10)', text: '#3B82F6', border: 'rgba(59,130,246,0.30)' },
  default: { dot: 'var(--text-tertiary)', bg: 'rgba(255,255,255,0.06)', text: 'var(--text-secondary)', border: 'rgba(255,255,255,0.14)' },
  green:   { dot: '#22C55E', bg: 'rgba(34,197,94,0.10)', text: '#22C55E', border: 'rgba(34,197,94,0.30)' },
  yellow:  { dot: '#F59E0B', bg: 'rgba(245,158,11,0.10)', text: '#F59E0B', border: 'rgba(245,158,11,0.30)' },
  red:     { dot: '#EF4444', bg: 'rgba(239,68,68,0.10)', text: '#EF4444', border: 'rgba(239,68,68,0.30)' },
  blue:    { dot: '#3B82F6', bg: 'rgba(59,130,246,0.10)', text: '#3B82F6', border: 'rgba(59,130,246,0.30)' },
  gray:    { dot: 'var(--text-tertiary)', bg: 'rgba(255,255,255,0.06)', text: 'var(--text-secondary)', border: 'rgba(255,255,255,0.14)' },
  orange:  { dot: '#F97316', bg: 'rgba(249,115,22,0.10)', text: '#F97316', border: 'rgba(249,115,22,0.30)' },
  purple:  { dot: '#8B5CF6', bg: 'rgba(139,92,246,0.10)', text: '#8B5CF6', border: 'rgba(139,92,246,0.30)' },
};

export default function StatusBadge({ status, text }: Props) {
  const colors = statusColors[status];

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '2px 8px',
      borderRadius: 9999,
      fontSize: 11,
      fontFamily: 'var(--fm)',
      fontWeight: 500,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.04em',
      lineHeight: '18px',
      background: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: colors.dot,
        flexShrink: 0,
      }} />
      {text}
    </span>
  );
}
