import { useEffect, useState } from 'react';
import { Table, Button, Space, Select, Input, message, Badge } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getMachines } from '../../api/machinery';
import type { MachineDto, MachineryType, MachineryStatus } from '../../types/machinery';
import PageHeader from '../../components/PageHeader';

const typeLabels: Record<string, string> = {
  Tractor: 'Трактор', Combine: 'Комбайн', Sprayer: 'Опрыскиватель',
  Seeder: 'Сеялка', Cultivator: 'Культиватор', Truck: 'Грузовик', Other: 'Другое',
};
const statusColors: Record<string, string> = {
  Active: 'success', UnderRepair: 'warning', Decommissioned: 'error',
};
const statusLabels: Record<string, string> = {
  Active: 'Активна', UnderRepair: 'В ремонте', Decommissioned: 'Списана',
};

export default function MachineryList() {
  const [machines, setMachines] = useState<MachineDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    getMachines({ type: typeFilter, status: statusFilter, search })
      .then(setMachines)
      .catch(() => message.error('Ошибка загрузки'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [typeFilter, statusFilter]);

  const filtered = machines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.inventoryNumber.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { title: 'Название', dataIndex: 'name', key: 'name', sorter: (a: MachineDto, b: MachineDto) => a.name.localeCompare(b.name) },
    { title: 'Инв. номер', dataIndex: 'inventoryNumber', key: 'inventoryNumber' },
    { title: 'Тип', dataIndex: 'type', key: 'type', render: (v: MachineryType) => typeLabels[v] || v },
    { title: 'Марка/Модель', key: 'brandModel', render: (_: unknown, r: MachineDto) => [r.brand, r.model].filter(Boolean).join(' ') || '—' },
    { title: 'Год', dataIndex: 'year', key: 'year', render: (v: number) => v || '—' },
    {
      title: 'Статус', dataIndex: 'status', key: 'status',
      render: (v: MachineryStatus) => <Badge status={statusColors[v] as 'success' | 'warning' | 'error'} text={statusLabels[v] || v} />,
    },
    {
      title: 'Действия', key: 'actions',
      render: (_: unknown, record: MachineDto) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/machinery/${record.id}`)}>
          Детали
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Техника" subtitle="Парк сельскохозяйственной техники" />
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Поиск по названию или номеру"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280 }}
        />
        <Select
          placeholder="Тип"
          allowClear
          style={{ width: 160 }}
          value={typeFilter}
          onChange={setTypeFilter}
          options={Object.entries(typeLabels).map(([k, v]) => ({ value: k, label: v }))}
        />
        <Select
          placeholder="Статус"
          allowClear
          style={{ width: 160 }}
          value={statusFilter}
          onChange={setStatusFilter}
          options={Object.entries(statusLabels).map(([k, v]) => ({ value: k, label: v }))}
        />
      </Space>
      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15 }}
      />
    </div>
  );
}
