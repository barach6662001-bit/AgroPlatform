import { useEffect } from 'react';
import { Row, Col, Card, message, Typography, Table, Tag, List, Button, Space } from 'antd';
import TableSkeleton from '../components/TableSkeleton';
import {
  ToolOutlined,
  DollarOutlined,
  BankOutlined,
  FireOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
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
import { formatUA } from '../utils/numberFormat';
import {
  useDashboardQuery,
  useDashboardNotificationsQuery,
  useDashboardFieldsQuery,
  useDashboardOperationsQuery,
} from '../hooks/useDashboardQuery';
import s from './Dashboard.module.css';

dayjs.extend(relativeTime);

const { Text } = Typography;

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);

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

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (loading) return <TableSkeleton rows={8} />;
  if (!data) return null;

  const isWarehouseOp = role === 'WarehouseOperator';
  const isAccountant = role === 'Accountant';

  const costTrendData = data.costTrend.map((item) => ({
    name: `${item.year}-${String(item.month).padStart(2, '0')}`,
    cost: item.totalAmount,
  }));

  const monthlyExpenses = data.monthlyExpenses;
  const monthlyRevenue = data.monthlyRevenue;
  const monthlyProfit = data.monthlyProfit;

  const notifIcon = (type: string) => {
    if (type === 'warning') return <WarningOutlined className={s.notifIcon} style={{ color: 'var(--warning)' }} />;
    if (type === 'error') return <CloseCircleOutlined className={s.notifIcon} style={{ color: 'var(--error)' }} />;
    return <InfoCircleOutlined className={s.notifIcon} style={{ color: 'var(--info)' }} />;
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
  const kpiCards = isAccountant
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
      <div className={s.flex_between_wrap}>
        <PageHeader title={t.dashboard.title} subtitle={t.dashboard.subtitle} />
        <WeatherWidget />
      </div>

      {/* 5 KPI Cards */}
      <div className={s.kpiGrid}>
        {kpiCards.map((kpi, i) => (
          <div key={i} className={s.kpiCard}>
            <div className={s.kpiLabel}>{kpi.label}</div>
            <div className={s.kpiValue} style={{
              color: kpi.colored ? (kpi.val >= 0 ? 'var(--success)' : 'var(--error)') : undefined,
            }}>
              {typeof kpi.val === 'number' ? formatUA(kpi.val) : kpi.val}
              {kpi.unit && <span className={s.kpiUnit}>{kpi.unit}</span>}
            </div>
            {kpi.sub && <div className={s.kpiSub}>{kpi.sub}</div>}
          </div>
        ))}
      </div>

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
      <div className={s.quickActions}>
        {isWarehouseOp ? (
          <>
            <Button block icon={<BankOutlined />} onClick={() => navigate('/warehouses')}>{t.nav.warehouses}</Button>
            <Button block icon={<ToolOutlined />} onClick={() => navigate('/warehouses/movements')}>{t.nav.movements}</Button>
            <Button block icon={<FireOutlined />} onClick={() => navigate('/fuel')}>{t.dashboard.quickFuel}</Button>
            <Button block icon={<DollarOutlined />} onClick={() => navigate('/economics')}>{t.dashboard.quickCost}</Button>
          </>
        ) : isAccountant ? (
          <>
            <Button block icon={<DollarOutlined />} onClick={() => navigate('/economics')}>{t.dashboard.quickCost}</Button>
            <Button block icon={<DollarOutlined />} onClick={() => navigate('/economics/pnl')}>{t.nav.pnl}</Button>
            <Button block icon={<ToolOutlined />} onClick={() => navigate('/operations')}>{t.dashboard.quickOperation}</Button>
            <Button block icon={<BankOutlined />} onClick={() => navigate('/grain')}>{t.dashboard.quickGrain}</Button>
          </>
        ) : (
          <>
            <Button block icon={<ToolOutlined />} onClick={() => navigate('/operations')}>{t.dashboard.quickOperation}</Button>
            <Button block icon={<FireOutlined />} onClick={() => navigate('/fuel')}>{t.dashboard.quickFuel}</Button>
            <Button block icon={<BankOutlined />} onClick={() => navigate('/grain')}>{t.dashboard.quickGrain}</Button>
            <Button block icon={<DollarOutlined />} onClick={() => navigate('/economics')}>{t.dashboard.quickCost}</Button>
          </>
        )}
      </div>

      {/* Main content: Fields + Operations + Activity */}
      <Row gutter={[16, 16]}>
        {/* Left: Fields status */}
        <Col xs={24} xl={14}>
          <Card
            title={<Text strong style={{ color: 'var(--text-primary)' }}>{t.dashboard.fieldsStatus}</Text>}
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
            style={{ marginBottom: 16 }}
          >
            <OperationsTimeline operations={operations.slice(0, 6)} />
          </Card>

          <Card
            title={<Text strong style={{ color: 'var(--text-primary)' }}>{t.dashboard.activityFeed}</Text>}
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
        <Card title={t.dashboard.costTrend} style={{ marginTop: 20 }}>
          <ResponsiveContainer width="100%" height={260}>
                <LineChart data={costTrendData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} stroke="var(--border)" />
                  <YAxis stroke="var(--border)" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} width={48} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cost" stroke="var(--error)" name={t.dashboard.costsUAH} strokeWidth={2} />
                </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
