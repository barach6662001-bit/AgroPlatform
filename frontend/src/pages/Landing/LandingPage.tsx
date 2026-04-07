import { Button, Card, Col, Row, Typography } from 'antd';
import { DatabaseOutlined, EnvironmentOutlined, BarChartOutlined, CarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import s from './LandingPage.module.css';

const { Title, Paragraph, Text } = Typography;

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    { title: t.landing.featureWarehouses, desc: t.landing.featureWarehousesDesc, icon: <DatabaseOutlined /> },
    { title: t.landing.featureFields, desc: t.landing.featureFieldsDesc, icon: <EnvironmentOutlined /> },
    { title: t.landing.featureEconomics, desc: t.landing.featureEconomicsDesc, icon: <BarChartOutlined /> },
    { title: t.landing.featureFleet, desc: t.landing.featureFleetDesc, icon: <CarOutlined /> },
  ];

  return (
    <div className={s.bg}>
      {/* Hero */}
      <section className={s.textCenter}>
        <Title level={1} className={s.text40}>
          {t.landing.heroTitle}
        </Title>
        <Paragraph className={s.text18}>
          {t.landing.heroSubtitle}
        </Paragraph>
        <div className={s.flex_centered_wrap}>
          <Button type="primary" size="large" onClick={() => navigate('/login')} className={s.colored}>
            {t.landing.ctaLogin}
          </Button>
          <Button size="large" ghost onClick={() => navigate('/login')}>
            {t.landing.ctaDemo}
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className={s.spaced}>
        <Row gutter={[24, 24]}>
          {features.map((f) => (
            <Col xs={24} sm={12} lg={6} key={f.title}>
              <Card hoverable className={s.textCenter1}>
              <div className={s.featureIcon}>{f.icon}</div>
                <Title level={4}>{f.title}</Title>
                <Text type="secondary">{f.desc}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* Footer */}
      <footer className={s.textCenter2}>
        <Text type="secondary">
          {t.landing.footerText.replace('{year}', String(new Date().getFullYear()))}
        </Text>
      </footer>
    </div>
  );
}
