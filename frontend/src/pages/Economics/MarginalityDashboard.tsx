import { useEffect, useState } from 'react';
import { Card, Col, Row, Select, Statistic, Empty, message, Tag } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, DollarOutlined, RiseOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMarginality } from '../../api/economics';
import type { MarginalityRowDto, MarginalitySummaryDto } from '../../types/economics';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { useTranslation } from '../../i18n';
import s from './MarginalityDashboard.module.css';
import DataTable from '../../components/ui/DataTable';

const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => {
  const y = 2020 + i;
  return { value: y, label: String(y) };
});

const fmt = (v: number) => v.toLocaleString('uk-UA', { maximumFractionDigits: 0 });

export default function MarginalityDashboard() {
  const { t } = useTranslation();
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [data, setData] = useState<MarginalitySummaryDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMarginality({ year })
      .then(setData)
      .catch(() => message.error(t.economics.margLoadError))
      .finally(() => setLoading(false));
  }, [year]);

  const marginPositive = (data?.margin ?? 0) >= 0;

  const chartData = (data?.byField ?? []).slice(0, 10).map((r) => ({
    name: r.label,
    [t.economics.totalCostsSum]: r.costs,
    [t.economics.revenue]: r.revenue,
  }));

  const columns = [
    {
      title: t.economics.margProduct,
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: t.economics.revenue,
      dataIndex: 'revenue',
      key: 'revenue',
      render: (v: number) => `${fmt(v)} UAH`,
      sorter: (a: MarginalityRowDto, b: MarginalityRowDto) => a.revenue - b.revenue,
    },
    {
      title: t.economics.totalCostsSum,
      dataIndex: 'costs',
      key: 'costs',
      render: (v: number) => `${fmt(v)} UAH`,
      sorter: (a: MarginalityRowDto, b: MarginalityRowDto) => a.costs - b.costs,
    },
    {
      title: t.economics.netProfit,
      dataIndex: 'margin',
      key: 'margin',
      render: (v: number) => (
        <Tag color={v >= 0 ? 'success' : 'error'}>{fmt(v)} UAH</Tag>
      ),
      sorter: (a: MarginalityRowDto, b: MarginalityRowDto) => a.margin - b.margin,
    },
    {
      title: t.economics.margin,
      dataIndex: 'marginPercent',
      key: 'marginPercent',
      render: (v?: number) => v != null ? `${v.toFixed(1)}%` : '—',
      sorter: (a: MarginalityRowDto, b: MarginalityRowDto) => (a.marginPercent ?? 0) - (b.marginPercent ?? 0),
    },
  ];

  const hasData = data && (data.totalRevenue > 0 || data.totalCosts > 0);

  return (
    <div>
      <PageHeader
        title={t.economics.margTitle}
        subtitle={t.economics.margSubtitle}
        breadcrumbs={<Breadcrumbs items={[{ label: t.nav.finance, path: '/economics' }, { label: t.nav.marginality }]} />}
      />

      <Row gutter={[16, 16]} align="middle" className={s.spaced}>
        <Col>
          <Select
            value={year}
            options={YEAR_OPTIONS}
            onChange={setYear}
            className={s.block1}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className={s.spaced1}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t.economics.actualRevenue}
              value={data?.totalRevenue ?? 0}
              suffix="UAH"
              prefix={<DollarOutlined />}
              valueStyle={{ color: 'var(--success)' }}
              loading={loading}
              formatter={(v) => fmt(Number(v))}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t.economics.totalCostsSum}
              value={data?.totalCosts ?? 0}
              suffix="UAH"
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: 'var(--error)' }}
              loading={loading}
              formatter={(v) => fmt(Number(v))}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t.economics.netProfit}
              value={data?.margin ?? 0}
              suffix="UAH"
              prefix={marginPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              valueStyle={{ color: marginPositive ? 'var(--success)' : 'var(--error)' }}
              loading={loading}
              formatter={(v) => fmt(Number(v))}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t.economics.margin}
              value={data?.marginPercent != null ? data.marginPercent : '—'}
              suffix={data?.marginPercent != null ? '%' : ''}
              prefix={<RiseOutlined />}
              valueStyle={{ color: marginPositive ? 'var(--success)' : 'var(--error)' }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {!loading && !hasData ? (
        <Empty description={t.economics.margEmpty} className={s.spaced2} />
      ) : (
        <>
          {chartData.length > 0 && (
            <Card title={t.economics.costsVsRevenue} className={s.spaced1}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `${fmt(v)} UAH`} />
                  <Legend />
                  <Bar dataKey={t.economics.totalCostsSum} fill="#ff7875" />
                  <Bar dataKey={t.economics.revenue} fill="#73d13d" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {(data?.byProduct ?? []).length > 0 && (
            <Card title={t.economics.margByProduct} className={s.spaced1}>
              <DataTable<MarginalityRowDto>
                dataSource={data?.byProduct}
                columns={columns}
                rowKey="label"
                loading={loading}
                pagination={false}
                size="small"
              />
            </Card>
          )}

          {(data?.byField ?? []).length > 0 && (
            <Card title={t.economics.margByField}>
              <DataTable<MarginalityRowDto>
                dataSource={data?.byField}
                columns={columns}
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
