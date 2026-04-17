import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NoFieldsEmpty() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-[500px] rounded-xl border text-center px-8 py-12"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        {/* Animated SVG: tractor on a field */}
        <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ground */}
          <rect x="0" y="60" width="120" height="4" rx="2" fill="var(--accent-emerald-500)" opacity="0.3" />
          {/* Field rows */}
          {[10, 30, 50, 70, 90, 110].map((x, i) => (
            <motion.rect key={x} x={x - 4} y="50" width="8" height="10" rx="1"
              fill="var(--accent-emerald-500)" opacity="0.2"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
              style={{ transformOrigin: 'bottom' }}
            />
          ))}
          {/* Tractor body */}
          <motion.g
            initial={{ x: -30 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          >
            <rect x="35" y="40" width="30" height="18" rx="3" fill="var(--accent-blue-500)" opacity="0.7" />
            <rect x="25" y="45" width="18" height="13" rx="2" fill="var(--accent-blue-500)" opacity="0.5" />
            {/* Wheels */}
            <circle cx="30" cy="60" r="7" stroke="var(--fg-tertiary)" strokeWidth="2" fill="none" />
            <circle cx="60" cy="60" r="9" stroke="var(--fg-tertiary)" strokeWidth="2" fill="none" />
            {/* Exhaust */}
            <motion.rect x="60" y="34" width="3" height="8" rx="1" fill="var(--fg-tertiary)" opacity="0.5"
              animate={{ scaleY: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />
          </motion.g>
        </svg>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--fg-primary)' }}>
          Ваш перший сезон починається тут
        </h3>
        <p className="text-sm max-w-xs mx-auto mb-6" style={{ color: 'var(--fg-secondary)' }}>
          Додайте поля щоб побачити NDVI-аналітику, витрати та прибуток
        </p>
        <button
          onClick={() => navigate('/fields/new')}
          className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--accent-emerald-500)', color: '#fff' }}
        >
          <Plus className="h-4 w-4" />
          Додати перше поле
        </button>
      </motion.div>
    </div>
  );
}
