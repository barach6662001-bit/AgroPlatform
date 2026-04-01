import { Button, Card, Col, Row, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';

const { Title, Paragraph, Text } = Typography;

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    { title: t.landing.featureWarehouses, desc: t.landing.featureWarehousesDesc, icon: '📦' },
    { title: t.landing.featureFields, desc: t.landing.featureFieldsDesc, icon: '🌾' },
    { title: t.landing.featureEconomics, desc: t.landing.featureEconomicsDesc, icon: '📊' },
    { title: t.landing.featureFleet, desc: t.landing.featureFleetDesc, icon: '🚜' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #f5f5f5)' }}>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 24px 48px', background: '#1B5E20', color: '#fff' }}>
        <Title level={1} style={{ color: '#fff', fontSize: 40, marginBottom: 16 }}>
          {t.landing.heroTitle}
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, maxWidth: 600, margin: '0 auto 32px' }}>
          {t.landing.heroSubtitle}
        </Paragraph>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button type="primary" size="large" onClick={() => navigate('/login')} style={{ background: '#fff', color: '#1B5E20', borderColor: '#fff' }}>
            {t.landing.ctaLogin}
          </Button>
          <Button size="large" ghost onClick={() => navigate('/login')}>
            {t.landing.ctaDemo}
          </Button>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <Row gutter={[24, 24]}>
          {features.map((f) => (
            <Col xs={24} sm={12} lg={6} key={f.title}>
              <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>{f.icon}</div>
                <Title level={4}>{f.title}</Title>
                <Text type="secondary">{f.desc}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '24px', borderTop: '1px solid #e0e0e0' }}>
        <Text type="secondary">
          {t.landing.footerText.replace('{year}', String(new Date().getFullYear()))}
        </Text>
      </footer>
    </div>
  );
}
