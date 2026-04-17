import { motion } from 'framer-motion';

export function NoTasksEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-8 rounded-xl text-center"
      style={{ background: 'var(--bg-elevated)' }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.15, 1] }}
        transition={{ duration: 0.5, times: [0, 0.7, 1] }}
        className="mb-4"
      >
        {/* Checkmark with confetti */}
        <div className="relative">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="var(--accent-emerald-500)" opacity="0.15" />
            <circle cx="32" cy="32" r="20" fill="var(--accent-emerald-500)" opacity="0.25" />
            <path d="M20 32l8 8 16-16" stroke="var(--accent-emerald-500)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {/* Confetti dots */}
          {[
            { x: -12, y: -12, color: 'var(--accent-amber-500)', delay: 0.2 },
            { x: 16, y: -16, color: 'var(--accent-blue-500)', delay: 0.3 },
            { x: -18, y: 8, color: 'var(--accent-purple-500)', delay: 0.25 },
            { x: 20, y: 10, color: 'var(--accent-emerald-500)', delay: 0.35 },
            { x: 4, y: -20, color: '#EF4444', delay: 0.15 },
          ].map((dot, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full"
              style={{ background: dot.color, left: `calc(50% + ${dot.x}px)`, top: `calc(50% + ${dot.y}px)` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.7] }}
              transition={{ delay: dot.delay, duration: 0.5 }}
            />
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--fg-primary)' }}>
          Всі завдання виконано! 🎉
        </h3>
        <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--fg-secondary)' }}>
          Гарна робота. Зачекай поки менеджер призначить нові.
        </p>
      </motion.div>
    </div>
  );
}
