import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkerDashboard } from '@/hooks/useWorkerDashboard';

const PAGE_SIZE = 10;

const STATUS_COLOR: Record<string, string> = {
  'Активна': 'var(--accent-emerald-500)',
  'Зарезервована': 'var(--accent-amber-500)',
};

export function WarehouseStateTable() {
  const { data } = useWorkerDashboard();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const batches = data?.batches ?? [];

  const paginated = batches.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(batches.length / PAGE_SIZE);

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--fg-primary)' }}>Стан складу · {data?.warehouse?.name}</h3>
        <span className="text-xs" style={{ color: 'var(--fg-tertiary)' }}>{batches.length} партій</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
              {['ID', 'Культура', 'Кількість', 'Статус', 'Остання дія', ''].map((h) => (
                <th
                  key={h}
                  className="px-3 text-left font-medium"
                  style={{ color: 'var(--fg-tertiary)', height: 28, whiteSpace: 'nowrap' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((batch, i) => {
              const statusColor = STATUS_COLOR[batch.status] ?? 'var(--fg-tertiary)';
              return (
                <tr
                  key={batch.id}
                  style={{
                    height: 28,
                    borderBottom: i < paginated.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  onClick={() => navigate(`/warehouse/batches/${batch.id}`)}
                >
                  <td className="px-3 tabular-nums font-medium" style={{ color: 'var(--fg-secondary)' }}>{batch.id}</td>
                  <td className="px-3" style={{ color: 'var(--fg-secondary)' }}>{batch.culture}</td>
                  <td className="px-3 tabular-nums" style={{ color: 'var(--fg-primary)' }}>
                    {batch.qty.toFixed(1)} {batch.unit}
                  </td>
                  <td className="px-3">
                    <span
                      className="inline-flex items-center gap-1"
                      style={{ color: statusColor }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-3" style={{ color: 'var(--fg-tertiary)' }}>
                    {batch.lastAction} · {batch.lastActionTime}
                  </td>
                  <td className="px-3">
                    <button
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ color: 'var(--accent-blue-500)', background: 'var(--accent-blue-500, #3B82F6)10' }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/warehouse/batches/${batch.id}`); }}
                    >
                      Дія
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          className="flex items-center justify-between px-4 py-2 text-xs"
          style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--fg-tertiary)' }}
        >
          <span>Сторінка {page + 1} з {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2 py-0.5 rounded disabled:opacity-40"
              style={{ background: 'var(--bg-elevated)' }}
            >
              ←
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-2 py-0.5 rounded disabled:opacity-40"
              style={{ background: 'var(--bg-elevated)' }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
