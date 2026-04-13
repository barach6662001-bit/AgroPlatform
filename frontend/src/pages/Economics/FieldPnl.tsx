import { useEffect, useState } from 'react';
import { Table, InputNumber, Select, message, Card, Row, Col, Statistic, Tag, Empty, Space, Button } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarOutlined, RiseOutlined, TrophyOutlined, PrinterOutlined } from '@ant-design/icons';
import { getFieldPnl } from '../../api/economics';
import type { FieldPnlDto } from '../../types/economics';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { useTranslation } from '../../i18n';
import { printReport } from '../../utils/printReport';
import s from './FieldPnl.module.css';
import DataTable from '../../components/ui/DataTable';

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

  const fieldsWithRevenue = data.filter((d) => d.estimatedRevenue != null && d.estimatedRevenue > 0);
  const avgMargin =
    fieldsWithRevenue.length === 0
      ? null
      : fieldsWithRevenue.reduce((s, d) => {
          const m = ((d.netProfit ?? 0) / (d.estimatedRevenue ?? 1)) * 100;
          return s + m;
        }, 0) / fieldsWithRevenue.length;

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
        <span className={s.colored}>{v.toLocaleString()} UAH</span>
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
      key: 'revenue',
      sorter: (a: FieldPnlDto, b: FieldPnlDto) =>
        (a.estimatedRevenue ?? -1) - (b.estimatedRevenue ?? -1),
      render: (_: unknown, r: FieldPnlDto) => {
        const v = r.estimatedRevenue;
        if (v == null || v === 0) return <span className={s.colored1}>—</span>;
        if (r.revenueSource === 'Estimated') {
          return (
            <span>
              <span className={s.text11}>{t.economics.estimatedRevenueLabel}</span>
              <span className={s.colored1}>{v.toLocaleString()} UAH</span>
            </span>
          );
        }
        return (
          <span>
            <span className={s.text111}>{t.economics.actualRevenue}</span>
            <span className={s.colored2}>{v.toLocaleString()} UAH</span>
          </span>
        );
      },
    },
    {
      title: t.economics.netProfit,
      dataIndex: 'netProfit',
      key: 'netProfit',
      sorter: (a: FieldPnlDto, b: FieldPnlDto) =>
        (a.netProfit ?? -Infinity) - (b.netProfit ?? -Infinity),
      render: (v: number | undefined) => {
        if (v == null) return <span className={s.colored1}>—</span>;
        const color = v >= 0 ? 'var(--success)' : 'var(--error)';
        return <strong style={{ color }}>{v.toLocaleString()} UAH</strong>;
      },
    },
    {
      title: t.economics.margin,
      key: 'margin',
      render: (_: unknown, r: FieldPnlDto) => {
        if (r.estimatedRevenue == null || r.estimatedRevenue === 0 || r.revenueSource === 'None')
          return <span className={s.colored1}>—</span>;
        const margin = ((r.netProfit ?? 0) / r.estimatedRevenue) * 100;
        const color = margin >= 0 ? 'var(--success)' : 'var(--error)';
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
      <PageHeader
        title={t.economics.pnlTitle}
        subtitle={t.economics.pnlSubtitle}
        breadcrumbs={<Breadcrumbs items={[{ label: t.nav.finance, path: '/economics' }, { label: t.nav.pnl }]} />}
      />

      {/* Filters */}
      <Space className={s.spaced} wrap>
        <span className={s.colored1}>{t.economics.year}:</span>
        <Select
          value={year}
          onChange={setYear}
          options={YEAR_OPTIONS}
          className={s.block12}
        />
        <span className={s.colored1}>{t.economics.pricePerTonne}:</span>
        <InputNumber
          min={0}
          step={100}
          value={pricePerTonne}
          onChange={(v) => setPricePerTonne(v)}
          placeholder="UAH"
          className={s.block14}
        />
        <Button icon={<PrinterOutlined />} onClick={() => printReport(t.economics.pnlTitle, `<table><thead><tr><th>Поле</th><th>Витрати</th><th>Дохід</th><th>Прибуток</th></tr></thead><tbody>${data.map(d => `<tr><td>${d.fieldName}</td><td>${d.totalCosts.toLocaleString()}</td><td>${(d.estimatedRevenue ?? 0).toLocaleString()}</td><td>${(d.netProfit ?? 0).toLocaleString()}</td></tr>`).join('')}</tbody></table>`)}>Друк</Button>
      </Space>

      {!pricePerTonne && (
        <div className={s.text13}>
          ℹ️ {t.economics.pnlNoRevenue}
        </div>
      )}

      {/* KPI cards */}
      <Row gutter={16} className={s.spaced}>
        <Col xs={24} sm={8}>
          <Card className={s.bg}>
            <Statistic
              title={<span className={s.colored1}>{t.economics.totalCostsSum}</span>}
              value={totalCosts}
              suffix="UAH"
              valueStyle={{ color: 'var(--error)' }}
              prefix={<DollarOutlined />}
              formatter={(v) => Number(v).toLocaleString()}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className={s.bg}>
            <Statistic
              title={<span className={s.colored1}>{t.economics.avgMargin}</span>}
              value={avgMargin != null ? avgMargin.toFixed(1) : '—'}
              suffix={avgMargin != null ? '%' : ''}
              valueStyle={{ color: avgMargin != null && avgMargin >= 0 ? 'var(--success)' : 'var(--error)' }}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className={s.bg}>
            <Statistic
              title={<span className={s.colored1}>{t.economics.bestField}</span>}
              value={bestField?.fieldName ?? '—'}
              valueStyle={{ color: '#58A6FF', fontSize: 18 }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Chart */}
      {data.length > 0 && (
        <Card
          title={<span className={s.colored3}>{t.economics.costsVsRevenue}</span>}
          className={s.spaced1}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
              <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
              <Bar dataKey={t.economics.totalCostsSum} fill="var(--error)" radius={[4, 4, 0, 0]} />
              <Bar dataKey={t.economics.revenue} fill="var(--success)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Table */}
      {data.length === 0 && !loading ? (
        <Empty description={<span className={s.colored1}>{t.economics.pnlNoRevenue}</span>} />
      ) : (
        <DataTable
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
                <strong className={s.colored}>{totalCosts.toLocaleString()} UAH</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} />
              <Table.Summary.Cell index={3}>
                {pricePerTonne && (
                  <strong className={s.colored2}>{totalRevenue.toLocaleString()} UAH</strong>
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
