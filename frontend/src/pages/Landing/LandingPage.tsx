import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import Logo from '../../components/Logo';
import AgroHero from './AgroHero';
import s from './LandingPage.module.css';

const { Text } = Typography;

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className={s.landing}>
      {/* Navbar */}
      <nav className={s.navbar}>
        <Logo size={32} variant="full" />
        <div className={s.navActions}>
          <Button type="text" onClick={() => navigate('/login')} className={s.navLink}>{t.landing.ctaLogin}</Button>
          <Button type="primary" onClick={() => navigate('/login')}>{t.landing.ctaStart}</Button>
        </div>
      </nav>

      {/* Hero — animated gradient section */}
      <AgroHero />

      {/* Footer */}
      <footer className={s.footer}>
        <Logo size={24} variant="full" />
        <Text className={s.footerText}>
          {t.landing.footerText.replace('{year}', String(new Date().getFullYear()))}
        </Text>
      </footer>
    </div>
  );
}
