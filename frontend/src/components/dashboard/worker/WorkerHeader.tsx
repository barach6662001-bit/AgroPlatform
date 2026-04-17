import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkerDashboard } from '@/hooks/useWorkerDashboard';

export function WorkerHeader() {
  const { data } = useWorkerDashboard();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--fg-primary)' }}>
          Мої завдання на сьогодні
        </h1>
        {data?.warehouse && (
          <p className="text-sm" style={{ color: 'var(--fg-tertiary)' }}>
            {data.warehouse.name}
          </p>
        )}
      </div>
      <button
        onClick={() => navigate('/warehouse/receive')}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
        style={{
          background: 'var(--accent-emerald-500)',
          color: '#fff',
        }}
      >
        <Plus className="h-4 w-4" />
        Швидка дія: + Приймання
      </button>
    </div>
  );
}
