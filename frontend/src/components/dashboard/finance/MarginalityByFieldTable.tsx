import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useFinanceDashboard } from '@/hooks/useFinanceDashboard';
import { fmt } from '@/hooks/useCountUp';

const CULTURE_COLOR: Record<string, string> = {
  sunflower: 'var(--culture-sunflower, #F59E0B)',
  wheat: 'var(--culture-wheat, #D97706)',
  corn: 'var(--culture-corn, #10B981)',
  rapeseed: 'var(--culture-rapeseed, #6366F1)',
  soy: 'var(--culture-soy, #8B5CF6)',
};

type SortKey = 'area' | 'costPerHa' | 'revenue' | 'profit' | 'marginPct';

export function MarginalityByFieldTable() {
  const { data } = useFinanceDashboard();
  const [sortKey, setSortKey] = useState<SortKey>('profit');
  const [asc, setAsc] = useState(false);

  const fields = data?.marginalityByField ?? [];
  const sorted = [...fields].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return asc ? diff : -diff;
  });

  const totals = fields.reduce((acc, f) => ({
    area: acc.area + f.area,
    revenue: acc.revenue + f.revenue,
    profit: acc.profit + f.profit,
  }), { area: 0, revenue: 0, profit: 0 });

  const maxProfit = Math.max(...fields.map((f) => Math.abs(f.profit)));

  function toggleSort(key: SortKey) {
    if (sortKey === key) setAsc((v) => !v);
    else { setSortKey(key); setAsc(false); }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp className="h-3 w-3 opacity-30" />;
    return asc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  }

  function ColHeader({ k, label, right = false }: { k: SortKey; label: string; right?: boolean }) {
    return (
      <th
        className="px-3 py-2 text-xs font-medium cursor-pointer select-none"
        style={{ color: sortKey === k ? 'var(--fg-primary)' : 'var(--fg-tertiary)', textAlign: right ? 'right' : 'left' }}
        onClick={() => toggleSort(k)}
      >
        <span className="inline-flex items-center gap-1">{label}<SortIcon k={k} /></span>
      </th>
    );
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--fg-primary)' }}>Маржинальність по полях</h3>
        <span className="text-xs" style={{ color: 'var(--fg-tertiary)' }}>{fields.length} полів</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th className="px-3 py-2 text-left text-xs font-medium" style={{ color: 'var(--fg-tertiary)' }}>Поле</th>
              <th className="px-3 py-2 text-left text-xs font-medium" style={{ color: 'var(--fg-tertiary)' }}>Культура</th>
              <ColHeader k="area" label="Га" />
              <ColHeader k="costPerHa" label="₴/га" right />
              <ColHeader k="revenue" label="Виручка" right />
              <ColHeader k="profit" label="Прибуток" right />
              <ColHeader k="marginPct" label="Маржа%" right />
              <th className="px-3 py-2 w-24" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((f, i) => {
              const cColor = CULTURE_COLOR[f.cultureKey] ?? '#888';
              const barPct = maxProfit > 0 ? Math.abs(f.profit) / maxProfit * 100 : 0;
              const positive = f.profit >= 0;
              return (
                <tr
                  key={f.fieldId}
                  style={{
                    height: 32,
                    borderBottom: i < sorted.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <td className="px-3 font-medium tabular-nums" style={{ color: 'var(--fg-secondary)' }}>{f.fieldName}</td>
                  <td className="px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cColor }} />
                      <span style={{ color: 'var(--fg-secondary)' }}>{f.culture}</span>
                    </div>
                  </td>
                  <td className="px-3 tabular-nums text-right" style={{ color: 'var(--fg-tertiary)' }}>{f.area.toFixed(0)}</td>
                  <td className="px-3 tabular-nums text-right" style={{ color: 'var(--fg-secondary)' }}>{fmt.number(f.costPerHa)}</td>
                  <td className="px-3 tabular-nums text-right" style={{ color: 'var(--fg-primary)' }}>{fmt.currency(f.revenue)}</td>
                  <td className="px-3 tabular-nums text-right font-medium" style={{ color: positive ? 'var(--accent-emerald-500)' : '#EF4444' }}>
                    {positive ? '+' : ''}{fmt.currency(f.profit)}
                  </td>
                  <td className="px-3 tabular-nums text-right" style={{ color: positive ? 'var(--accent-emerald-500)' : '#EF4444' }}>
                    {f.marginPct.toFixed(1)}%
                  </td>
                  <td className="px-3">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${barPct}%`, background: positive ? 'var(--accent-emerald-500)' : '#EF4444' }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid var(--border-default)', background: 'var(--bg-elevated)' }}>
              <td className="px-3 py-2 font-semibold text-xs" style={{ color: 'var(--fg-primary)' }} colSpan={2}>Разом</td>
              <td className="px-3 tabular-nums text-right text-xs font-medium" style={{ color: 'var(--fg-secondary)' }}>{totals.area.toFixed(0)}</td>
              <td />
              <td className="px-3 tabular-nums text-right text-xs font-semibold" style={{ color: 'var(--fg-primary)' }}>{fmt.currency(totals.revenue)}</td>
              <td className="px-3 tabular-nums text-right text-xs font-semibold" style={{ color: 'var(--accent-emerald-500)' }}>+{fmt.currency(totals.profit)}</td>
              <td className="px-3 tabular-nums text-right text-xs font-semibold" style={{ color: 'var(--accent-emerald-500)' }}>
                {((totals.profit / totals.revenue) * 100).toFixed(1)}%
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
