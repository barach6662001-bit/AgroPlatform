import { useEffect, useState } from 'react';
import { Table, Button, Space, Select, Input, message, Badge } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getMachines } from '../../api/machinery';
import type { MachineDto, MachineryType, MachineryStatus } from '../../types/machinery';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const statusColors: Record<string, string> = {
  Active: 'success', UnderRepair: 'warning', Decommissioned: 'error',
};

export default function MachineryList() {
  const [machines, setMachines] = useState<MachineDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const load = () => {
    setLoading(true);
    getMachines({ type: typeFilter, status: statusFilter, search })
      .then(setMachines)
      .catch(() => message.error(t.machinery.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [typeFilter, statusFilter]);

  const filtered = machines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.inventoryNumber.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { title: t.machinery.name, dataIndex: 'name', key: 'name', sorter: (a: MachineDto, b: MachineDto) => a.name.localeCompare(b.name) },
    { title: t.machinery.invNumber, dataIndex: 'inventoryNumber', key: 'inventoryNumber' },
    { title: t.machinery.type, dataIndex: 'type', key: 'type', render: (v: MachineryType) => t.machineryTypes[v as keyof typeof t.machineryTypes] || v },
    { title: t.machinery.brandModel, key: 'brandModel', render: (_: unknown, r: MachineDto) => [r.brand, r.model].filter(Boolean).join(' ') || '—' },
    { title: t.machinery.year, dataIndex: 'year', key: 'year', render: (v: number) => v || '—' },
    {
      title: t.machinery.status, dataIndex: 'status', key: 'status',
      render: (v: MachineryStatus) => <Badge status={statusColors[v] as 'success' | 'warning' | 'error'} text={t.machineryStatuses[v as keyof typeof t.machineryStatuses] || v} />,
    },
    {
      title: t.machinery.actions, key: 'actions',
      render: (_: unknown, record: MachineDto) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/machinery/${record.id}`)}>
          {t.machinery.details}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t.machinery.title} subtitle={t.machinery.subtitle} />
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder={t.machinery.searchPlaceholder}
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280 }}
        />
        <Select
          placeholder={t.machinery.typeFilter}
          allowClear
          style={{ width: 160 }}
          value={typeFilter}
          onChange={setTypeFilter}
          options={Object.entries(t.machineryTypes).map(([k, v]) => ({ value: k, label: v }))}
        />
        <Select
          placeholder={t.machinery.statusFilter}
          allowClear
          style={{ width: 160 }}
          value={statusFilter}
          onChange={setStatusFilter}
          options={Object.entries(t.machineryStatuses).map(([k, v]) => ({ value: k, label: v }))}
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
