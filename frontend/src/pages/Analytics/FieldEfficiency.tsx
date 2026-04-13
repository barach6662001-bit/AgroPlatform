import { useEffect, useState } from 'react';
import { message } from 'antd';
import TableSkeleton from '../../components/TableSkeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { chartConfig, chartColors } from '../../components/charts/chartTheme';
import { getFieldEfficiency } from '../../api/analytics';
import type { FieldEfficiencyDto } from '../../types/analytics';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { useTranslation } from '../../i18n';
import s from './FieldEfficiency.module.css';
import DataTable from '../../components/ui/DataTable';

export default function FieldEfficiency() {
  const [data, setData] = useState<FieldEfficiencyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    getFieldEfficiency()
      .then(setData)
      .catch(() => message.error(t.analytics.loadError))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: t.analytics.fieldName, dataIndex: 'fieldName', key: 'fieldName' },
    {
      title: t.analytics.totalOps,
      dataIndex: 'operationsCount',
      key: 'operationsCount',
      sorter: (a: FieldEfficiencyDto, b: FieldEfficiencyDto) => a.operationsCount - b.operationsCount,
    },
    {
      title: t.analytics.areaHa,
      dataIndex: 'areaHectares',
      key: 'areaHectares',
      render: (v: number) => v.toFixed(1),
      sorter: (a: FieldEfficiencyDto, b: FieldEfficiencyDto) => a.areaHectares - b.areaHectares,
    },
    {
      title: t.analytics.totalCost,
      dataIndex: 'totalCosts',
      key: 'totalCosts',
      render: (v: number) => `${v.toFixed(2)} UAH`,
      sorter: (a: FieldEfficiencyDto, b: FieldEfficiencyDto) => a.totalCosts - b.totalCosts,
    },
    {
      title: t.analytics.costPerHa,
      dataIndex: 'costPerHectare',
      key: 'costPerHectare',
      render: (v: number) => `${v.toFixed(2)} UAH`,
      sorter: (a: FieldEfficiencyDto, b: FieldEfficiencyDto) => a.costPerHectare - b.costPerHectare,
    },
    {
      title: t.analytics.totalHarvestTons,
      dataIndex: 'totalHarvestTons',
      key: 'totalHarvestTons',
      render: (v?: number) => v != null ? `${v.toFixed(1)} т` : '—',
      sorter: (a: FieldEfficiencyDto, b: FieldEfficiencyDto) => (a.totalHarvestTons ?? 0) - (b.totalHarvestTons ?? 0),
    },
  ];

  const chartData = data.map((item) => ({
    name: item.fieldName,
    [t.analytics.totalCost]: Number(item.totalCosts.toFixed(2)),
  }));

  return (
    <div>
      <PageHeader
        title={t.analytics.fieldEfficiency}
        subtitle={t.analytics.title}
        breadcrumbs={<Breadcrumbs items={[{ label: t.nav.analytics, path: '/analytics/efficiency' }, { label: t.nav.efficiency }]} />}
      />
      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          <DataTable
            dataSource={data}
            columns={columns}
            rowKey="fieldId"
            pagination={false}
            className={s.spaced}
          />
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 40)}>
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 10, right: 40, left: 120, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={chartConfig.grid.stroke} vertical={chartConfig.grid.vertical} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={110} />
                <Tooltip formatter={(v: number) => `${v.toFixed(2)} UAH`} />
                <Legend />
                <Bar dataKey={t.analytics.totalCost} fill="#0D9488" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </>
      )}
    </div>
  );
}
