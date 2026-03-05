import { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Select, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getOperations } from '../../api/operations';
import type { AgroOperationDto, AgroOperationType } from '../../types/operation';
import PageHeader from '../../components/PageHeader';

const operationTypeLabels: Record<string, string> = {
  Sowing: 'Посев', Fertilizing: 'Удобрение', PlantProtection: 'СЗР',
  SoilTillage: 'Обработка почвы', Harvesting: 'Уборка',
};

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

  const load = () => {
    setLoading(true);
    getOperations({
      operationType: typeFilter,
      isCompleted: statusFilter,
    })
      .then(setOps)
      .catch(() => message.error('Ошибка загрузки'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [typeFilter, statusFilter]);

  const columns = [
    { title: 'Поле', dataIndex: 'fieldName', key: 'fieldName', sorter: (a: AgroOperationDto, b: AgroOperationDto) => a.fieldName.localeCompare(b.fieldName) },
    {
      title: 'Тип', dataIndex: 'operationType', key: 'operationType',
      render: (v: AgroOperationType) => <Tag color={typeColors[v] || 'default'}>{operationTypeLabels[v] || v}</Tag>,
    },
    {
      title: 'Плановая дата', dataIndex: 'plannedDate', key: 'plannedDate',
      sorter: (a: AgroOperationDto, b: AgroOperationDto) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime(),
      render: (v: string) => new Date(v).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Дата завершения', dataIndex: 'completedDate', key: 'completedDate',
      render: (v: string) => v ? new Date(v).toLocaleDateString('ru-RU') : '—',
    },
    {
      title: 'Статус', dataIndex: 'isCompleted', key: 'isCompleted',
      render: (v: boolean) => v ? <Tag color="success">Завершена</Tag> : <Tag color="processing">В работе</Tag>,
    },
    {
      title: 'Площадь (га)', dataIndex: 'areaProcessed', key: 'areaProcessed',
      render: (v: number) => v ? v.toFixed(2) : '—',
    },
    {
      title: 'Действия', key: 'actions',
      render: (_: unknown, record: AgroOperationDto) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/operations/${record.id}`)}>
          Детали
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Агрооперации" subtitle="Список агрономических операций" />
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Тип операции"
          allowClear
          style={{ width: 200 }}
          value={typeFilter}
          onChange={setTypeFilter}
          options={Object.entries(operationTypeLabels).map(([k, v]) => ({ value: k, label: v }))}
        />
        <Select
          placeholder="Статус"
          allowClear
          style={{ width: 160 }}
          value={statusFilter}
          onChange={setStatusFilter}
          options={[{ value: true, label: 'Завершена' }, { value: false, label: 'В работе' }]}
        />
      </Space>
      <Table
        dataSource={ops}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15, showTotal: (total) => `Всего: ${total}` }}
      />
    </div>
  );
}
