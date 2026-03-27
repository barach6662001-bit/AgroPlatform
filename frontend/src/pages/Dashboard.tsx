import { useEffect } from 'react';
import { Row, Col, Card, message, Typography, Table, Tag, List, Button, Space } from 'antd';
import TableSkeleton from '../components/TableSkeleton';
import {
  ToolOutlined,
  DollarOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  BankOutlined,
  FireOutlined,
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
import type { NotificationDto } from '../api/notifications';
import type { FieldDto } from '../types/field';
import PageHeader from '../components/PageHeader';
import WeatherWidget from '../components/WeatherWidget';
import { useTranslation } from '../i18n';
import { useDashboardQuery, useDashboardNotificationsQuery, useDashboardFieldsQuery } from '../hooks/useDashboardQuery';

dayjs.extend(relativeTime);

const CARD = { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12 };
const SECTION_GAP = { marginTop: 24 };

const { Text } = Typography;

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isLoading: dashLoading, isError: dashError } = useDashboardQuery();
  const { data: notificationsData, isLoading: notifsLoading } = useDashboardNotificationsQuery();
  const { data: fieldsData, isLoading: fieldsLoading } = useDashboardFieldsQuery();

  const loading = dashLoading || notifsLoading || fieldsLoading;
  const notifications: NotificationDto[] = notificationsData ?? [];
  const fields: FieldDto[] = fieldsData?.items ?? [];

  useEffect(() => {
    if (dashError) {
      message.error(t.dashboard.loadError);
    }
  }, [dashError, t.dashboard.loadError]);

  if (loading) return <TableSkeleton rows={8} />;
  if (!data) return null;

  // ── Chart data ────────────────────────────────────────────────────────────
  const costTrendData = data.costTrend.map((item) => ({
    name: `${item.year}-${String(item.month).padStart(2, '0')}`,
    cost: item.totalAmount,
  }));

  // ── Monthly KPIs ──────────────────────────────────────────────────────────
  const latestCostPeriod = data.costTrend[data.costTrend.length - 1];
  const prevCostPeriod = data.costTrend.length > 1 ? data.costTrend[data.costTrend.length - 2] : undefined;
  const monthlyExpenses = latestCostPeriod?.totalAmount ?? 0;

  const latestRevenuePeriod = data.revenueTrend?.[data.revenueTrend.length - 1];
  const prevRevenuePeriod = data.revenueTrend?.length > 1 ? data.revenueTrend[data.revenueTrend.length - 2] : undefined;
  const monthlyRevenue = latestRevenuePeriod?.totalAmount ?? 0;
  const monthlyProfit = monthlyRevenue - monthlyExpenses;

  const expenseDelta = monthlyExpenses - (prevCostPeriod?.totalAmount ?? 0);
  const revenueDelta = monthlyRevenue - (prevRevenuePeriod?.totalAmount ?? 0);
  const prevProfit = (prevRevenuePeriod?.totalAmount ?? 0) - (prevCostPeriod?.totalAmount ?? 0);
  const profitDelta = monthlyProfit - prevProfit;

  const periodLabel = (p?: { month: number; year: number }) =>
    p ? `${String(p.month).padStart(2, '0')}/${p.year}` : '—';

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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <PageHeader title={t.dashboard.title} subtitle={t.dashboard.subtitle} />
        <WeatherWidget />
      </div>

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
            <Text style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              {data.totalFields} {t.dashboard.fieldsCount}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={CARD}>
            <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t.dashboard.monthlyExpenses} ({periodLabel(latestCostPeriod)})
            </Text>
            <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
              {monthlyExpenses.toFixed(0)}{' '}
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>₴</span>
            </div>
            {prevCostPeriod && (
              <Text style={{ fontSize: 11, color: expenseDelta > 0 ? 'var(--error)' : 'var(--success)' }}>
                {expenseDelta > 0 ? '▲' : '▼'} {Math.abs(expenseDelta).toFixed(0)} ₴ {t.dashboard.vsPrevMonth}
              </Text>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={CARD}>
            <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t.dashboard.monthlyRevenue} ({periodLabel(latestRevenuePeriod)})
            </Text>
            <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
              {monthlyRevenue.toFixed(0)}{' '}
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>₴</span>
            </div>
            {prevRevenuePeriod && (
              <Text style={{ fontSize: 11, color: revenueDelta >= 0 ? 'var(--success)' : 'var(--error)' }}>
                {revenueDelta >= 0 ? '▲' : '▼'} {Math.abs(revenueDelta).toFixed(0)} ₴ {t.dashboard.vsPrevMonth}
              </Text>
            )}
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
            {prevCostPeriod && (
              <Text style={{ fontSize: 11, color: profitDelta >= 0 ? 'var(--success)' : 'var(--error)' }}>
                {profitDelta >= 0 ? '▲' : '▼'} {Math.abs(profitDelta).toFixed(0)} ₴ {t.dashboard.vsPrevMonth}
              </Text>
            )}
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
