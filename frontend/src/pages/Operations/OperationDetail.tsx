import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Spin, message, Row, Col, Space } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getOperationById, completeOperation } from '../../api/operations';
import type { AgroOperationDetailDto, AgroOperationResourceDto, AgroOperationMachineryDto } from '../../types/operation';
import PageHeader from '../../components/PageHeader';

const operationTypeLabels: Record<string, string> = {
  Sowing: 'Посев', Fertilizing: 'Удобрение', PlantProtection: 'СЗР',
  SoilTillage: 'Обработка почвы', Harvesting: 'Уборка',
};

export default function OperationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [op, setOp] = useState<AgroOperationDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!id) return;
    getOperationById(id)
      .then(setOp)
      .catch(() => message.error('Операция не найдена'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleComplete = async () => {
    if (!id) return;
    try {
      await completeOperation(id);
      message.success('Операция завершена');
      load();
    } catch {
      message.error('Ошибка завершения операции');
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!op) return null;

  const resourceColumns = [
    { title: 'Товар', dataIndex: 'itemName', key: 'itemName' },
    { title: 'Плановое кол-во', dataIndex: 'plannedQuantity', key: 'plannedQuantity', render: (v: number, r: AgroOperationResourceDto) => `${v} ${r.unit}` },
    { title: 'Фактическое кол-во', dataIndex: 'actualQuantity', key: 'actualQuantity', render: (v: number, r: AgroOperationResourceDto) => v ? `${v} ${r.unit}` : '—' },
  ];

  const machineryColumns = [
    { title: 'Техника', dataIndex: 'machineName', key: 'machineName' },
    { title: 'Плановые часы', dataIndex: 'hoursPlanned', key: 'hoursPlanned', render: (v: number) => v ? `${v} ч` : '—' },
    { title: 'Фактические часы', dataIndex: 'hoursActual', key: 'hoursActual', render: (v: number) => v ? `${v} ч` : '—' },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/operations')}>Назад</Button>
        {!op.isCompleted && (
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleComplete} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
            Завершить операцию
          </Button>
        )}
      </Space>
      <PageHeader
        title={`${operationTypeLabels[op.operationType] || op.operationType} — ${op.fieldName}`}
        subtitle={op.isCompleted ? 'Завершена' : 'В работе'}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Детали операции">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Поле">{op.fieldName}</Descriptions.Item>
              <Descriptions.Item label="Тип">{operationTypeLabels[op.operationType] || op.operationType}</Descriptions.Item>
              <Descriptions.Item label="Статус">
                {op.isCompleted ? <Tag color="success">Завершена</Tag> : <Tag color="processing">В работе</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Плановая дата">{new Date(op.plannedDate).toLocaleDateString('ru-RU')}</Descriptions.Item>
              <Descriptions.Item label="Дата завершения">{op.completedDate ? new Date(op.completedDate).toLocaleDateString('ru-RU') : '—'}</Descriptions.Item>
              <Descriptions.Item label="Площадь (га)">{op.areaProcessed ? op.areaProcessed.toFixed(2) : '—'}</Descriptions.Item>
              <Descriptions.Item label="Описание">{op.description || '—'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Card title="Ресурсы" style={{ marginTop: 16 }}>
        <Table
          dataSource={op.resources}
          columns={resourceColumns}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: 'Ресурсы не добавлены' }}
        />
      </Card>

      <Card title="Задействованная техника" style={{ marginTop: 16 }}>
        <Table
          dataSource={op.machineryUsed}
          columns={machineryColumns}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: 'Техника не привязана' }}
        />
      </Card>
    </div>
  );
}
