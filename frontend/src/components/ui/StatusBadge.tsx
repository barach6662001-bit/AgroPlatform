type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default' | 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'orange' | 'purple';

interface Props {
  status: StatusType;
  text: string;
}

const statusColors: Record<StatusType, { dot: string; bg: string; text: string }> = {
  success: { dot: '#22C55E', bg: 'rgba(34,197,94,0.12)', text: '#22C55E' },
  warning: { dot: '#F59E0B', bg: 'rgba(245,158,11,0.12)', text: '#F59E0B' },
  error:   { dot: '#EF4444', bg: 'rgba(239,68,68,0.12)', text: '#EF4444' },
  info:    { dot: '#3B82F6', bg: 'rgba(59,130,246,0.12)', text: '#3B82F6' },
  default: { dot: 'var(--text-tertiary)', bg: 'rgba(255,255,255,0.06)', text: 'var(--text-secondary)' },
  green:   { dot: '#22C55E', bg: 'rgba(34,197,94,0.12)', text: '#22C55E' },
  yellow:  { dot: '#F59E0B', bg: 'rgba(245,158,11,0.12)', text: '#F59E0B' },
  red:     { dot: '#EF4444', bg: 'rgba(239,68,68,0.12)', text: '#EF4444' },
  blue:    { dot: '#3B82F6', bg: 'rgba(59,130,246,0.12)', text: '#3B82F6' },
  gray:    { dot: 'var(--text-tertiary)', bg: 'rgba(255,255,255,0.06)', text: 'var(--text-secondary)' },
  orange:  { dot: '#F97316', bg: 'rgba(249,115,22,0.12)', text: '#F97316' },
  purple:  { dot: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', text: '#8B5CF6' },
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
      fontWeight: 500,
      lineHeight: '18px',
      background: colors.bg,
      color: colors.text,
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
