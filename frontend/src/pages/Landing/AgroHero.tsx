import { motion, type Variants } from 'framer-motion';
import { Sprout, Droplets, Sun, ArrowRight, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import s from './AgroHero.module.css';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' as const },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: 0.6 + i * 0.12, duration: 0.5, ease: 'easeOut' as const },
  }),
};

const features = [
  {
    icon: <Sprout size={22} />,
    title: 'Управління культурами',
    desc: 'Моніторинг та оптимізація стану посівів у реальному часі',
  },
  {
    icon: <Droplets size={22} />,
    title: 'Розумне зрошення',
    desc: 'Автоматизовані системи управління поливом',
  },
  {
    icon: <Sun size={22} />,
    title: 'Погодна аналітика',
    desc: 'Прогнозування погоди на основі штучного інтелекту',
  },
];

const stats = [
  { value: '10K+', label: 'Активних господарств' },
  { value: '50M+', label: 'Гектарів під управлінням' },
  { value: '+35%', label: 'Врожайність' },
  { value: '24/7', label: 'Підтримка' },
];

interface AgroHeroProps {
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

export default function AgroHero({ onPrimaryClick, onSecondaryClick }: AgroHeroProps) {
  const navigate = useNavigate();

  const handlePrimary = onPrimaryClick ?? (() => navigate('/login'));
  const handleSecondary = onSecondaryClick ?? (() => navigate('/login'));

  return (
    <div className={s.wrapper}>
      {/* Animated gradient background */}
      <div className={s.gradientBg} />

      {/* Floating orbs */}
      <div className={s.orbGreen} />
      <div className={s.orbBlue} />
      <div className={s.orbCenter} />

      {/* Decorative shapes */}
      <div className={s.shapeRing} />
      <div className={s.shapeSquare} />

      {/* Main content */}
      <motion.div
        className={s.content}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants}>
          <span className={s.badge}>
            <Sprout size={14} />
            Нам довіряють 10,000+ фермерів по всьому світу
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1 variants={itemVariants} className={s.heading}>
          Розумне землеробство для{' '}
          <span className={s.headingAccent}>сталого майбутнього</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p variants={itemVariants} className={s.subtitle}>
          Використовуйте силу технологій для оптимізації роботи вашого господарства,
          підвищення врожайності та зменшення впливу на навколишнє середовище
          з нашою комплексною AgroTech-платформою.
        </motion.p>

        {/* CTA buttons */}
        <motion.div variants={itemVariants} className={s.actions}>
          <button className={s.btnPrimary} onClick={handlePrimary}>
            Спробувати безкоштовно
            <ArrowRight size={18} />
          </button>
          <button className={s.btnSecondary} onClick={handleSecondary}>
            <PlayCircle size={18} />
            Дивитись демо
          </button>
        </motion.div>

        {/* Feature cards */}
        <div className={s.featureGrid}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className={s.featureCard}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <div className={s.featureIconWrap}>{f.icon}</div>
              <p className={s.featureTitle}>{f.title}</p>
              <p className={s.featureDesc}>{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div variants={itemVariants} className={s.statsGrid}>
          {stats.map((stat) => (
            <div key={stat.label} className={s.statItem}>
              <span className={s.statValue}>{stat.value}</span>
              <span className={s.statLabel}>{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
