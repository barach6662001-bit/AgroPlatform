import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Spin, message, Row, Col, Space } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getOperationById, completeOperation } from '../../api/operations';
import type { AgroOperationDetailDto, AgroOperationResourceDto } from '../../types/operation';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

export default function OperationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [op, setOp] = useState<AgroOperationDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, lang } = useTranslation();

  const load = () => {
    if (!id) return;
    getOperationById(id)
      .then(setOp)
      .catch(() => message.error(t.operations.operationNotFound))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleComplete = async () => {
    if (!id) return;
    try {
      await completeOperation(id);
      message.success(t.operations.operationCompleted);
      load();
    } catch {
      message.error(t.operations.completeError);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!op) return null;

  const resourceColumns = [
    { title: t.warehouses.item, dataIndex: 'itemName', key: 'itemName' },
    { title: t.operations.plannedQty, dataIndex: 'plannedQuantity', key: 'plannedQuantity', render: (v: number, r: AgroOperationResourceDto) => `${v} ${r.unit}` },
    { title: t.operations.actualQty, dataIndex: 'actualQuantity', key: 'actualQuantity', render: (v: number, r: AgroOperationResourceDto) => v ? `${v} ${r.unit}` : '—' },
  ];

  const machineryColumns = [
    { title: t.operations.machineName, dataIndex: 'machineName', key: 'machineName' },
    { title: t.operations.hoursPlanned, dataIndex: 'hoursPlanned', key: 'hoursPlanned', render: (v: number) => v ? `${v} ${lang === 'uk' ? 'год' : 'h'}` : '—' },
    { title: t.operations.hoursActual, dataIndex: 'hoursActual', key: 'hoursActual', render: (v: number) => v ? `${v} ${lang === 'uk' ? 'год' : 'h'}` : '—' },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/operations')}>{t.operations.back}</Button>
        {!op.isCompleted && (
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleComplete} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
            {t.operations.completeOperation}
          </Button>
        )}
      </Space>
      <PageHeader
        title={`${t.operationTypes[op.operationType as keyof typeof t.operationTypes] || op.operationType} — ${op.fieldName}`}
        subtitle={op.isCompleted ? t.operations.completed : t.operations.inProgress}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t.operations.operationDetails}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label={t.operations.field}>{op.fieldName}</Descriptions.Item>
              <Descriptions.Item label={t.operations.type}>{t.operationTypes[op.operationType as keyof typeof t.operationTypes] || op.operationType}</Descriptions.Item>
              <Descriptions.Item label={t.operations.status}>
                {op.isCompleted ? <Tag color="success">{t.operations.completed}</Tag> : <Tag color="processing">{t.operations.inProgress}</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label={t.operations.plannedDate}>{new Date(op.plannedDate).toLocaleDateString()}</Descriptions.Item>
              <Descriptions.Item label={t.operations.completedDate}>{op.completedDate ? new Date(op.completedDate).toLocaleDateString() : '—'}</Descriptions.Item>
              <Descriptions.Item label={t.operations.area}>{op.areaProcessed ? op.areaProcessed.toFixed(2) : '—'}</Descriptions.Item>
              <Descriptions.Item label={t.operations.description}>{op.description || '—'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Card title={t.operations.resources} style={{ marginTop: 16 }}>
        <Table
          dataSource={op.resources}
          columns={resourceColumns}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: t.operations.resourcesEmpty }}
        />
      </Card>

      <Card title={t.operations.machinery} style={{ marginTop: 16 }}>
        <Table
          dataSource={op.machineryUsed}
          columns={machineryColumns}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: t.operations.machineryEmpty }}
        />
      </Card>
    </div>
  );
}
