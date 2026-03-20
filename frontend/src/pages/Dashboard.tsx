import { useEffect, useState } from 'react';
import { Row, Col, Card, Spin, message, Typography, Table, Tag, List, Button, Space, Divider } from 'antd';
import {
  ToolOutlined,
  DollarOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  BankOutlined,
  FireOutlined,
  AimOutlined,
  CarOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../api/analytics';
import { getFields } from '../api/fields';
import { getNotifications, type NotificationDto } from '../api/notifications';
import type { DashboardDto } from '../types/analytics';
import type { FieldDto } from '../types/field';
import PageHeader from '../components/PageHeader';
import { useTranslation } from '../i18n';

dayjs.extend(relativeTime);

const CARD = { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12 };
const SECTION_GAP = { marginTop: 24 };
const ONBOARDING_THRESHOLD_FIELDS = 3;

const { Text } = Typography;

export default function Dashboard() {
  const [data, setData] = useState<DashboardDto | null>(null);
  const [fields, setFields] = useState<FieldDto[]>([]);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getDashboard(),
      getFields({ pageSize: 8 }),
      getNotifications({ pageSize: 8 }),
    ])
      .then(([dash, fieldsRes, notifs]) => {
        setData(dash);
        setFields(fieldsRes.items);
        setNotifications(notifs);
      })
      .catch(() => message.error(t.dashboard.loadError))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!data) return null;

  // ── Chart data ────────────────────────────────────────────────────────────
  const costTrendData = data.costTrend.map((item) => ({
    name: `${item.year}-${String(item.month).padStart(2, '0')}`,
    cost: item.totalAmount,
  }));

  // ── Monthly KPIs ──────────────────────────────────────────────────────────
  const now = dayjs();
  const currentMonthTrend = data.costTrend.find(
    (tr) => tr.year === now.year() && tr.month === now.month() + 1,
  );
  const monthlyExpenses = currentMonthTrend?.totalAmount ?? 0;
  // Revenue model not yet implemented; placeholder until a revenue entity is added.
  const monthlyRevenue = 0;
  const monthlyProfit = monthlyRevenue - monthlyExpenses;

  // ── Notification icon ─────────────────────────────────────────────────────
  const notifIcon = (type: string) => {
    if (type === 'warning') return <WarningOutlined style={{ color: 'var(--warning)', fontSize: 16 }} />;
    if (type === 'error') return <CloseCircleOutlined style={{ color: 'var(--error)', fontSize: 16 }} />;
    return <InfoCircleOutlined style={{ color: 'var(--info)', fontSize: 16 }} />;
  };

  // ── Field status columns ──────────────────────────────────────────────────
  const fieldColumns = [
    {
      title: t.fields.name,
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (v: string) => <Text style={{ color: 'var(--text-primary)' }}>{v}</Text>,
    },
    {
      title: t.fields.currentCrop,
      dataIndex: 'currentCrop',
      key: 'currentCrop',
      render: (crop: string | undefined) =>
        crop
          ? <Tag color="green" style={{ borderRadius: 4, fontSize: 11 }}>{t.crops[crop as keyof typeof t.crops] || crop}</Tag>
          : <Tag style={{ borderRadius: 4, fontSize: 11, color: 'var(--text-secondary)', border: '1px solid var(--border)', background: 'transparent' }}>{t.fields.notSeeded}</Tag>,
    },
    {
      title: t.fields.area,
      dataIndex: 'areaHectares',
      key: 'areaHectares',
      render: (v: number) => <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v.toFixed(1)} ha</Text>,
    },
  ];

  return (
    <div className="page-enter">
      <PageHeader title={t.dashboard.title} subtitle={t.dashboard.subtitle} />

      {/* Onboarding wizard — shown when fewer than ONBOARDING_THRESHOLD_FIELDS fields exist */}
      {fields.length < ONBOARDING_THRESHOLD_FIELDS && (
        <Card style={{
          background: 'var(--agro-bg-card)',
          border: '1px solid var(--agro-border)',
          textAlign: 'center',
          padding: '40px 20px',
          marginBottom: 24,
          borderRadius: 12,
        }}>
          <Typography.Title level={3} style={{ color: 'var(--agro-text-primary)' }}>
            {t.dashboard.welcome}
          </Typography.Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
            {t.dashboard.setupGuide}
          </Text>

          <Space direction="vertical" size={12} style={{ width: 280 }}>
            <Button block type="primary" icon={<AimOutlined />} onClick={() => navigate('/fields')}>
              1. {t.dashboard.addFields}
            </Button>
            <Button block icon={<CarOutlined />} onClick={() => navigate('/machinery')}>
              2. {t.dashboard.addMachinery}
            </Button>
            <Button block icon={<InboxOutlined />} onClick={() => navigate('/warehouses/items')}>
              3. {t.dashboard.addWarehouse}
            </Button>
            <Button block icon={<ToolOutlined />} onClick={() => navigate('/operations')}>
              4. {t.dashboard.addOperation}
            </Button>
          </Space>

          <Divider style={{ borderColor: 'var(--agro-border)' }} />

          <Button
            onClick={async () => {
              try {
                const { default: apiClient } = await import('../api/axios');
                await apiClient.post('/api/tenants/seed-demo');
                message.success(t.dashboard.demoLoaded);
                setTimeout(() => window.location.reload(), 500);
              } catch {
                message.error(t.dashboard.demoError);
              }
            }}
          >
            {t.dashboard.loadDemo}
          </Button>
        </Card>
      )}

      {/* KPI Section — 4 cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={CARD}>
            <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t.dashboard.totalArea}
            </Text>
            <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
              {data.totalAreaHectares.toFixed(0)}{' '}
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>га</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={CARD}>
            <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t.dashboard.monthlyExpenses}
            </Text>
            <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
              {monthlyExpenses.toFixed(0)}{' '}
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>₴</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={CARD}>
            <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t.dashboard.monthlyRevenue}
            </Text>
            <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
              {monthlyRevenue.toFixed(0)}{' '}
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>₴</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={CARD}>
            <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t.dashboard.monthlyProfit}
            </Text>
            <div style={{
              fontSize: 28, fontWeight: 600,
              color: monthlyProfit >= 0 ? 'var(--success)' : 'var(--error)',
              marginTop: 4,
            }}>
              {monthlyProfit.toFixed(0)}{' '}
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>₴</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={12} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Button block icon={<ToolOutlined />} onClick={() => navigate('/operations')}>
            {t.dashboard.quickOperation}
          </Button>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Button block icon={<FireOutlined />} onClick={() => navigate('/fuel')}>
            {t.dashboard.quickFuel}
          </Button>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Button block icon={<BankOutlined />} onClick={() => navigate('/grain')}>
            {t.dashboard.quickGrain}
          </Button>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Button block icon={<DollarOutlined />} onClick={() => navigate('/economics')}>
            {t.dashboard.quickCost}
          </Button>
        </Col>
      </Row>

      {/* Alerts */}
      {(data.underRepairMachines > 0 || data.pendingOperations > 0) && (
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {data.underRepairMachines > 0 && (
            <Col xs={24} sm={12}>
              <div className="alert-card error">
                <Typography.Text style={{ color: 'var(--error)', fontWeight: 600, fontSize: 13 }}>
                  <WarningOutlined style={{ marginRight: 8 }} />
                  {data.underRepairMachines} {t.dashboard.machinesUnderRepair}
                </Typography.Text>
              </div>
            </Col>
          )}
          {data.pendingOperations > 0 && (
            <Col xs={24} sm={12}>
              <div className="alert-card">
                <Typography.Text style={{ color: 'var(--warning)', fontWeight: 600, fontSize: 13 }}>
                  <ClockCircleOutlined style={{ marginRight: 8 }} />
                  {data.pendingOperations} {t.dashboard.pendingOpsAlert}
                </Typography.Text>
              </div>
            </Col>
          )}
        </Row>
      )}

      {/* Fields Status + Activity Feed */}
      <Row gutter={[16, 16]} style={SECTION_GAP}>
        {/* Left: Fields status */}
        <Col xs={24} xl={14}>
          <Card
            title={
              <Text strong style={{ color: 'var(--text-primary)' }}>
                {t.dashboard.fieldsStatus}
              </Text>
            }
            style={CARD}
            styles={{ body: { padding: 0 } }}
          >
            <Table
              dataSource={fields}
              columns={fieldColumns}
              rowKey="id"
              size="small"
              pagination={false}
              locale={{ emptyText: <Text style={{ color: 'var(--text-secondary)' }}>{t.dashboard.noFieldsData}</Text> }}
              scroll={{ x: true }}
            />
          </Card>
        </Col>

        {/* Right: Activity feed */}
        <Col xs={24} xl={10}>
          <Card
            title={
              <Text strong style={{ color: 'var(--text-primary)' }}>
                {t.dashboard.activityFeed}
              </Text>
            }
            style={CARD}
          >
            {notifications.length === 0 ? (
              <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                {t.dashboard.noActivity}
              </Text>
            ) : (
              <List
                dataSource={notifications.slice(0, 8)}
                split={false}
                renderItem={(n) => (
                  <List.Item style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <Space>
                      {notifIcon(n.type)}
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {dayjs(n.createdAtUtc).format('HH:mm')}
                      </Text>
                      <Text style={{ fontSize: 13 }}>{n.title}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Cost Trend Chart — only when data is available */}
      {costTrendData.length > 0 && (
        <Row gutter={[16, 16]} style={SECTION_GAP}>
          <Col xs={24} lg={12}>
            <Card title={t.dashboard.costTrend} style={CARD}>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={costTrendData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} stroke="var(--border)" />
                  <YAxis stroke="var(--border)" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} width={48} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cost" stroke="var(--error)" name={t.dashboard.costsUAH} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
