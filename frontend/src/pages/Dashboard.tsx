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

const COLORS = ['#52c41a', '#1890ff', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'];

const operationTypeLabels: Record<string, string> = {
  Sowing: 'Посев',
  Fertilizing: 'Удобрение',
  PlantProtection: 'СЗР',
  SoilTillage: 'Обработка',
  Harvesting: 'Уборка',
};

const cropLabels: Record<string, string> = {
  Wheat: 'Пшеница',
  Barley: 'Ячмень',
  Corn: 'Кукуруза',
  Sunflower: 'Подсолнечник',
  Soybean: 'Соя',
  Rapeseed: 'Рапс',
  SugarBeet: 'Сахарная свёкла',
  Potato: 'Картофель',
  Fallow: 'Пар',
  Other: 'Другое',
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => message.error('Не удалось загрузить данные'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!data) return null;

  const operationsData = Object.entries(data.operationsByType).map(([type, count]) => ({
    name: operationTypeLabels[type] || type,
    value: count,
  }));

  const areaData = Object.entries(data.areaByCrop).map(([crop, area]) => ({
    name: cropLabels[crop] || crop,
    area: Number(area.toFixed(1)),
  }));

  const costTrendData = data.costTrend.map((item) => ({
    name: `${item.year}-${String(item.month).padStart(2, '0')}`,
    cost: item.totalCost,
  }));

  return (
    <div>
      <PageHeader title="Главная панель" subtitle="Сводка по всему предприятию" />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Полей"
              value={data.totalFields}
              prefix={<AimOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card>
            <Statistic
              title="Площадь (га)"
              value={data.totalAreaHectares}
              precision={1}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card>
            <Statistic
              title="Операции"
              value={data.totalOperations}
              prefix={<ToolOutlined />}
              suffix={<Typography.Text type="secondary" style={{ fontSize: 12 }}>{` / ${data.completedOperations} завершено`}</Typography.Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card>
            <Statistic
              title="Техника (активная)"
              value={data.activeMachines}
              suffix={`/ ${data.totalMachines}`}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card>
            <Statistic
              title="Затраты (UAH)"
              value={data.totalCosts}
              precision={0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Склады"
              value={data.totalWarehouses}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Наработка техники (ч)"
              value={data.totalHoursWorked}
              precision={1}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Топливо (л)"
              value={data.totalFuelConsumed}
              precision={1}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {operationsData.length > 0 && (
          <Col xs={24} lg={8}>
            <Card title="Операции по типам">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={operationsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {operationsData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
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
            <Card title="Площадь по культурам (га)">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={areaData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="area" fill="#52c41a" name="Площадь (га)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}

        {costTrendData.length > 0 && (
          <Col xs={24} lg={8}>
            <Card title="Тренд затрат">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={costTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cost" stroke="#f5222d" name="Затраты (UAH)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}

        {operationsData.length === 0 && areaData.length === 0 && costTrendData.length === 0 && (
          <Col span={24}>
            <Card>
              <Typography.Text type="secondary">Данные для графиков пока недоступны. Добавьте поля, операции и затраты, чтобы увидеть аналитику.</Typography.Text>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}
