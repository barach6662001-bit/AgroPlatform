import { useEffect, useState } from 'react';
import { formatUAH, formatNumber } from '../../utils/format';
import { useCurrencySymbol } from '../../hooks/useFormatCurrency';
import { InputNumber, Select, message, Card, Row, Col, Statistic, Tag, Empty, Space } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { chartConfig, chartColors } from '../../components/charts/chartTheme';
import { CalculatorOutlined, RiseOutlined, WarningOutlined } from '@ant-design/icons';
import { getBreakEven } from '../../api/economics';
import type { BreakEvenDto } from '../../types/economics';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { useTranslation } from '../../i18n';
import s from './BreakEvenCalculator.module.css';
import DataTable from '../../components/ui/DataTable';

const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => {
  const y = 2020 + i;
  return { value: y, label: String(y) };
});

export default function BreakEvenCalculator() {
  const [data, setData] = useState<BreakEvenDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [pricePerTonne, setPricePerTonne] = useState<number | null>(null);
  const { t } = useTranslation();
  const currencySymbol = useCurrencySymbol();

  const load = () => {
    if (!pricePerTonne || pricePerTonne <= 0) {
      setData([]);
      return;
    }
    setLoading(true);
    getBreakEven({ year, pricePerTonne })
      .then(setData)
      .catch(() => message.error(t.economics.breakEvenLoadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [year, pricePerTonne]);

  const fieldsWithYield = data.filter((d) => d.breakEvenYield != null);
  const avgThreshold =
    fieldsWithYield.length === 0
      ? null
      : fieldsWithYield.reduce((s, d) => s + (d.breakEvenYield ?? 0), 0) / fieldsWithYield.length;
  const maxThreshold =
    fieldsWithYield.length === 0
      ? null
      : Math.max(...fieldsWithYield.map((d) => d.breakEvenYield ?? 0));

  const chartData = fieldsWithYield.map((d) => ({
    name: d.fieldName,
    [t.economics.breakEvenYield]: d.breakEvenYield ?? 0,
  }));

  const columns = [
    {
      title: t.analytics.fieldName,
      dataIndex: 'fieldName',
      key: 'fieldName',
      sorter: (a: BreakEvenDto, b: BreakEvenDto) => a.fieldName.localeCompare(b.fieldName),
    },
    {
      title: t.analytics.areaHa,
      dataIndex: 'areaHectares',
      key: 'areaHectares',
      sorter: (a: BreakEvenDto, b: BreakEvenDto) => a.areaHectares - b.areaHectares,
      render: (v: number) => v.toFixed(1),
    },
    {
      title: t.fields.crop,
      dataIndex: 'currentCrop',
      key: 'currentCrop',
      render: (v: string) =>
        v ? (
          <Tag color="green">{t.crops[v as keyof typeof t.crops] ?? v}</Tag>
        ) : (
          '—'
        ),
    },
    {
      title: t.economics.total,
      dataIndex: 'totalCosts',
      key: 'totalCosts',
      sorter: (a: BreakEvenDto, b: BreakEvenDto) => a.totalCosts - b.totalCosts,
      render: (v: number) => <span className={s.colored}>{formatUAH(v)}</span>,
    },
    {
      title: t.economics.breakEvenPrice,
      dataIndex: 'pricePerTonne',
      key: 'pricePerTonne',
      render: (v: number) => `${formatUAH(v)}/т`,
    },
    {
      title: t.economics.breakEvenYield,
      dataIndex: 'breakEvenYield',
      key: 'breakEvenYield',
      sorter: (a: BreakEvenDto, b: BreakEvenDto) =>
        (a.breakEvenYield ?? -1) - (b.breakEvenYield ?? -1),
      render: (v: number | undefined) => {
        if (v == null) return <span className={s.colored1}>—</span>;
        const color = v <= 3 ? 'var(--success)' : v <= 6 ? '#d29922' : 'var(--error)';
        return <strong style={{ color }}>{v.toFixed(3)} т/га</strong>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title={t.economics.breakEvenTitle}
        subtitle={t.economics.breakEvenSubtitle}
        breadcrumbs={<Breadcrumbs items={[{ label: t.nav.finance, path: '/expenses' }, { label: t.nav.breakEven }]} />}
      />

      {/* Filters */}
      <Space className={s.spaced} wrap>
        <span className={s.colored1}>{t.economics.year}:</span>
        <Select
          value={year}
          onChange={setYear}
          options={YEAR_OPTIONS}
          className={s.block5}
        />
        <span className={s.colored1}>{t.economics.breakEvenPrice}:</span>
        <InputNumber
          min={1}
          step={100}
          value={pricePerTonne}
          onChange={(v) => setPricePerTonne(v)}
          placeholder={`${currencySymbol}/т`}
          className={s.block7}
        />
      </Space>

      {(!pricePerTonne || pricePerTonne <= 0) && (
        <div className={s.text13}>
          ℹ️ {t.economics.breakEvenEnterPrice}
        </div>
      )}

      {/* KPI cards */}
      {pricePerTonne && pricePerTonne > 0 && (
        <Row gutter={16} className={s.spaced}>
          <Col xs={24} sm={8}>
            <Card className={s.bg}>
              <Statistic
                title={<span className={s.colored1}>{t.economics.breakEvenTotalFields}</span>}
                value={data.length}
                valueStyle={{ color: '#58A6FF' }}
                prefix={<CalculatorOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className={s.bg}>
              <Statistic
                title={<span className={s.colored1}>{t.economics.breakEvenAvgThreshold}</span>}
                value={avgThreshold != null ? avgThreshold.toFixed(3) : '—'}
                suffix={avgThreshold != null ? ' т/га' : ''}
                valueStyle={{ color: '#d29922' }}
                prefix={<RiseOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className={s.bg}>
              <Statistic
                title={<span className={s.colored1}>{t.economics.breakEvenMaxThreshold}</span>}
                value={maxThreshold != null ? maxThreshold.toFixed(3) : '—'}
                suffix={maxThreshold != null ? ' т/га' : ''}
                valueStyle={{ color: 'var(--error)' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <Card
          title={<span className={s.colored2}>{t.economics.breakEvenYield}</span>}
          className={s.spaced1}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={chartConfig.grid.stroke} vertical={chartConfig.grid.vertical} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} unit=" т/га" />
              <Tooltip
                contentStyle={chartConfig.tooltip.contentStyle} itemStyle={chartConfig.tooltip.itemStyle} cursor={chartConfig.tooltip.cursor}
              />
              <Bar dataKey={t.economics.breakEvenYield} fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Table */}
      {pricePerTonne && pricePerTonne > 0 && data.length === 0 && !loading ? (
        <Empty description={<span className={s.colored1}>{t.common.noData}</span>} />
      ) : (
        <DataTable
          dataSource={data}
          columns={columns}
          rowKey="fieldId"
          loading={loading}
          pagination={false}
        />
      )}
    </div>
  );
}
