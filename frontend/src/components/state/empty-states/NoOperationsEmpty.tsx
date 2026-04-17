import { motion } from 'framer-motion';
import { CalendarPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NoOperationsEmpty() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-12 px-8 rounded-xl text-center"
      style={{ background: 'var(--bg-elevated)' }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        {/* Peaceful sun illustration */}
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="14" fill="var(--accent-amber-500)" opacity="0.8" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 32 + 18 * Math.cos(rad);
            const y1 = 32 + 18 * Math.sin(rad);
            const x2 = 32 + 26 * Math.cos(rad);
            const y2 = 32 + 26 * Math.sin(rad);
            return (
              <motion.line key={angle} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="var(--accent-amber-500)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              />
            );
          })}
        </svg>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--fg-primary)' }}>
          Все спокійно
        </h3>
        <p className="text-sm max-w-xs mx-auto mb-4" style={{ color: 'var(--fg-secondary)' }}>
          Немає активних операцій. Гарний час щоб спланувати наступний тиждень.
        </p>
        <button
          onClick={() => navigate('/operations/plan')}
          className="flex items-center gap-2 mx-auto px-3 py-1.5 rounded-lg text-sm font-medium"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--fg-secondary)' }}
        >
          <CalendarPlus className="h-3.5 w-3.5" />
          Створити план
        </button>
      </motion.div>
    </div>
  );
}
