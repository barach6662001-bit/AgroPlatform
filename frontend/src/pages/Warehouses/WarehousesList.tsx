import { useEffect, useState } from 'react';
import { Table, Badge, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getWarehouses } from '../../api/warehouses';
import type { WarehouseDto } from '../../types/warehouse';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

export default function WarehousesList() {
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    getWarehouses()
      .then(setWarehouses)
      .catch(() => message.error(t.warehouses.loadError))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: t.warehouses.name, dataIndex: 'name', key: 'name', sorter: (a: WarehouseDto, b: WarehouseDto) => a.name.localeCompare(b.name) },
    { title: t.warehouses.location, dataIndex: 'location', key: 'location', render: (v: string) => v || '—' },
    {
      title: t.warehouses.status, dataIndex: 'isActive', key: 'isActive',
      render: (v: boolean) => v ? <Badge status="success" text={t.warehouses.active} /> : <Badge status="default" text={t.warehouses.inactive} />,
      filters: [{ text: t.warehouses.active, value: true }, { text: t.warehouses.inactive, value: false }],
      onFilter: (value: unknown, record: WarehouseDto) => record.isActive === value,
    },
    {
      title: t.warehouses.actions, key: 'actions',
      render: (_: unknown, record: WarehouseDto) => (
        <a onClick={() => navigate(`/warehouses?warehouse=${record.id}`)}>{t.warehouses.balances}</a>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t.warehouses.title} subtitle={t.warehouses.subtitle} />
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
