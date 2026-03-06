import { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Select, message, Modal, Form, Input, InputNumber, DatePicker } from 'antd';
import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getOperations, createOperation } from '../../api/operations';
import { getFields } from '../../api/fields';
import type { AgroOperationDto, AgroOperationType } from '../../types/operation';
import type { FieldDto } from '../../types/field';
import type { PaginatedResult } from '../../types/common';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const typeColors: Record<string, string> = {
  Sowing: 'green', Fertilizing: 'blue', PlantProtection: 'orange',
  SoilTillage: 'brown', Harvesting: 'gold',
};

export default function OperationsList() {
  const [result, setResult] = useState<PaginatedResult<AgroOperationDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState<FieldDto[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const load = (p = page, ps = pageSize) => {
    setLoading(true);
    getOperations({ operationType: typeFilter, isCompleted: statusFilter, page: p, pageSize: ps })
      .then(setResult)
      .catch(() => message.error(t.operations.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [typeFilter, statusFilter, page, pageSize]);

  useEffect(() => {
    getFields({ page: 1, pageSize: 100 })
      .then((r) => setFields(r.items))
      .catch(() => {/* ignore */});
  }, []);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const plannedDate = values.plannedDate
        ? (values.plannedDate as { toISOString: () => string }).toISOString()
        : new Date().toISOString();
      await createOperation({ ...values, plannedDate });
      message.success(t.operations.createSuccess);
      form.resetFields();
      setModalOpen(false);
      load();
    } catch {
      message.error(t.operations.createError);
    } finally {
      setSaving(false);
    }
  };

  const operationTypeOptions = Object.entries(t.operationTypes).map(([k, v]) => ({ value: k, label: v }));
  const fieldOptions = fields.map((f) => ({ value: f.id, label: f.name }));

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
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: '#52c41a', borderColor: '#52c41a' }}
          onClick={() => setModalOpen(true)}
        >
          {t.operations.createOperation}
        </Button>
      </Space>
      <Table
        dataSource={result?.items ?? []}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total: result?.totalCount ?? 0,
          showTotal: (total) => t.operations.total.replace('{{count}}', String(total)),
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
      />

      <Modal
        title={t.operations.createOperation}
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText={t.common.create}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="fieldId" label={t.operations.field} rules={[{ required: true, message: t.common.required }]}>
            <Select options={fieldOptions} placeholder={t.operations.selectField} showSearch optionFilterProp="label" />
          </Form.Item>
          <Form.Item name="operationType" label={t.operations.type} rules={[{ required: true, message: t.common.required }]}>
            <Select options={operationTypeOptions} placeholder={t.operations.selectType} />
          </Form.Item>
          <Form.Item name="plannedDate" label={t.operations.plannedDate} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="areaProcessed" label={t.operations.areaProcessed}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label={t.operations.description}>
            <Input.TextArea rows={3} placeholder={t.operations.enterDescription} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
