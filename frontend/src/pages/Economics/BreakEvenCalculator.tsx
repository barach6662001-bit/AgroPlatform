import { useEffect, useState } from 'react';
import { Table, InputNumber, Select, message, Tag, Empty, Space } from 'antd';
import { getBreakEven } from '../../api/economics';
import type { BreakEvenFieldDto } from '../../types/economics';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => {
  const y = 2020 + i;
  return { value: y, label: String(y) };
});

export default function BreakEvenCalculator() {
  const [data, setData] = useState<BreakEvenFieldDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [pricePerTonne, setPricePerTonne] = useState<number | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const { t } = useTranslation();

  useEffect(() => {
    if (!pricePerTonne || pricePerTonne <= 0) {
      setData([]);
      return;
    }
    setLoading(true);
    getBreakEven({ pricePerTonne, year })
      .then(setData)
      .catch(() => message.error(t.economics.breakEvenLoadError))
      .finally(() => setLoading(false));
  }, [pricePerTonne, year]);

  const columns = [
    {
      title: t.analytics.fieldName,
      dataIndex: 'fieldName',
      key: 'fieldName',
      sorter: (a: BreakEvenFieldDto, b: BreakEvenFieldDto) =>
        a.fieldName.localeCompare(b.fieldName),
    },
    {
      title: t.analytics.areaHa,
      dataIndex: 'areaHectares',
      key: 'areaHectares',
      sorter: (a: BreakEvenFieldDto, b: BreakEvenFieldDto) =>
        a.areaHectares - b.areaHectares,
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
      title: t.economics.totalCostsSum,
      dataIndex: 'totalCosts',
      key: 'totalCosts',
      sorter: (a: BreakEvenFieldDto, b: BreakEvenFieldDto) =>
        a.totalCosts - b.totalCosts,
      render: (v: number) => (
        <span style={{ color: '#f85149' }}>{v.toLocaleString()} UAH</span>
      ),
    },
    {
      title: t.economics.breakEvenMinYield,
      dataIndex: 'minYieldPerHectare',
      key: 'minYieldPerHectare',
      sorter: (a: BreakEvenFieldDto, b: BreakEvenFieldDto) =>
        (a.minYieldPerHectare ?? 0) - (b.minYieldPerHectare ?? 0),
      render: (v: number | undefined) => {
        if (v == null)
          return (
            <span style={{ color: '#8B949E' }}>
              {t.economics.breakEvenNoCosts}
            </span>
          );
        return <strong style={{ color: '#58A6FF' }}>{v.toFixed(3)} т/га</strong>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title={t.economics.breakEvenTitle}
        subtitle={t.economics.breakEvenSubtitle}
      />

      <Space style={{ marginBottom: 24 }} wrap>
        <span style={{ color: '#8B949E' }}>{t.economics.year}:</span>
        <Select
          value={year}
          onChange={setYear}
          options={YEAR_OPTIONS}
          style={{ width: 100 }}
        />
        <span style={{ color: '#8B949E' }}>{t.economics.breakEvenPriceLabel}:</span>
        <InputNumber
          min={1}
          step={100}
          value={pricePerTonne}
          onChange={(v) => setPricePerTonne(v)}
          placeholder={t.economics.breakEvenPricePlaceholder}
          style={{ width: 160 }}
        />
      </Space>

      {!pricePerTonne && (
        <Empty
          description={
            <span style={{ color: '#8B949E' }}>
              {t.economics.breakEvenNoPrice}
            </span>
          }
        />
      )}

      {pricePerTonne && (
        <Table
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
