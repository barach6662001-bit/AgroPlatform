import { motion } from 'framer-motion';
import { Upload, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NoFinancialDataEmpty() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 rounded-xl border text-center"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-5"
      >
        {/* Empty chart illustration */}
        <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Baseline */}
          <line x1="10" y1="52" x2="110" y2="52" stroke="var(--border-subtle)" strokeWidth="1.5" />
          {/* Empty bars */}
          {[20, 38, 56, 74, 92].map((x, i) => (
            <motion.rect key={x} x={x - 6} y={24 + i * 4} width="12" height={28 - i * 4} rx="2"
              fill="var(--fg-tertiary)" opacity="0.12"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
              style={{ transformOrigin: 'bottom' }}
            />
          ))}
          {/* Dashed upload arrow */}
          <motion.path d="M60 40 L60 12 M52 20 L60 12 L68 20" stroke="var(--accent-blue-500)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.5"
            strokeDasharray="4 2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          />
        </svg>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--fg-primary)' }}>
          Немає фінансових даних
        </h3>
        <p className="text-sm max-w-xs mx-auto mb-6" style={{ color: 'var(--fg-secondary)' }}>
          Імпортуй банківську виписку або додай операції вручну.
        </p>
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={() => navigate('/finance/import')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--accent-blue-500)', color: '#fff' }}
          >
            <Upload className="h-4 w-4" />
            Імпортувати CSV
          </button>
          <button
            onClick={() => navigate('/finance/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--fg-secondary)' }}
          >
            <Plus className="h-4 w-4" />
            Додати вручну
          </button>
        </div>
      </motion.div>
    </div>
  );
}
