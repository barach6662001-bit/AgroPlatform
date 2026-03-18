import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Row, Col, Card, Spin, message, Typography, Table, Tag, List, Badge } from 'antd';
import {
  AimOutlined,
  CarOutlined,
  ToolOutlined,
  DollarOutlined,
  InboxOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getDashboard } from '../api/analytics';
import { getFields } from '../api/fields';
import { getMachines } from '../api/machinery';
import { getNotifications, type NotificationDto } from '../api/notifications';
import type { DashboardDto } from '../types/analytics';
import type { FieldDto } from '../types/field';
import type { MachineDto } from '../types/machinery';
import PageHeader from '../components/PageHeader';
import { useTranslation } from '../i18n';
import { CHART_COLORS } from '../theme/darkTheme';

dayjs.extend(relativeTime);

const CARD = { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12 };
const SECTION_GAP = { marginTop: 24 };

interface StatCardProps {
  label: string;
  value: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
}

function StatCard({ label, value, subtitle, icon }: StatCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${hovered ? 'var(--border-strong)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.15s ease',
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
        {icon && (
          <div style={{
            width: 28,
            height: 28,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            fontSize: 13,
          }}>
            {icon}
          </div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1 }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardDto | null>(null);
  const [fields, setFields] = useState<FieldDto[]>([]);
  const [machines, setMachines] = useState<MachineDto[]>([]);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    Promise.all([
      getDashboard(),
      getFields({ pageSize: 8 }),
      getMachines({ pageSize: 8 }),
      getNotifications({ pageSize: 6 }),
    ])
      .then(([dash, fieldsRes, machinesRes, notifs]) => {
        setData(dash);
        setFields(fieldsRes.items);
        setMachines(machinesRes.items);
        setNotifications(notifs);
      })
      .catch(() => message.error(t.dashboard.loadError))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!data) return null;

  // ── Chart data ───────────────────────────────────────────────────────────
  const operationsData = Object.entries(data.operationsByType).map(([type, count]) => ({
    name: t.operationTypes[type as keyof typeof t.operationTypes] || type,
    value: count,
  }));

  const areaData = Object.entries(data.areaByCrop).map(([crop, area]) => ({
    name: t.crops[crop as keyof typeof t.crops] || crop,
    area: Number(area.toFixed(1)),
  }));

  const costTrendData = data.costTrend.map((item) => ({
    name: `${item.year}-${String(item.month).padStart(2, '0')}`,
    cost: item.totalAmount,
  }));

  // ── Derived KPI ──────────────────────────────────────────────────────────
  const cropEntries = Object.entries(data.areaByCrop).sort(([, a], [, b]) => b - a);
  const topCrop = cropEntries[0];
  const topCropName = topCrop
    ? (t.crops[topCrop[0] as keyof typeof t.crops] || topCrop[0])
    : '—';
  const cropCount = cropEntries.length;

  // ── Field status columns ──────────────────────────────────────────────────
  const fieldColumns = [
    {
      title: t.fields.name,
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (v: string) => <Typography.Text style={{ color: 'var(--text-primary)' }}>{v}</Typography.Text>,
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
      render: (v: number) => <Typography.Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v.toFixed(1)} ha</Typography.Text>,
    },
  ];

  // ── Machinery status columns ──────────────────────────────────────────────
  const statusColor: Record<string, string> = {
    Active: 'green',
    UnderRepair: 'orange',
    Decommissioned: 'red',
  };

  const machineryColumns = [
    {
      title: t.machinery.name,
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (v: string) => <Typography.Text style={{ color: 'var(--text-primary)' }}>{v}</Typography.Text>,
    },
    {
      title: t.machinery.type,
      dataIndex: 'type',
      key: 'type',
      render: (v: string) => <Typography.Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{t.machineryTypes[v as keyof typeof t.machineryTypes] || v}</Typography.Text>,
    },
    {
      title: t.machinery.status,
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <Tag color={statusColor[s] || 'default'} style={{ borderRadius: 4, fontSize: 11 }}>
          {t.machineryStatuses[s as keyof typeof t.machineryStatuses] || s}
        </Tag>
      ),
    },
  ];

  // ── Notification icon ─────────────────────────────────────────────────────
  const notifIcon = (type: string) => {
    if (type === 'warning') return <WarningOutlined style={{ color: 'var(--warning)', fontSize: 16 }} />;
    if (type === 'error') return <CloseCircleOutlined style={{ color: 'var(--error)', fontSize: 16 }} />;
    return <InfoCircleOutlined style={{ color: 'var(--info)', fontSize: 16 }} />;
  };

  const hasChartData = operationsData.length > 0 || areaData.length > 0 || costTrendData.length > 0;

  return (
    <div className="page-enter">
      <PageHeader title={t.dashboard.title} subtitle={t.dashboard.subtitle} />

      {/* KPI Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 12,
        marginBottom: 24,
      }}>
        <StatCard
          label={t.dashboard.fields}
          value={data.totalFields}
          subtitle={`${data.totalAreaHectares.toFixed(0)} ha ${t.dashboard.areaLabel}`}
          icon={<AimOutlined />}
        />
        <StatCard
          label={t.dashboard.activeMachinery}
          value={<>{data.activeMachines}<span style={{ fontSize: 16, color: 'var(--text-tertiary)', fontWeight: 400 }}>/{data.totalMachines}</span></>}
          subtitle={`${cropCount} ${t.dashboard.cropTypes}`}
          icon={<CarOutlined />}
        />
        <StatCard
          label={t.dashboard.warehouses}
          value={data.totalWarehouseItems}
          icon={<InboxOutlined />}
        />
        <StatCard
          label={t.dashboard.cropStatus}
          value={Object.keys(data.areaByCrop).length}
          subtitle={topCropName !== '—' ? topCropName : t.dashboard.cropTypes}
          icon={<ToolOutlined />}
        />
        <StatCard
          label={t.dashboard.area}
          value={<>{data.totalAreaHectares.toFixed(1)}<span style={{ fontSize: 14, color: 'var(--text-tertiary)', marginLeft: 4 }}>ha</span></>}
        />
        <StatCard
          label={t.dashboard.hoursWorked}
          value={<>{data.totalHoursWorked.toFixed(1)}<span style={{ fontSize: 14, color: 'var(--text-tertiary)', marginLeft: 4 }}>h</span></>}
          icon={<ClockCircleOutlined />}
        />
        <StatCard
          label={t.dashboard.costs}
          value={<>{data.totalCosts.toFixed(0)}<span style={{ fontSize: 14, color: 'var(--text-tertiary)', marginLeft: 4 }}>₴</span></>}
          icon={<DollarOutlined />}
        />
      </div>

      {/* Alerts section */}
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

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {costTrendData.length > 0 && (
          <Col xs={24} lg={8}>
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
        )}

        {operationsData.length > 0 && (
          <Col xs={24} lg={8}>
            <Card title={t.dashboard.operationsByType}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={operationsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {operationsData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}

        {areaData.length > 0 && (
          <Col xs={24} lg={8}>
            <Card title={t.dashboard.areaByCrop}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={areaData} dataKey="area" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {areaData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}

        {!hasChartData && (
          <Col span={24}>
            <Card style={CARD}>
              <Typography.Text type="secondary">{t.dashboard.noChartData}</Typography.Text>
            </Card>
          </Col>
        )}
      </Row>

      {/* ═══ ZONE 3: OPERATIONS STATUS  +  ZONE 4: ACTIVITY FEED ════════════ */}
      <Row gutter={[16, 16]} style={SECTION_GAP}>
        {/* Left: status tables */}
        <Col xs={24} xl={14}>
          <Row gutter={[16, 16]}>
            {/* Fields Status */}
            <Col span={24}>
              <Card
                title={
                  <Typography.Text strong style={{ color: 'var(--text-primary)' }}>
                    {t.dashboard.fieldsStatus}
                  </Typography.Text>
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
                  locale={{ emptyText: <Typography.Text style={{ color: 'var(--text-secondary)' }}>{t.dashboard.noFieldsData}</Typography.Text> }}
                  scroll={{ x: true }}
                />
              </Card>
            </Col>

            {/* Machinery Status */}
            <Col span={24}>
              <Card
                title={
                  <Typography.Text strong style={{ color: 'var(--text-primary)' }}>
                    {t.dashboard.machineryStatus}
                  </Typography.Text>
                }
                style={CARD}
                styles={{ body: { padding: 0 } }}
              >
                <Table
                  dataSource={machines}
                  columns={machineryColumns}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  locale={{ emptyText: <Typography.Text style={{ color: 'var(--text-secondary)' }}>{t.dashboard.noMachineryData}</Typography.Text> }}
                  scroll={{ x: true }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Right: warehouse overview + activity feed */}
        <Col xs={24} xl={10}>
          <Row gutter={[16, 16]}>
            {/* Warehouse Overview */}
            <Col span={24}>
              <Card
                title={
                  <Typography.Text strong style={{ color: 'var(--text-primary)' }}>
                    {t.dashboard.warehouseOverview}
                  </Typography.Text>
                }
                style={CARD}
                styles={{ body: { padding: 0 } }}
              >
                <Table
                  dataSource={data.topStockItems.slice(0, 6)}
                  rowKey="itemId"
                  size="small"
                  pagination={false}
                  locale={{ emptyText: <Typography.Text style={{ color: 'var(--text-secondary)' }}>—</Typography.Text> }}
                  columns={[
                    {
                      title: t.warehouses.item,
                      dataIndex: 'itemName',
                      key: 'itemName',
                      ellipsis: true,
                      render: (v: string) => <Typography.Text style={{ color: 'var(--text-primary)', fontSize: 13 }}>{v}</Typography.Text>,
                    },
                    {
                      title: t.warehouses.balance,
                      key: 'balance',
                      render: (_: unknown, r: { totalBalance: number; baseUnit: string }) => (
                        <Typography.Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                          {r.totalBalance.toFixed(1)} {r.baseUnit}
                        </Typography.Text>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>

            {/* Activity Feed */}
            <Col span={24}>
              <Card
                title={
                  <Typography.Text strong style={{ color: 'var(--text-primary)' }}>
                    {t.dashboard.activityFeed}
                  </Typography.Text>
                }
                style={CARD}
              >
                {notifications.length === 0 ? (
                  <Typography.Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {t.dashboard.noActivity}
                  </Typography.Text>
                ) : (
                  <List
                    dataSource={notifications.slice(0, 6)}
                    split={false}
                    renderItem={(item) => (
                      <List.Item
                        style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}
                        extra={!item.isRead ? <Badge dot color="var(--accent)" style={{ marginTop: 6 }} /> : null}
                      >
                        <List.Item.Meta
                          avatar={notifIcon(item.type)}
                          title={
                            <Typography.Text style={{ fontSize: 13, color: item.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                              {item.title}
                            </Typography.Text>
                          }
                          description={
                            <Typography.Text style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
                              <ClockCircleOutlined style={{ marginRight: 4 }} />
                              {dayjs(item.createdAtUtc).fromNow()}
                            </Typography.Text>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
