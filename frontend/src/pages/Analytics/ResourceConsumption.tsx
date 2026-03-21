import { useEffect, useState } from 'react';
import { Table, DatePicker, Space, message } from 'antd';
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
import { getResourceConsumption } from '../../api/analytics';
import type { ResourceConsumptionDto } from '../../types/analytics';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const { RangePicker } = DatePicker;

export default function ResourceConsumption() {
  const [data, setData] = useState<ResourceConsumptionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    getResourceConsumption(dateRange ? { from: dateRange[0], to: dateRange[1] } : undefined)
      .then(setData)
      .catch(() => message.error(t.analytics.loadError))
      .finally(() => setLoading(false));
  }, [dateRange]);

  const columns = [
    { title: t.analytics.resourceName, dataIndex: 'itemName', key: 'itemName' },
    {
      title: t.analytics.totalQuantity,
      dataIndex: 'totalConsumed',
      key: 'totalConsumed',
      render: (v: number) => v.toFixed(2),
      sorter: (a: ResourceConsumptionDto, b: ResourceConsumptionDto) => a.totalConsumed - b.totalConsumed,
    },
    { title: t.analytics.unit, dataIndex: 'unitCode', key: 'unitCode' },
  ];

  const chartData = data.map((item) => ({
    name: item.itemName,
    [t.analytics.totalQuantity]: Number(item.totalConsumed.toFixed(2)),
  }));

  return (
    <div>
      <PageHeader title={t.analytics.resourceConsumption} subtitle={t.analytics.title} />
      <Space style={{ marginBottom: 16 }}>
        <RangePicker
          onChange={(_, dateStrings) =>
            setDateRange(dateStrings[0] && dateStrings[1] ? [dateStrings[0], dateStrings[1]] : null)
          }
          placeholder={[t.analytics.from, t.analytics.to]}
        />
      </Space>
      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          <Table
            dataSource={data}
            columns={columns}
            rowKey="itemId"
            pagination={false}
            style={{ marginBottom: 32 }}
          />
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={t.analytics.totalQuantity} fill="#0D9488" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </>
      )}
    </div>
  );
}
