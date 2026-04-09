import { Button, Typography } from 'antd';
import { DatabaseOutlined, EnvironmentOutlined, BarChartOutlined, CarOutlined, SafetyOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import Logo from '../../components/Logo';
import s from './LandingPage.module.css';

const { Text } = Typography;

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    { title: t.landing.featureWarehouses, desc: t.landing.featureWarehousesDesc, icon: <DatabaseOutlined /> },
    { title: t.landing.featureFields, desc: t.landing.featureFieldsDesc, icon: <EnvironmentOutlined /> },
    { title: t.landing.featureEconomics, desc: t.landing.featureEconomicsDesc, icon: <BarChartOutlined /> },
    { title: t.landing.featureFleet, desc: t.landing.featureFleetDesc, icon: <CarOutlined /> },
    { title: t.landing.featureHR, desc: t.landing.featureHRDesc, icon: <TeamOutlined /> },
    { title: t.landing.featureSecurity, desc: t.landing.featureSecurityDesc, icon: <SafetyOutlined /> },
  ];

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

      {/* Hero */}
      <section className={s.hero}>
        <div className={s.heroGradient} />
        <div className={s.heroBadge}>{t.landing.badge}</div>
        <h1 className={s.heroTitle}>{t.landing.heroTitle}</h1>
        <p className={s.heroDesc}>{t.landing.heroSubtitle}</p>
        <div className={s.heroActions}>
          <Button type="primary" size="large" onClick={() => navigate('/login')}>{t.landing.ctaStart}</Button>
          <Button size="large" ghost onClick={() => navigate('/login')}>{t.landing.ctaDemo}</Button>
        </div>

        {/* Dashboard mockup */}
        <div className={s.dashboardMockup}>
          <div className={s.mockupBar}>
            <span className={s.mockupDot} />
            <span className={s.mockupDot} />
            <span className={s.mockupDot} />
          </div>
          <div className={s.mockupGrid}>
            <div className={s.mockupCard} />
            <div className={s.mockupCard} />
            <div className={s.mockupCard} />
            <div className={s.mockupCard} />
          </div>
          <div className={s.mockupChart} />
        </div>
      </section>

      {/* Features */}
      <section className={s.features}>
        <h2 className={s.sectionTitle}>{t.landing.featuresTitle}</h2>
        <div className={s.featureGrid}>
          {features.map((f) => (
            <div key={f.title} className={s.featureCard}>
              <div className={s.featureIcon}>{f.icon}</div>
              <h3 className={s.featureCardTitle}>{f.title}</h3>
              <p className={s.featureCardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className={s.proof}>
        <div className={s.proofGrid}>
          <div className={s.proofItem}>
            <span className={s.proofNum}>12+</span>
            <span className={s.proofLabel}>{t.landing.proofCompanies}</span>
          </div>
          <div className={s.proofItem}>
            <span className={s.proofNum}>200K+</span>
            <span className={s.proofLabel}>{t.landing.proofHectares}</span>
          </div>
          <div className={s.proofItem}>
            <span className={s.proofNum}>99.9%</span>
            <span className={s.proofLabel}>{t.landing.proofUptime}</span>
          </div>
        </div>
      </section>

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
