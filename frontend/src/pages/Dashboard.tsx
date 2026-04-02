import { useEffect } from 'react';
import { Row, Col, Card, message, Typography, Table, Tag, List, Button, Space } from 'antd';
import TableSkeleton from '../components/TableSkeleton';
import {
  ToolOutlined,
  DollarOutlined,
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
import { useNavigate, Navigate } from 'react-router-dom';
import type { NotificationDto } from '../api/notifications';
import type { FieldDto } from '../types/field';
import type { AgroOperationDto } from '../types/operation';
import PageHeader from '../components/PageHeader';
import WeatherWidget from '../components/WeatherWidget';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import OperationsTimeline from '../components/dashboard/OperationsTimeline';
import { useTranslation } from '../i18n';
import { useAuthStore } from '../stores/authStore';
import {
  useDashboardQuery,
  useDashboardNotificationsQuery,
  useDashboardFieldsQuery,
  useDashboardOperationsQuery,
} from '../hooks/useDashboardQuery';

dayjs.extend(relativeTime);

const CARD = { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12 };

const { Text } = Typography;

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);

  const { data, isLoading: dashLoading, isError: dashError } = useDashboardQuery();
  const { data: notificationsData, isLoading: notifsLoading } = useDashboardNotificationsQuery();
  const { data: fieldsData, isLoading: fieldsLoading } = useDashboardFieldsQuery();
  const { data: operationsData, isLoading: opsLoading } = useDashboardOperationsQuery();

  const loading = dashLoading || notifsLoading || fieldsLoading || opsLoading;
  const notifications: NotificationDto[] = notificationsData ?? [];
  const fields: FieldDto[] = fieldsData?.items ?? [];
  const operations: AgroOperationDto[] = operationsData?.items ?? [];

  useEffect(() => {
    if (dashError) {
      message.error(t.dashboard.loadError);
    }
  }, [dashError, t.dashboard.loadError]);

  if (role === 'SuperAdmin') {
    return <Navigate to="/superadmin/companies" replace />;
  }

  if (loading) return <TableSkeleton rows={8} />;
  if (!data) return null;

  const isStorekeeper = role === 'WarehouseOperator';
  const isDirector = role === 'Accountant';

  const costTrendData = data.costTrend.map((item) => ({
    name: `${item.year}-${String(item.month).padStart(2, '0')}`,
    cost: item.totalAmount,
  }));

  const monthlyExpenses = data.monthlyExpenses;
  const monthlyRevenue = data.monthlyRevenue;
  const monthlyProfit = data.monthlyProfit;

  const notifIcon = (type: string) => {
    if (type === 'warning') return <span style={{ color: 'var(--warning)', fontSize: 16 }}>⚠</span>;
    if (type === 'error') return <span style={{ color: 'var(--error)', fontSize: 16 }}>✕</span>;
    return <span style={{ color: 'var(--info)', fontSize: 16 }}>ℹ</span>;
  };

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

  // 5 KPI cards
  const kpiCards = isDirector
    ? [
        { label: t.dashboard.monthlyRevenue, val: monthlyRevenue, unit: '₴' },
        { label: t.dashboard.monthlyProfit, val: monthlyProfit, unit: '₴', colored: true },
        { label: t.dashboard.monthlyExpenses, val: monthlyExpenses, unit: '₴' },
        { label: t.dashboard.totalArea, val: data.totalAreaHectares, unit: 'га' },
        { label: t.dashboard.totalMachines, val: data.totalMachines, unit: '', sub: `${data.activeMachines} ${t.dashboard.activeCount}` },
      ]
    : [
        { label: t.dashboard.totalArea, val: data.totalAreaHectares, unit: 'га' },
        { label: t.dashboard.monthlyExpenses, val: monthlyExpenses, unit: '₴' },
        { label: t.dashboard.monthlyRevenue, val: monthlyRevenue, unit: '₴' },
        { label: t.dashboard.monthlyProfit, val: monthlyProfit, unit: '₴', colored: true },
        { label: t.dashboard.totalMachines, val: data.totalMachines, unit: '', sub: `${data.activeMachines} ${t.dashboard.activeCount}` },
      ];

  return (
    <div className="page-enter">
      {/* Header + Weather */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <PageHeader title={t.dashboard.title} subtitle={t.dashboard.subtitle} />
        <WeatherWidget />
      </div>

      {/* 5 KPI Cards */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {kpiCards.map((kpi, i) => (
          <Col xs={24} sm={12} md={8} lg={4} xl={4} key={i} style={i === 4 ? { flex: '1 1 0' } : undefined}>
            <Card size="small" style={CARD} bodyStyle={{ padding: '14px 16px' }}>
              <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {kpi.label}
              </Text>
              <div style={{
                fontSize: 24, fontWeight: 600, marginTop: 2,
                color: kpi.colored ? (kpi.val >= 0 ? 'var(--success)' : 'var(--error)') : 'var(--text-primary)',
              }}>
                {typeof kpi.val === 'number' ? kpi.val.toFixed(0) : kpi.val}
                {kpi.unit && <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 4 }}>{kpi.unit}</span>}
              </div>
              {kpi.sub && (
                <Text style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{kpi.sub}</Text>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* Alerts */}
      {(data.underRepairMachines > 0 || data.pendingOperations > 0) && (
        <div style={{ marginBottom: 20 }}>
          <AlertsPanel
            underRepairMachines={data.underRepairMachines}
            pendingOperations={data.pendingOperations}
          />
        </div>
      )}

      {/* Quick Actions */}
      <Row gutter={12} style={{ marginBottom: 20 }}>
        {isStorekeeper ? (
          <>
            <Col xs={12} sm={6}><Button block icon={<BankOutlined />} onClick={() => navigate('/warehouses')}>{t.nav.warehouses}</Button></Col>
            <Col xs={12} sm={6}><Button block icon={<ToolOutlined />} onClick={() => navigate('/warehouses/movements')}>{t.nav.movements}</Button></Col>
            <Col xs={12} sm={6}><Button block icon={<FireOutlined />} onClick={() => navigate('/fuel')}>{t.dashboard.quickFuel}</Button></Col>
            <Col xs={12} sm={6}><Button block icon={<DollarOutlined />} onClick={() => navigate('/economics')}>{t.dashboard.quickCost}</Button></Col>
          </>
        ) : isDirector ? (
          <>
            <Col xs={12} sm={6}><Button block icon={<DollarOutlined />} onClick={() => navigate('/economics')}>{t.dashboard.quickCost}</Button></Col>
            <Col xs={12} sm={6}><Button block icon={<DollarOutlined />} onClick={() => navigate('/economics/pnl')}>{t.nav.pnl}</Button></Col>
            <Col xs={12} sm={6}><Button block icon={<ToolOutlined />} onClick={() => navigate('/operations')}>{t.dashboard.quickOperation}</Button></Col>
            <Col xs={12} sm={6}><Button block icon={<BankOutlined />} onClick={() => navigate('/grain')}>{t.dashboard.quickGrain}</Button></Col>
          </>
        ) : (
          <>
            <Col xs={12} sm={6}><Button block icon={<ToolOutlined />} onClick={() => navigate('/operations')}>{t.dashboard.quickOperation}</Button></Col>
            <Col xs={12} sm={6}><Button block icon={<FireOutlined />} onClick={() => navigate('/fuel')}>{t.dashboard.quickFuel}</Button></Col>
            <Col xs={12} sm={6}><Button block icon={<BankOutlined />} onClick={() => navigate('/grain')}>{t.dashboard.quickGrain}</Button></Col>
            <Col xs={12} sm={6}><Button block icon={<DollarOutlined />} onClick={() => navigate('/economics')}>{t.dashboard.quickCost}</Button></Col>
          </>
        )}
      </Row>

      {/* Main content: Fields + Operations + Activity */}
      <Row gutter={[16, 16]}>
        {/* Left: Fields status */}
        <Col xs={24} xl={14}>
          <Card
            title={<Text strong style={{ color: 'var(--text-primary)' }}>{t.dashboard.fieldsStatus}</Text>}
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

        {/* Right: Operations Timeline + Activity Feed */}
        <Col xs={24} xl={10}>
          <Card
            title={<Text strong style={{ color: 'var(--text-primary)' }}>{t.dashboard.recentOperations}</Text>}
            style={{ ...CARD, marginBottom: 16 }}
          >
            <OperationsTimeline operations={operations.slice(0, 6)} />
          </Card>

          <Card
            title={<Text strong style={{ color: 'var(--text-primary)' }}>{t.dashboard.activityFeed}</Text>}
            style={CARD}
          >
            {notifications.length === 0 ? (
              <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t.dashboard.noActivity}</Text>
            ) : (
              <List
                dataSource={notifications.slice(0, 6)}
                split={false}
                renderItem={(n) => (
                  <List.Item style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <Space>
                      {notifIcon(n.type)}
                      <Text type="secondary" style={{ fontSize: 11 }}>{dayjs(n.createdAtUtc).format('HH:mm')}</Text>
                      <Text style={{ fontSize: 13 }}>{n.title}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Cost Trend Chart */}
      {costTrendData.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
          <Col xs={24} lg={16}>
            <Card title={t.dashboard.costTrend} style={CARD}>
              <ResponsiveContainer width="100%" height={220}>
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
