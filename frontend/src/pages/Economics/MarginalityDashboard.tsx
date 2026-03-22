import { useEffect, useState } from 'react';
import { Table, Select, message, Card, Row, Col, Statistic, Tag, Empty, Space } from 'antd';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { DollarOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons';
import { getMarginality } from '../../api/economics';
import type { MarginalityRowDto } from '../../types/economics';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => {
  const y = 2020 + i;
  return { value: y, label: String(y) };
});

const GROUP_BY_OPTIONS = (t: ReturnType<typeof useTranslation>['t']) => [
  { value: 'field',   label: t.economics.groupByField },
  { value: 'product', label: t.economics.groupByProduct },
];

export default function MarginalityDashboard() {
  const [data, setData] = useState<MarginalityRowDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [groupBy, setGroupBy] = useState<string>('field');
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    getMarginality({ year, groupBy })
      .then(setData)
      .catch(() => message.error(t.economics.marginalityLoadError))
      .finally(() => setLoading(false));
  }, [year, groupBy]);

  const totalRevenue = data.reduce((s, r) => s + r.revenue, 0);
  const totalCosts   = data.reduce((s, r) => s + r.costs, 0);
  const totalMargin  = data.reduce((s, r) => s + r.margin, 0);

  const rowsWithRevenue = data.filter((r) => r.revenue > 0);
  const avgMarginPct =
    rowsWithRevenue.length === 0
      ? null
      : rowsWithRevenue.reduce((s, r) => s + (r.marginPercent ?? 0), 0) / rowsWithRevenue.length;

  const chartData = data.map((r) => ({
    name: r.label,
    [t.economics.totalCostsSum]: r.costs,
    [t.economics.totalRevenue]:  r.revenue,
  }));

  const columns = [
    {
      title: t.economics.groupBy,
      dataIndex: 'label',
      key: 'label',
      sorter: (a: MarginalityRowDto, b: MarginalityRowDto) => a.label.localeCompare(b.label),
    },
    {
      title: t.economics.totalRevenue,
      dataIndex: 'revenue',
      key: 'revenue',
      sorter: (a: MarginalityRowDto, b: MarginalityRowDto) => a.revenue - b.revenue,
      render: (v: number) => (
        <span style={{ color: '#3fb950' }}>{v.toLocaleString()} UAH</span>
      ),
    },
    {
      title: t.economics.totalCostsSum,
      dataIndex: 'costs',
      key: 'costs',
      sorter: (a: MarginalityRowDto, b: MarginalityRowDto) => a.costs - b.costs,
      render: (v: number) => (
        <span style={{ color: '#f85149' }}>{v.toLocaleString()} UAH</span>
      ),
    },
    {
      title: t.economics.margin,
      dataIndex: 'margin',
      key: 'margin',
      sorter: (a: MarginalityRowDto, b: MarginalityRowDto) => a.margin - b.margin,
      render: (v: number) => {
        const color = v >= 0 ? '#3fb950' : '#f85149';
        return <strong style={{ color }}>{v.toLocaleString()} UAH</strong>;
      },
    },
    {
      title: t.economics.marginPercent,
      dataIndex: 'marginPercent',
      key: 'marginPercent',
      sorter: (a: MarginalityRowDto, b: MarginalityRowDto) =>
        (a.marginPercent ?? -Infinity) - (b.marginPercent ?? -Infinity),
      render: (v: number | undefined) => {
        if (v == null) return <span style={{ color: '#8B949E' }}>—</span>;
        return (
          <Tag color={v >= 0 ? 'success' : 'error'}>
            {v.toFixed(1)}%
          </Tag>
        );
      },
    },
  ];

  const marginColor = totalMargin >= 0 ? '#3fb950' : '#f85149';

  return (
    <div>
      <PageHeader
        title={t.economics.marginalityTitle}
        subtitle={t.economics.marginalitySubtitle}
      />

      {/* Filters */}
      <Space style={{ marginBottom: 24 }} wrap>
        <span style={{ color: '#8B949E' }}>{t.economics.year}:</span>
        <Select
          value={year}
          onChange={setYear}
          options={YEAR_OPTIONS}
          style={{ width: 100 }}
        />
        <span style={{ color: '#8B949E' }}>{t.economics.groupBy}:</span>
        <Select
          value={groupBy}
          onChange={setGroupBy}
          options={GROUP_BY_OPTIONS(t)}
          style={{ width: 140 }}
        />
      </Space>

      {/* KPI cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card style={{ background: '#161B22', border: '1px solid #30363D' }}>
            <Statistic
              title={<span style={{ color: '#8B949E' }}>{t.economics.totalRevenue}</span>}
              value={totalRevenue}
              suffix="UAH"
              valueStyle={{ color: '#3fb950' }}
              prefix={<DollarOutlined />}
              formatter={(v) => Number(v).toLocaleString()}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ background: '#161B22', border: '1px solid #30363D' }}>
            <Statistic
              title={<span style={{ color: '#8B949E' }}>{t.economics.totalMargin}</span>}
              value={totalMargin}
              suffix="UAH"
              valueStyle={{ color: marginColor }}
              prefix={totalMargin >= 0 ? <RiseOutlined /> : <FallOutlined />}
              formatter={(v) => Number(v).toLocaleString()}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ background: '#161B22', border: '1px solid #30363D' }}>
            <Statistic
              title={<span style={{ color: '#8B949E' }}>{t.economics.avgMarginPct}</span>}
              value={avgMarginPct != null ? avgMarginPct.toFixed(1) : '—'}
              suffix={avgMarginPct != null ? '%' : ''}
              valueStyle={{ color: avgMarginPct != null && avgMarginPct >= 0 ? '#3fb950' : '#f85149' }}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Chart */}
      {data.length > 0 && (
        <Card
          title={<span style={{ color: '#E6EDF3' }}>{t.economics.costsVsRevenue}</span>}
          style={{ background: '#161B22', border: '1px solid #30363D', marginBottom: 24 }}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#8B949E', fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fill: '#8B949E', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#161B22', border: '1px solid #30363D', color: '#E6EDF3' }}
              />
              <Legend wrapperStyle={{ color: '#8B949E' }} />
              <Bar dataKey={t.economics.totalCostsSum} fill="#f85149" radius={[4, 4, 0, 0]} />
              <Bar dataKey={t.economics.totalRevenue}  fill="#3fb950" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Table */}
      {data.length === 0 && !loading ? (
        <Empty
          description={<span style={{ color: '#8B949E' }}>{t.economics.noMarginalityData}</span>}
        />
      ) : (
        <Table
          dataSource={data}
          columns={columns}
          rowKey="label"
          loading={loading}
          pagination={false}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>
                <strong>{t.economics.total}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <strong style={{ color: '#3fb950' }}>{totalRevenue.toLocaleString()} UAH</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2}>
                <strong style={{ color: '#f85149' }}>{totalCosts.toLocaleString()} UAH</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3}>
                <strong style={{ color: marginColor }}>{totalMargin.toLocaleString()} UAH</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} />
            </Table.Summary.Row>
          )}
        />
      )}
    </div>
  );
}
