import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DonutChart, DonutChartSegment } from '@/components/ui/donut-chart';
import { useFinanceDashboard } from '@/hooks/useFinanceDashboard';
import { useCountUp, fmt } from '@/hooks/useCountUp';

export function CostCategoriesPie() {
  const { data } = useFinanceDashboard();
  const cats = data?.costCategories ?? [];
  const [hovered, setHovered] = useState<DonutChartSegment | null>(null);

  const segments: DonutChartSegment[] = cats.map((c) => ({
    value: c.amount, color: c.color, label: c.category,
  }));

  const total = cats.reduce((s, c) => s + c.amount, 0);
  const activeData = hovered ? cats.find((c) => c.category === hovered.label) : null;
  const displayVal = activeData ? activeData.amount : total;
  const animated = useCountUp(displayVal, 600);

  return (
    <div
      className="rounded-xl border p-5 card-hoverable"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--fg-primary)' }}>
        Структура витрат
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="shrink-0">
          <DonutChart
            data={segments}
            size={180}
            strokeWidth={20}
            animationDuration={1.0}
            animationDelayPerSegment={0.07}
            onSegmentHover={setHovered}
            centerContent={
              <AnimatePresence mode="wait">
                <motion.div
                  key={hovered?.label ?? 'total'}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col items-center text-center"
                >
                  <span className="text-[10px] uppercase font-medium" style={{ color: 'var(--fg-tertiary)', letterSpacing: '0.06em' }}>
                    {hovered?.label ?? 'Всього'}
                  </span>
                  <span className="tabular-nums font-bold text-base" style={{ color: 'var(--fg-primary)', fontFeatureSettings: '"tnum"' }}>
                    {fmt.currency(animated)}
                  </span>
                </motion.div>
              </AnimatePresence>
            }
          />
        </div>
        <div className="flex-1 space-y-2 w-full">
          {cats.map((c) => (
            <div key={c.category} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span style={{ color: 'var(--fg-secondary)' }}>{c.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="tabular-nums" style={{ color: 'var(--fg-tertiary)' }}>{c.percent}%</span>
                <span className="tabular-nums font-medium" style={{ color: 'var(--fg-primary)' }}>{fmt.currency(c.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
