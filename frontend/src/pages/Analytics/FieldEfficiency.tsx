import { useEffect, useState } from 'react';
import { Table, Spin, message } from 'antd';
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
import { getFieldEfficiency } from '../../api/analytics';
import type { FieldEfficiencyDto } from '../../types/analytics';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

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
      dataIndex: 'totalOperations',
      key: 'totalOperations',
      sorter: (a: FieldEfficiencyDto, b: FieldEfficiencyDto) => a.totalOperations - b.totalOperations,
    },
    {
      title: t.analytics.completedOps,
      dataIndex: 'completedOperations',
      key: 'completedOperations',
      sorter: (a: FieldEfficiencyDto, b: FieldEfficiencyDto) => a.completedOperations - b.completedOperations,
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
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (v: number) => `${v.toFixed(2)} UAH`,
      sorter: (a: FieldEfficiencyDto, b: FieldEfficiencyDto) => a.totalCost - b.totalCost,
    },
    {
      title: t.analytics.costPerHa,
      dataIndex: 'costPerHectare',
      key: 'costPerHectare',
      render: (v: number) => `${v.toFixed(2)} UAH`,
      sorter: (a: FieldEfficiencyDto, b: FieldEfficiencyDto) => a.costPerHectare - b.costPerHectare,
    },
  ];

  const chartData = data.map((item) => ({
    name: item.fieldName,
    [t.analytics.totalCost]: Number(item.totalCost.toFixed(2)),
  }));

  return (
    <div>
      <PageHeader title={t.analytics.fieldEfficiency} subtitle={t.analytics.title} />
      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />
      ) : (
        <>
          <Table
            dataSource={data}
            columns={columns}
            rowKey="fieldId"
            pagination={false}
            style={{ marginBottom: 32 }}
          />
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 40)}>
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 10, right: 40, left: 120, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
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
