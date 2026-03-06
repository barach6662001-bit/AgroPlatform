import { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Select, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getOperations } from '../../api/operations';
import type { AgroOperationDto, AgroOperationType } from '../../types/operation';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const typeColors: Record<string, string> = {
  Sowing: 'green', Fertilizing: 'blue', PlantProtection: 'orange',
  SoilTillage: 'brown', Harvesting: 'gold',
};

export default function OperationsList() {
  const [ops, setOps] = useState<AgroOperationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const load = () => {
    setLoading(true);
    getOperations({
      operationType: typeFilter,
      isCompleted: statusFilter,
    })
      .then(setOps)
      .catch(() => message.error(t.operations.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [typeFilter, statusFilter]);

  const operationTypeOptions = Object.entries(t.operationTypes).map(([k, v]) => ({ value: k, label: v }));

  const columns = [
    { title: t.operations.field, dataIndex: 'fieldName', key: 'fieldName', sorter: (a: AgroOperationDto, b: AgroOperationDto) => a.fieldName.localeCompare(b.fieldName) },
    {
      title: t.operations.type, dataIndex: 'operationType', key: 'operationType',
      render: (v: AgroOperationType) => <Tag color={typeColors[v] || 'default'}>{t.operationTypes[v as keyof typeof t.operationTypes] || v}</Tag>,
    },
    {
      title: t.operations.plannedDate, dataIndex: 'plannedDate', key: 'plannedDate',
      sorter: (a: AgroOperationDto, b: AgroOperationDto) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime(),
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
    {
      title: t.operations.completedDate, dataIndex: 'completedDate', key: 'completedDate',
      render: (v: string) => v ? new Date(v).toLocaleDateString() : '—',
    },
    {
      title: t.operations.status, dataIndex: 'isCompleted', key: 'isCompleted',
      render: (v: boolean) => v ? <Tag color="success">{t.operations.completed}</Tag> : <Tag color="processing">{t.operations.inProgress}</Tag>,
    },
    {
      title: t.operations.area, dataIndex: 'areaProcessed', key: 'areaProcessed',
      render: (v: number) => v ? v.toFixed(2) : '—',
    },
    {
      title: t.operations.actions, key: 'actions',
      render: (_: unknown, record: AgroOperationDto) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/operations/${record.id}`)}>
          {t.operations.details}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t.operations.title} subtitle={t.operations.subtitle} />
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder={t.operations.typeFilter}
          allowClear
          style={{ width: 200 }}
          value={typeFilter}
          onChange={setTypeFilter}
          options={operationTypeOptions}
        />
        <Select
          placeholder={t.operations.statusFilter}
          allowClear
          style={{ width: 160 }}
          value={statusFilter}
          onChange={setStatusFilter}
          options={[{ value: true, label: t.operations.completed }, { value: false, label: t.operations.inProgress }]}
        />
      </Space>
      <Table
        dataSource={ops}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15, showTotal: (total) => t.operations.total.replace('{{count}}', String(total)) }}
      />
    </div>
  );
}
