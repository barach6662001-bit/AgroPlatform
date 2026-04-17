import { useNavigate } from 'react-router-dom';
import { useManagerDashboard } from '@/hooks/useManagerDashboard';

const CULTURE_COLOR: Record<string, string> = {
  sunflower: 'var(--culture-sunflower, #F59E0B)',
  wheat: 'var(--culture-wheat, #D97706)',
  corn: 'var(--culture-corn, #10B981)',
  rapeseed: 'var(--culture-rapeseed, #6366F1)',
  soy: 'var(--culture-soy, #8B5CF6)',
  peas: '#06B6D4',
};

function ndviColor(ndvi: number) {
  if (ndvi < 0.3) return '#7f1d1d';
  if (ndvi < 0.5) return '#f59e0b';
  if (ndvi < 0.7) return '#65a30d';
  return '#16a34a';
}

export function FieldStatusGrid() {
  const { data } = useManagerDashboard();
  const navigate = useNavigate();
  const fields = data?.fields ?? [];

  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm" style={{ color: 'var(--fg-primary)' }}>Статус полів</h3>
        <button className="text-xs" style={{ color: 'var(--accent-blue-500)' }}>
          Показати всі
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2">
        {fields.map((field) => {
          const cColor = CULTURE_COLOR[field.cultureKey] ?? '#888';
          const nColor = ndviColor(field.ndvi);
          return (
            <button
              key={field.id}
              onClick={() => navigate(`/fields/${field.id}`)}
              className="rounded-lg p-2 text-left transition-colors"
              style={{ background: 'var(--bg-elevated)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = cColor; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
            >
              <div className="flex items-center gap-1 mb-1.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: cColor }} />
                <span className="text-[10px] font-medium truncate" style={{ color: 'var(--fg-secondary)' }}>
                  {field.name}
                </span>
              </div>
              {/* Mini NDVI bar */}
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${field.ndvi * 100}%`, backgroundColor: nColor }}
                />
              </div>
              <div className="text-[9px] mt-1 tabular-nums" style={{ color: 'var(--fg-tertiary)' }}>
                {field.ndvi.toFixed(2)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
