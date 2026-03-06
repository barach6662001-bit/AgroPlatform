import { useEffect, useState } from 'react';
import { Table, Select, Space, message, Tag } from 'antd';
import { getBalances, getWarehouses } from '../../api/warehouses';
import type { BalanceDto, WarehouseDto } from '../../types/warehouse';
import PageHeader from '../../components/PageHeader';

export default function WarehouseItems() {
  const [balances, setBalances] = useState<BalanceDto[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getWarehouses(), getBalances()])
      .then(([wh, bal]) => {
        setWarehouses(wh);
        setBalances(bal);
      })
      .catch(() => message.error('Ошибка загрузки данных'))
      .finally(() => setLoading(false));
  }, []);

  const handleWarehouseChange = (val: string | undefined) => {
    setSelectedWarehouse(val);
    setLoading(true);
    getBalances(val ? { warehouseId: val } : {})
      .then(setBalances)
      .catch(() => message.error('Ошибка'))
      .finally(() => setLoading(false));
  };

  const columns = [
    { title: 'Склад', dataIndex: 'warehouseName', key: 'warehouseName', sorter: (a: BalanceDto, b: BalanceDto) => a.warehouseName.localeCompare(b.warehouseName) },
    { title: 'Товар', dataIndex: 'itemName', key: 'itemName', sorter: (a: BalanceDto, b: BalanceDto) => a.itemName.localeCompare(b.itemName) },
    { title: 'Код', dataIndex: 'itemCode', key: 'itemCode' },
    { title: 'Партия', dataIndex: 'batchCode', key: 'batchCode', render: (v: string) => v ? <Tag>{v}</Tag> : '—' },
    {
      title: 'Остаток', key: 'balance',
      render: (_: unknown, r: BalanceDto) => (
        <span>
          <strong style={{ color: r.balanceBase > 0 ? '#52c41a' : '#f5222d' }}>
            {r.balanceBase.toFixed(2)}
          </strong>
          {' '}{r.baseUnit}
        </span>
      ),
    },
    {
      title: 'Обновлено', dataIndex: 'lastUpdatedUtc', key: 'lastUpdatedUtc',
      render: (v: string) => new Date(v).toLocaleDateString('ru-RU'),
    },
  ];

  return (
    <div>
      <PageHeader title="Остатки на складах" subtitle="Текущие товарные запасы" />
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Все склады"
          allowClear
          style={{ width: 240 }}
          options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
          onChange={handleWarehouseChange}
          value={selectedWarehouse}
        />
      </Space>
      <Table
        dataSource={balances}
        columns={columns}
        rowKey={(r) => `${r.warehouseId}-${r.itemId}-${r.batchId}`}
        loading={loading}
        pagination={{ pageSize: 20, showTotal: (total) => `Всего позиций: ${total}` }}
      />
    </div>
  );
}
