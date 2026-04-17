import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { TrendingUp, TrendingDown, Fuel, Users } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { fmt } from '@/hooks/useCountUp';

interface SemiGaugeProps {
  value: number;
  max: number;
  label: string;
  sublabel: string;
  accentColor: string;
  format?: 'currency' | 'number';
  index?: number;
}

function SemiGauge({ value, max, label, sublabel, accentColor, format = 'currency', index = 0 }: SemiGaugeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const progress = useMotionValue(0);
  const displayVal = useMotionValue(0);

  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const arcLength = Math.PI * radius; // half-circle
  const pct = Math.min(value / max, 1);

  const dashOffset = useTransform(progress, [0, 1], [arcLength, arcLength * (1 - pct)]);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(progress, 1, { duration: 1.4, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] });
    const valControls = animate(displayVal, value, { duration: 1.4, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] });
    return () => { controls.stop(); valControls.stop(); };
  }, [inView, progress, displayVal, value, index]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group relative overflow-hidden rounded-xl border p-5 flex flex-col items-center"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
    >
      {/* top accent */}
      <div className="absolute inset-x-0 top-0 h-px opacity-40 group-hover:opacity-80 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />

      <div className="text-[11px] font-medium uppercase tracking-wider mb-3 self-start" style={{ color: 'var(--fg-tertiary)', letterSpacing: '0.08em' }}>
        {label}
      </div>

      {/* SVG semi-circle */}
      <div className="relative" style={{ width: size, height: size / 2 + 8 }}>
        <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`}>
          {/* track */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* fill */}
          <motion.path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={accentColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={arcLength}
            style={{ strokeDashoffset: dashOffset, filter: `drop-shadow(0 0 6px ${accentColor}60)` }}
          />
        </svg>

        {/* center value */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
          <div
            className="tabular-nums font-semibold"
            style={{ fontSize: '1.5rem', color: 'var(--fg-primary)', letterSpacing: '-0.02em', fontFeatureSettings: '"tnum"' }}
          >
            {format === 'currency'
              ? <AnimatedCurrency mv={displayVal} />
              : <AnimatedNumber mv={displayVal} />
            }
          </div>
          <div className="text-xs" style={{ color: 'var(--fg-tertiary)' }}>{sublabel}</div>
        </div>
      </div>

      {/* target */}
      <div className="mt-3 text-xs" style={{ color: 'var(--fg-tertiary)' }}>
        Ціль: {format === 'currency' ? fmt.currency(max) : fmt.number(max)}
      </div>
    </motion.div>
  );
}

function useMotionValueState(mv: ReturnType<typeof useMotionValue<number>>) {
  const [val, setVal] = useState(mv.get());
  useEffect(() => mv.on('change', setVal), [mv]);
  return val;
}

function AnimatedCurrency({ mv }: { mv: ReturnType<typeof useMotionValue<number>> }) {
  const val = useMotionValueState(mv);
  return <>{fmt.currency(val)}</>;
}

function AnimatedNumber({ mv }: { mv: ReturnType<typeof useMotionValue<number>> }) {
  const val = useMotionValueState(mv);
  return <>{fmt.number(val)}</>;
}

const sparkData = [12, 15, 11, 18, 17, 20, 19, 22, 21, 24, 23, 26].map((v, i) => ({ v, i }));

const topPerformers = [
  { name: 'Іван П.', tasks: 24, avatar: 'ІП' },
  { name: 'Олег К.', tasks: 21, avatar: 'ОК' },
  { name: 'Марія С.', tasks: 18, avatar: 'МС' },
];

export function SecondaryStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SemiGauge
        value={3200}
        max={3500}
        label="Витрати / га"
        sublabel="₴/га"
        accentColor="var(--accent-blue-500)"
        format="currency"
        index={0}
      />
      <SemiGauge
        value={4800}
        max={6000}
        label="Прибуток / га"
        sublabel="₴/га"
        accentColor="var(--accent-emerald-500)"
        format="currency"
        index={1}
      />

      {/* Fuel efficiency card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.16 }}
        className="group relative overflow-hidden rounded-xl border p-5"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
      >
        <div className="absolute inset-x-0 top-0 h-px opacity-40 group-hover:opacity-80 transition-opacity"
          style={{ background: 'linear-gradient(90deg, transparent, var(--accent-amber-500), transparent)' }} />
        <div className="flex items-start justify-between mb-3">
          <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--fg-tertiary)', letterSpacing: '0.08em' }}>
            Паливна ефективність
          </div>
          <div className="h-8 w-8 flex items-center justify-center rounded-lg" style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--accent-amber-500)' }}>
            <Fuel className="h-4 w-4" />
          </div>
        </div>
        <div className="tabular-nums font-semibold" style={{ fontSize: '2rem', color: 'var(--fg-primary)', letterSpacing: '-0.02em', fontFeatureSettings: '"tnum"' }}>
          8.4
        </div>
        <div className="text-xs mb-1" style={{ color: 'var(--fg-tertiary)' }}>л/га</div>
        <div className="flex items-center gap-1 text-xs mb-3">
          <TrendingDown className="h-3 w-3" style={{ color: 'var(--success)' }} />
          <span style={{ color: 'var(--success)' }}>-12.3%</span>
          <span style={{ color: 'var(--fg-tertiary)' }}>vs минулий сезон</span>
        </div>
        <div className="h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-amber-500)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-amber-500)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="var(--accent-amber-500)" strokeWidth={1.5}
                fill="url(#fuelGrad)" dot={false} animationDuration={1200} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Team productivity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.24 }}
        className="group relative overflow-hidden rounded-xl border p-5"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
      >
        <div className="absolute inset-x-0 top-0 h-px opacity-40 group-hover:opacity-80 transition-opacity"
          style={{ background: 'linear-gradient(90deg, transparent, var(--accent-purple-500), transparent)' }} />
        <div className="flex items-start justify-between mb-3">
          <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--fg-tertiary)', letterSpacing: '0.08em' }}>
            Продуктивність команди
          </div>
          <div className="h-8 w-8 flex items-center justify-center rounded-lg" style={{ background: 'rgba(168,85,247,0.12)', color: 'var(--accent-purple-500)' }}>
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="tabular-nums font-semibold mb-1" style={{ fontSize: '2rem', color: 'var(--fg-primary)', letterSpacing: '-0.02em', fontFeatureSettings: '"tnum"' }}>
          87
        </div>
        <div className="flex items-center gap-1 text-xs mb-3">
          <TrendingUp className="h-3 w-3" style={{ color: 'var(--success)' }} />
          <span style={{ color: 'var(--success)' }}>+5.2%</span>
          <span style={{ color: 'var(--fg-tertiary)' }}>завдань/тиждень</span>
        </div>
        <div className="space-y-2">
          {topPerformers.map((p, i) => (
            <div key={p.name} className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                style={{ background: `rgba(168,85,247,${0.3 - i * 0.08})`, color: 'var(--accent-purple-500)' }}>
                {p.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate" style={{ color: 'var(--fg-secondary)' }}>{p.name}</div>
              </div>
              <div className="text-xs tabular-nums font-semibold" style={{ color: 'var(--fg-tertiary)' }}>{p.tasks}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
