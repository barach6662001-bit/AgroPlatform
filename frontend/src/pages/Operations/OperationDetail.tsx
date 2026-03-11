import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Spin, message, Row, Col, Space, Modal, Form, DatePicker, InputNumber } from 'antd';
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
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completeForm] = Form.useForm();
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
      const values = await completeForm.validateFields();
      setCompleting(true);
      const completedDate = values.completedDate
        ? (values.completedDate as { toISOString: () => string }).toISOString()
        : new Date().toISOString();
      await completeOperation(id, { completedDate, areaProcessed: values.areaProcessed });
      message.success(t.operations.operationCompleted);
      completeForm.resetFields();
      setCompleteModalOpen(false);
      load();
    } catch {
      message.error(t.operations.completeError);
    } finally {
      setCompleting(false);
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
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => setCompleteModalOpen(true)} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
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

      <Modal
        title={t.operations.completeOperation}
        open={completeModalOpen}
        onOk={handleComplete}
        onCancel={() => { setCompleteModalOpen(false); completeForm.resetFields(); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={completing}
      >
        <Form form={completeForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="completedDate" label={t.operations.completedDate} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="areaProcessed" label={t.operations.area}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
