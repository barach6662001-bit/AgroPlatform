import { useEffect, useState } from 'react';
import { Table, InputNumber, Select, message, Card, Row, Col, Statistic, Tag, Empty, Space } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarOutlined, RiseOutlined, TrophyOutlined } from '@ant-design/icons';
import { getFieldPnl } from '../../api/economics';
import type { FieldPnlDto } from '../../types/economics';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => {
  const y = 2020 + i;
  return { value: y, label: String(y) };
});

export default function FieldPnl() {
  const [data, setData] = useState<FieldPnlDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [pricePerTonne, setPricePerTonne] = useState<number | null>(null);
  const { t } = useTranslation();

  const load = () => {
    setLoading(true);
    getFieldPnl({
      year,
      estimatedPricePerTonne: pricePerTonne ?? undefined,
    })
      .then(setData)
      .catch(() => message.error(t.economics.pnlLoadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [year, pricePerTonne]);

  const totalCosts = data.reduce((s, d) => s + d.totalCosts, 0);
  const totalRevenue = data.reduce((s, d) => s + (d.estimatedRevenue ?? 0), 0);

  const bestField = data.reduce<FieldPnlDto | null>((best, d) => {
    if (d.netProfit == null) return best;
    if (!best || d.netProfit > (best.netProfit ?? -Infinity)) return d;
    return best;
  }, null);

  const fieldsWithMargin = data.filter((d) => d.estimatedRevenue != null && d.estimatedRevenue > 0);
  const avgMargin =
    fieldsWithMargin.length === 0
      ? null
      : fieldsWithMargin.reduce((s, d) => {
          const m = ((d.netProfit ?? 0) / (d.estimatedRevenue ?? 1)) * 100;
          return s + m;
        }, 0) / fieldsWithMargin.length;

  const chartData = data.map((d) => ({
    name: d.fieldName,
    [t.economics.totalCostsSum]: d.totalCosts,
    [t.economics.revenue]: d.estimatedRevenue ?? 0,
  }));

  const columns = [
    {
      title: t.analytics.fieldName,
      dataIndex: 'fieldName',
      key: 'fieldName',
      sorter: (a: FieldPnlDto, b: FieldPnlDto) => a.fieldName.localeCompare(b.fieldName),
    },
    {
      title: t.analytics.areaHa,
      dataIndex: 'areaHectares',
      key: 'areaHectares',
      sorter: (a: FieldPnlDto, b: FieldPnlDto) => a.areaHectares - b.areaHectares,
      render: (v: number) => v.toFixed(1),
    },
    {
      title: t.fields.crop,
      dataIndex: 'currentCrop',
      key: 'currentCrop',
      render: (v: string) =>
        v ? (
          <Tag color="green">
            {t.crops[v as keyof typeof t.crops] ?? v}
          </Tag>
        ) : (
          '—'
        ),
    },
    {
      title: t.economics.total,
      dataIndex: 'totalCosts',
      key: 'totalCosts',
      sorter: (a: FieldPnlDto, b: FieldPnlDto) => a.totalCosts - b.totalCosts,
      render: (v: number) => (
        <span style={{ color: '#f85149' }}>{v.toLocaleString()} UAH</span>
      ),
    },
    {
      title: t.analytics.costPerHa,
      dataIndex: 'costPerHectare',
      key: 'costPerHectare',
      sorter: (a: FieldPnlDto, b: FieldPnlDto) => a.costPerHectare - b.costPerHectare,
      render: (v: number) => `${v.toFixed(0)} UAH/га`,
    },
    {
      title: t.economics.revenue,
      dataIndex: 'estimatedRevenue',
      key: 'estimatedRevenue',
      sorter: (a: FieldPnlDto, b: FieldPnlDto) =>
        (a.estimatedRevenue ?? -1) - (b.estimatedRevenue ?? -1),
      render: (v: number | undefined) =>
        v != null ? (
          <span style={{ color: '#3fb950' }}>{v.toLocaleString()} UAH</span>
        ) : (
          <span style={{ color: '#8B949E' }}>—</span>
        ),
    },
    {
      title: t.economics.netProfit,
      dataIndex: 'netProfit',
      key: 'netProfit',
      sorter: (a: FieldPnlDto, b: FieldPnlDto) =>
        (a.netProfit ?? -Infinity) - (b.netProfit ?? -Infinity),
      render: (v: number | undefined) => {
        if (v == null) return <span style={{ color: '#8B949E' }}>—</span>;
        const color = v >= 0 ? '#3fb950' : '#f85149';
        return <strong style={{ color }}>{v.toLocaleString()} UAH</strong>;
      },
    },
    {
      title: t.economics.margin,
      key: 'margin',
      render: (_: unknown, r: FieldPnlDto) => {
        if (r.estimatedRevenue == null || r.estimatedRevenue === 0)
          return <span style={{ color: '#8B949E' }}>—</span>;
        const margin = ((r.netProfit ?? 0) / r.estimatedRevenue) * 100;
        const color = margin >= 0 ? '#3fb950' : '#f85149';
        return (
          <Tag color={margin >= 0 ? 'success' : 'error'} style={{ color }}>
            {margin.toFixed(1)}%
          </Tag>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader title={t.economics.pnlTitle} subtitle={t.economics.pnlSubtitle} />

      {/* Filters */}
      <Space style={{ marginBottom: 24 }} wrap>
        <span style={{ color: '#8B949E' }}>{t.economics.year}:</span>
        <Select
          value={year}
          onChange={setYear}
          options={YEAR_OPTIONS}
          style={{ width: 100 }}
        />
        <span style={{ color: '#8B949E' }}>{t.economics.pricePerTonne}:</span>
        <InputNumber
          min={0}
          step={100}
          value={pricePerTonne}
          onChange={(v) => setPricePerTonne(v)}
          placeholder="UAH"
          style={{ width: 140 }}
        />
      </Space>

      {!pricePerTonne && (
        <div style={{ marginBottom: 16, color: '#8B949E', fontSize: 13 }}>
          ℹ️ {t.economics.pnlNoRevenue}
        </div>
      )}

      {/* KPI cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card style={{ background: '#161B22', border: '1px solid #30363D' }}>
            <Statistic
              title={<span style={{ color: '#8B949E' }}>{t.economics.totalCostsSum}</span>}
              value={totalCosts}
              suffix="UAH"
              valueStyle={{ color: '#f85149' }}
              prefix={<DollarOutlined />}
              formatter={(v) => Number(v).toLocaleString()}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ background: '#161B22', border: '1px solid #30363D' }}>
            <Statistic
              title={<span style={{ color: '#8B949E' }}>{t.economics.avgMargin}</span>}
              value={avgMargin != null ? avgMargin.toFixed(1) : '—'}
              suffix={avgMargin != null ? '%' : ''}
              valueStyle={{ color: avgMargin != null && avgMargin >= 0 ? '#3fb950' : '#f85149' }}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ background: '#161B22', border: '1px solid #30363D' }}>
            <Statistic
              title={<span style={{ color: '#8B949E' }}>{t.economics.bestField}</span>}
              value={bestField?.fieldName ?? '—'}
              valueStyle={{ color: '#58A6FF', fontSize: 18 }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Chart */}
      {data.length > 0 && pricePerTonne && (
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
              <Bar dataKey={t.economics.revenue} fill="#3fb950" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Table */}
      {data.length === 0 && !loading ? (
        <Empty description={<span style={{ color: '#8B949E' }}>{t.economics.pnlNoRevenue}</span>} />
      ) : (
        <Table
          dataSource={data}
          columns={columns}
          rowKey="fieldId"
          loading={loading}
          pagination={false}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={3}>
                <strong>{t.economics.total}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <strong style={{ color: '#f85149' }}>{totalCosts.toLocaleString()} UAH</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} />
              <Table.Summary.Cell index={3}>
                {pricePerTonne && (
                  <strong style={{ color: '#3fb950' }}>{totalRevenue.toLocaleString()} UAH</strong>
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} />
              <Table.Summary.Cell index={5} />
            </Table.Summary.Row>
          )}
        />
      )}
    </div>
  );
}
