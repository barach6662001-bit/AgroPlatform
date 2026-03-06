import { useEffect, useState } from 'react';
import { Table, Tag, Space, DatePicker, Select, message } from 'antd';
import { getCostRecords } from '../../api/economics';
import type { CostRecordDto } from '../../types/economics';
import PageHeader from '../../components/PageHeader';

const { RangePicker } = DatePicker;

const categoryColors: Record<string, string> = {
  Seeds: 'green', Fertilizers: 'blue', Pesticides: 'orange',
  Fuel: 'volcano', Labor: 'purple', Equipment: 'cyan',
  Other: 'default',
};

const categoryLabels: Record<string, string> = {
  Seeds: 'Семена', Fertilizers: 'Удобрения', Pesticides: 'Пестициды',
  Fuel: 'Топливо', Labor: 'Труд', Equipment: 'Техника', Other: 'Прочее',
};

export default function CostRecords() {
  const [records, setRecords] = useState<CostRecordDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const load = () => {
    setLoading(true);
    getCostRecords({
      category,
      dateFrom: dateRange?.[0],
      dateTo: dateRange?.[1],
    })
      .then(setRecords)
      .catch(() => message.error('Ошибка загрузки'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [category, dateRange]);

  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);

  const columns = [
    {
      title: 'Дата', dataIndex: 'date', key: 'date',
      sorter: (a: CostRecordDto, b: CostRecordDto) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (v: string) => new Date(v).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Категория', dataIndex: 'category', key: 'category',
      render: (v: string) => <Tag color={categoryColors[v] || 'default'}>{categoryLabels[v] || v}</Tag>,
    },
    {
      title: 'Сумма', dataIndex: 'amount', key: 'amount',
      sorter: (a: CostRecordDto, b: CostRecordDto) => a.amount - b.amount,
      render: (v: number, r: CostRecordDto) => <strong>{v.toFixed(2)} {r.currency}</strong>,
    },
    { title: 'Описание', dataIndex: 'description', key: 'description', render: (v: string) => v || '—' },
  ];

  return (
    <div>
      <PageHeader title="Затраты" subtitle="Учёт затрат по категориям" />
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Категория"
          allowClear
          style={{ width: 200 }}
          value={category}
          onChange={setCategory}
          options={Object.entries(categoryLabels).map(([k, v]) => ({ value: k, label: v }))}
        />
        <RangePicker
          onChange={(_, dateStrings) =>
            setDateRange(dateStrings[0] && dateStrings[1] ? [dateStrings[0], dateStrings[1]] : null)
          }
          placeholder={['Дата от', 'Дата до']}
        />
      </Space>
      <Table
        dataSource={records}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={2}><strong>Итого</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={1}>
              <strong style={{ color: '#f5222d' }}>{totalAmount.toFixed(2)} UAH</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2} />
          </Table.Summary.Row>
        )}
      />
    </div>
  );
}
