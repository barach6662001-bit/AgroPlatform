import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Typography } from 'antd';
import {
  AimOutlined,
  CarOutlined,
  ToolOutlined,
  DollarOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getDashboard } from '../api/analytics';
import type { DashboardDto } from '../types/analytics';
import PageHeader from '../components/PageHeader';
import { useTranslation } from '../i18n';
import { CHART_COLORS } from '../theme/darkTheme';


export default function Dashboard() {
  const [data, setData] = useState<DashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => message.error(t.dashboard.loadError))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!data) return null;

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
    cost: item.totalCost,
  }));

  return (
    <div>
      <PageHeader title={t.dashboard.title} subtitle={t.dashboard.subtitle} />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title={t.dashboard.fields}
              value={data.totalFields}
              prefix={<AimOutlined />}
              valueStyle={{ color: '#3FB950' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card>
            <Statistic
              title={t.dashboard.area}
              value={data.totalAreaHectares}
              precision={1}
              valueStyle={{ color: '#3FB950' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card>
            <Statistic
              title={t.dashboard.operations}
              value={data.totalOperations}
              prefix={<ToolOutlined />}
              suffix={<Typography.Text type="secondary" style={{ fontSize: 12 }}>{` / ${data.completedOperations} ${t.dashboard.completed}`}</Typography.Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card>
            <Statistic
              title={t.dashboard.activeMachinery}
              value={data.activeMachines}
              suffix={`/ ${data.totalMachines}`}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#1F6FEB' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card>
            <Statistic
              title={t.dashboard.costs}
              value={data.totalCosts}
              precision={0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#F85149' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title={t.dashboard.warehouses}
              value={data.totalWarehouses}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title={t.dashboard.hoursWorked}
              value={data.totalHoursWorked}
              precision={1}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title={t.dashboard.fuelConsumed}
              value={data.totalFuelConsumed}
              precision={1}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
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
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}

        {areaData.length > 0 && (
          <Col xs={24} lg={8}>
            <Card title={t.dashboard.areaByCrop}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={areaData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: '#8B949E' }} stroke="#8B949E" />
                  <YAxis stroke="#8B949E" tick={{ fill: '#8B949E' }} />
                  <Tooltip />
                  <Bar dataKey="area" fill="#3FB950" name={t.dashboard.areaHa} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}

        {costTrendData.length > 0 && (
          <Col xs={24} lg={8}>
            <Card title={t.dashboard.costTrend}>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={costTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8B949E' }} stroke="#8B949E" />
                  <YAxis stroke="#8B949E" tick={{ fill: '#8B949E' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cost" stroke="#F85149" name={t.dashboard.costsUAH} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}

        {operationsData.length === 0 && areaData.length === 0 && costTrendData.length === 0 && (
          <Col span={24}>
            <Card>
              <Typography.Text type="secondary">{t.dashboard.noChartData}</Typography.Text>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}
