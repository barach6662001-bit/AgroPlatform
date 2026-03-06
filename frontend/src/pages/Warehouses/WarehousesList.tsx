import { useEffect, useState } from 'react';
import { Table, Badge, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getWarehouses } from '../../api/warehouses';
import type { WarehouseDto } from '../../types/warehouse';
import PageHeader from '../../components/PageHeader';

export default function WarehousesList() {
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getWarehouses()
      .then(setWarehouses)
      .catch(() => message.error('Ошибка загрузки складов'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: 'Название', dataIndex: 'name', key: 'name', sorter: (a: WarehouseDto, b: WarehouseDto) => a.name.localeCompare(b.name) },
    { title: 'Местоположение', dataIndex: 'location', key: 'location', render: (v: string) => v || '—' },
    {
      title: 'Статус', dataIndex: 'isActive', key: 'isActive',
      render: (v: boolean) => v ? <Badge status="success" text="Активен" /> : <Badge status="default" text="Неактивен" />,
      filters: [{ text: 'Активен', value: true }, { text: 'Неактивен', value: false }],
      onFilter: (value: unknown, record: WarehouseDto) => record.isActive === value,
    },
    {
      title: 'Действия', key: 'actions',
      render: (_: unknown, record: WarehouseDto) => (
        <a onClick={() => navigate(`/warehouses?warehouse=${record.id}`)}>Остатки</a>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Склады" subtitle="Управление складами и товарными запасами" />
      <Table
        dataSource={warehouses}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15 }}
        onRow={(record) => ({ onClick: () => navigate(`/warehouses?warehouse=${record.id}`) })}
        rowClassName={() => 'clickable-row'}
      />
    </div>
  );
}
