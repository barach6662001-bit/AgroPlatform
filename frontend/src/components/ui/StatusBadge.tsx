type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default';

interface Props {
  status: StatusType;
  text: string;
}

const statusColors: Record<StatusType, { dot: string; bg: string; text: string }> = {
  success: { dot: 'var(--success)', bg: 'var(--success-bg)', text: 'var(--success)' },
  warning: { dot: 'var(--warning)', bg: 'var(--warning-bg)', text: 'var(--warning)' },
  error:   { dot: 'var(--error)',   bg: 'var(--error-bg)',   text: 'var(--error)' },
  info:    { dot: 'var(--info)',    bg: 'var(--info-bg)',     text: 'var(--info)' },
  default: { dot: 'var(--text-tertiary)', bg: 'var(--bg-subtle)', text: 'var(--text-secondary)' },
};

export default function StatusBadge({ status, text }: Props) {
  const colors = statusColors[status];

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '2px 10px 2px 8px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: '20px',
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
