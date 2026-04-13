export const cropTagColors: Record<string, { bg: string; text: string; border: string }> = {
  'Пшениця':  { bg: 'rgba(251, 191, 36, 0.15)',  text: '#FBBF24', border: 'rgba(251, 191, 36, 0.3)' },
  'Соняшник': { bg: 'rgba(249, 115, 22, 0.15)',  text: '#F97316', border: 'rgba(249, 115, 22, 0.3)' },
  'Кукурудза':{ bg: 'rgba(34, 197, 94, 0.15)',   text: '#22C55E', border: 'rgba(34, 197, 94, 0.3)' },
  'Ріпак':    { bg: 'rgba(168, 85, 247, 0.15)',   text: '#A855F7', border: 'rgba(168, 85, 247, 0.3)' },
  'Ячмінь':   { bg: 'rgba(14, 165, 233, 0.15)',   text: '#0EA5E9', border: 'rgba(14, 165, 233, 0.3)' },
  'Соя':      { bg: 'rgba(20, 184, 166, 0.15)',   text: '#14B8A6', border: 'rgba(20, 184, 166, 0.3)' },
  'Пар':      { bg: 'rgba(148, 163, 184, 0.12)',  text: '#94A3B8', border: 'rgba(148, 163, 184, 0.25)' },
};

const defaultColor = { bg: 'rgba(148, 163, 184, 0.12)', text: '#94A3B8', border: 'rgba(148, 163, 184, 0.25)' };

export function getCropTagStyle(cropName: string): React.CSSProperties {
  const c = cropTagColors[cropName] ?? defaultColor;
  return {
    background: c.bg,
    color: c.text,
    border: `1px solid ${c.border}`,
    padding: '2px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
  };
}
