import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DonutChart, DonutChartSegment } from '@/components/ui/donut-chart';
import { useCountUp, fmt } from '@/hooks/useCountUp';

interface CultureData {
  culture: string;
  cultureKey: 'sunflower' | 'wheat' | 'corn' | 'rapeseed' | 'soy' | 'peas';
  profit: number;
  percent: number;
  area: number;
}

const MOCK_DATA: CultureData[] = [
  { culture: 'Соняшник', cultureKey: 'sunflower', profit: 3840000, percent: 38, area: 680 },
  { culture: 'Пшениця', cultureKey: 'wheat', profit: 2560000, percent: 25, area: 920 },
  { culture: 'Кукурудза', cultureKey: 'corn', profit: 1920000, percent: 19, area: 450 },
  { culture: 'Ріпак', cultureKey: 'rapeseed', profit: 1280000, percent: 12, area: 180 },
  { culture: 'Соя', cultureKey: 'soy', profit: 640000, percent: 6, area: 110 },
];

const COLOR_MAP: Record<string, string> = {
  sunflower: 'var(--culture-sunflower, #F59E0B)',
  wheat: 'var(--culture-wheat, #D97706)',
  corn: 'var(--culture-corn, #10B981)',
  rapeseed: 'var(--culture-rapeseed, #6366F1)',
  soy: 'var(--culture-soy, #8B5CF6)',
  peas: '#06B6D4',
};

const segments: DonutChartSegment[] = MOCK_DATA.map((d) => ({
  value: d.profit,
  color: COLOR_MAP[d.cultureKey],
  label: d.culture,
}));

const totalProfit = MOCK_DATA.reduce((s, d) => s + d.profit, 0);

export function MarginalityBreakdown() {
  const [hovered, setHovered] = useState<DonutChartSegment | null>(null);

  const activeData = hovered ? MOCK_DATA.find((d) => d.culture === hovered.label) : null;
  const displayProfit = activeData ? activeData.profit : totalProfit;
  const animProfit = useCountUp(displayProfit, 800);

  return (
    <div
      className="relative overflow-hidden rounded-xl border p-6"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
    >
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--fg-primary)' }}>Маржинальність за культурами</h3>
          <p className="text-sm mt-0.5" style={{ color: 'var(--fg-tertiary)' }}>Сезон 2026 · 2340 га</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Donut */}
        <div className="flex-shrink-0">
          <DonutChart
            data={segments}
            size={220}
            strokeWidth={24}
            animationDuration={1.2}
            animationDelayPerSegment={0.08}
            onSegmentHover={setHovered}
            centerContent={
              <AnimatePresence mode="wait">
                <motion.div
                  key={hovered?.label ?? 'total'}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col items-center text-center"
                >
                  <span className="text-[11px] uppercase font-medium" style={{ color: 'var(--fg-tertiary)', letterSpacing: '0.06em' }}>
                    {hovered?.label ?? 'Загальний'}
                  </span>
                  <span className="tabular-nums font-bold text-xl" style={{ color: 'var(--fg-primary)', fontFeatureSettings: '"tnum"' }}>
                    {fmt.currency(animProfit)}
                  </span>
                  {activeData && (
                    <span className="text-xs" style={{ color: 'var(--fg-tertiary)' }}>{activeData.percent}%</span>
                  )}
                </motion.div>
              </AnimatePresence>
            }
          />
        </div>

        {/* Bars */}
        <div className="flex-1 w-full space-y-3">
          {MOCK_DATA.map((d, i) => {
            const color = COLOR_MAP[d.cultureKey];
            const isActive = hovered?.label === d.culture;
            return (
              <motion.div
                key={d.cultureKey}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.6 + i * 0.07 }}
                className="cursor-pointer"
                style={{ opacity: hovered && !isActive ? 0.45 : 1, transition: 'opacity 0.2s' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--fg-secondary)' }}>{d.culture}</span>
                    <span className="text-xs" style={{ color: 'var(--fg-tertiary)' }}>{d.area} га</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--fg-tertiary)' }}>{d.percent}%</span>
                    <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--fg-primary)', fontFeatureSettings: '"tnum"' }}>
                      {fmt.currency(d.profit)}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color, boxShadow: isActive ? `0 0 8px ${color}` : 'none' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${d.percent}%` }}
                    transition={{ duration: 1.0, delay: 0.8 + i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
