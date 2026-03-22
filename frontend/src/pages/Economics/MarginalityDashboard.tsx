import { useEffect, useState } from 'react';
import { Table, Select, message, Card, Row, Col, Statistic, Tag, Empty, Space } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarOutlined, RiseOutlined, FallOutlined, PercentageOutlined } from '@ant-design/icons';
import { getMarginalitySummary } from '../../api/economics';
import type { MarginalityRowDto, MarginalitySummaryDto } from '../../types/economics';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => {
  const y = 2020 + i;
  return { value: y, label: String(y) };
});

const EMPTY_SUMMARY: MarginalitySummaryDto = {
  totalRevenue: 0,
  totalCosts: 0,
  margin: 0,
  marginPercent: undefined,
  byProduct: [],
  byField: [],
};

export default function MarginalityDashboard() {
  const [data, setData] = useState<MarginalitySummaryDto>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    getMarginalitySummary({ year })
      .then(setData)
      .catch((err) => {
        console.error('Marginality load error:', err);
        message.error(t.marginality.loadError);
      })
      .finally(() => setLoading(false));
  }, [year]);

  const hasData = data.totalRevenue > 0 || data.totalCosts > 0;
  const marginColor = data.margin >= 0 ? '#3fb950' : '#f85149';

  const fieldChartData = data.byField.slice(0, 10).map((r) => ({
    name: r.label.length > 14 ? r.label.slice(0, 12) + '…' : r.label,
    [t.marginality.revenue]: r.revenue,
    [t.marginality.costs]: r.costs,
  }));

  const productColumns = [
    {
      title: t.marginality.product,
      dataIndex: 'label',
      key: 'label',
      sorter: (a: MarginalityRowDto, b: MarginalityRowDto) => a.label.localeCompare(b.label),
    },
    {
      title: t.marginality.revenue,
      dataIndex: 'revenue',
      key: 'revenue',
      sorter: (a: MarginalityRowDto, b: MarginalityRowDto) => a.revenue - b.revenue,
      render: (v: number) => <span style={{ color: '#3fb950' }}>{v.toLocaleString()} UAH</span>,
    },
  ];

  const fieldColumns = [
    {
      title: t.marginality.field,
      dataIndex: 'label',
      key: 'label',
      sorter: (a: MarginalityRowDto, b: MarginalityRowDto) => a.label.localeCompare(b.label),
    },
    {
      title: t.marginality.revenue,
      dataIndex: 'revenue',
      key: 'revenue',
      sorter: (a: MarginalityRowDto, b: MarginalityRowDto) => a.revenue - b.revenue,
      render: (v: number) => <span style={{ color: '#3fb950' }}>{v.toLocaleString()} UAH</span>,
    },
    {
      title: t.marginality.costs,
      dataIndex: 'costs',
      key: 'costs',
      sorter: (a: MarginalityRowDto, b: MarginalityRowDto) => a.costs - b.costs,
      render: (v: number) => <span style={{ color: '#f85149' }}>{v.toLocaleString()} UAH</span>,
    },
    {
      title: t.marginality.margin,
      dataIndex: 'margin',
      key: 'margin',
      sorter: (a: MarginalityRowDto, b: MarginalityRowDto) => a.margin - b.margin,
      render: (v: number) => {
        const color = v >= 0 ? '#3fb950' : '#f85149';
        return <strong style={{ color }}>{v.toLocaleString()} UAH</strong>;
      },
    },
    {
      title: t.marginality.marginPercent,
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

  return (
    <div>
      <PageHeader title={t.marginality.title} subtitle={t.marginality.subtitle} />

      {/* Year filter */}
      <Space style={{ marginBottom: 24 }} wrap>
        <span style={{ color: '#8B949E' }}>{t.marginality.year}:</span>
        <Select
          value={year}
          onChange={setYear}
          options={YEAR_OPTIONS}
          style={{ width: 100 }}
          loading={loading}
        />
      </Space>

      {/* KPI summary cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: '#161B22', border: '1px solid #30363D' }}>
            <Statistic
              title={<span style={{ color: '#8B949E' }}>{t.marginality.totalRevenue}</span>}
              value={data.totalRevenue}
              suffix="UAH"
              valueStyle={{ color: '#3fb950' }}
              prefix={<DollarOutlined />}
              formatter={(v) => Number(v).toLocaleString()}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: '#161B22', border: '1px solid #30363D' }}>
            <Statistic
              title={<span style={{ color: '#8B949E' }}>{t.marginality.totalCosts}</span>}
              value={data.totalCosts}
              suffix="UAH"
              valueStyle={{ color: '#f85149' }}
              prefix={<FallOutlined />}
              formatter={(v) => Number(v).toLocaleString()}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: '#161B22', border: '1px solid #30363D' }}>
            <Statistic
              title={<span style={{ color: '#8B949E' }}>{t.marginality.margin}</span>}
              value={data.margin}
              suffix="UAH"
              valueStyle={{ color: marginColor }}
              prefix={<RiseOutlined />}
              formatter={(v) => Number(v).toLocaleString()}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: '#161B22', border: '1px solid #30363D' }}>
            <Statistic
              title={<span style={{ color: '#8B949E' }}>{t.marginality.marginPercent}</span>}
              value={data.marginPercent != null ? data.marginPercent.toFixed(1) : '—'}
              suffix={data.marginPercent != null ? '%' : ''}
              valueStyle={{ color: data.marginPercent != null && data.marginPercent >= 0 ? '#3fb950' : '#f85149' }}
              prefix={<PercentageOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {!hasData && !loading ? (
        <Empty description={<span style={{ color: '#8B949E' }}>{t.marginality.noData}</span>} />
      ) : (
        <>
          {/* Revenue vs Costs by field chart */}
          {fieldChartData.length > 0 && (
            <Card
              title={<span style={{ color: '#E6EDF3' }}>{t.marginality.byField}</span>}
              style={{ background: '#161B22', border: '1px solid #30363D', marginBottom: 24 }}
            >
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={fieldChartData} margin={{ top: 5, right: 20, left: 20, bottom: 60 }}>
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
                    formatter={(v: number) => `${v.toLocaleString()} UAH`}
                  />
                  <Legend wrapperStyle={{ color: '#8B949E' }} />
                  <Bar dataKey={t.marginality.revenue} fill="#3fb950" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={t.marginality.costs} fill="#f85149" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* By field table */}
          <Card
            title={<span style={{ color: '#E6EDF3' }}>{t.marginality.byField}</span>}
            style={{ background: '#161B22', border: '1px solid #30363D', marginBottom: 24 }}
          >
            <Table
              dataSource={data.byField}
              columns={fieldColumns}
              rowKey="label"
              loading={loading}
              pagination={false}
              size="small"
            />
          </Card>

          {/* By product table */}
          {data.byProduct.length > 0 && (
            <Card
              title={<span style={{ color: '#E6EDF3' }}>{t.marginality.byProduct}</span>}
              style={{ background: '#161B22', border: '1px solid #30363D' }}
            >
              <Table
                dataSource={data.byProduct}
                columns={productColumns}
                rowKey="label"
                loading={loading}
                pagination={false}
                size="small"
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
