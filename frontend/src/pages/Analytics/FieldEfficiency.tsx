import { useEffect, useState } from 'react';
import { Card, Col, Row, Spin, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
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
      .catch(() => message.error(t.fieldEfficiency.loadError))
      .finally(() => setLoading(false));
  }, []);

  const columns: ColumnsType<FieldEfficiencyDto> = [
    {
      title: t.fieldEfficiency.field,
      dataIndex: 'fieldName',
      key: 'fieldName',
      sorter: (a, b) => a.fieldName.localeCompare(b.fieldName),
    },
    {
      title: t.fieldEfficiency.area,
      dataIndex: 'areaHectares',
      key: 'areaHectares',
      align: 'right',
      render: (v: number) => v.toFixed(1),
      sorter: (a, b) => a.areaHectares - b.areaHectares,
    },
    {
      title: t.fieldEfficiency.crop,
      dataIndex: 'currentCrop',
      key: 'currentCrop',
      render: (v: string | null) =>
        v ? (t.crops?.[v as keyof typeof t.crops] ?? v) : t.fieldEfficiency.notSeeded,
    },
    {
      title: t.fieldEfficiency.operations,
      dataIndex: 'operationsCount',
      key: 'operationsCount',
      align: 'right',
      sorter: (a, b) => a.operationsCount - b.operationsCount,
    },
    {
      title: t.fieldEfficiency.totalCosts,
      dataIndex: 'totalCosts',
      key: 'totalCosts',
      align: 'right',
      render: (v: number) => v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
      sorter: (a, b) => a.totalCosts - b.totalCosts,
    },
    {
      title: t.fieldEfficiency.costPerHa,
      dataIndex: 'costPerHectare',
      key: 'costPerHectare',
      align: 'right',
      render: (v: number) => v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      sorter: (a, b) => a.costPerHectare - b.costPerHectare,
      defaultSortOrder: 'descend',
    },
    {
      title: t.fieldEfficiency.yieldPerHa,
      dataIndex: 'yieldPerHectare',
      key: 'yieldPerHectare',
      align: 'right',
      render: (v: number | null) => (v != null ? v.toFixed(2) : '—'),
      sorter: (a, b) => (a.yieldPerHectare ?? 0) - (b.yieldPerHectare ?? 0),
    },
  ];

  const chartData = data.map((item) => ({
    name: item.fieldName,
    costPerHa: Number(item.costPerHectare.toFixed(2)),
  }));

  return (
    <div>
      <PageHeader title={t.fieldEfficiency.title} subtitle={t.fieldEfficiency.subtitle} />

      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />
      ) : (
        <Row gutter={[16, 16]}>
          {chartData.length > 0 && (
            <Col span={24}>
              <Card title={t.fieldEfficiency.chartTitle}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend verticalAlign="top" />
                    <Bar
                      dataKey="costPerHa"
                      fill="#1890ff"
                      name={t.fieldEfficiency.costPerHa}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}

          <Col span={24}>
            <Card>
              <Table
                rowKey="fieldId"
                dataSource={data}
                columns={columns}
                pagination={{ pageSize: 20 }}
                locale={{ emptyText: t.fieldEfficiency.noData }}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
