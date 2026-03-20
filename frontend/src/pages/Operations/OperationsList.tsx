import { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Select, message, Modal, Form, Input, InputNumber, DatePicker } from 'antd';
import { EyeOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getOperations, createOperation, updateOperation } from '../../api/operations';
import { getFields } from '../../api/fields';
import { getEmployees } from '../../api/hr';
import type { AgroOperationDto, AgroOperationType } from '../../types/operation';
import type { FieldDto } from '../../types/field';
import type { EmployeeDto } from '../../types/hr';
import type { PaginatedResult } from '../../types/common';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import dayjs from 'dayjs';
import { formatDate } from '../../utils/dateFormat';

const typeColors: Record<string, string> = {
  Sowing: 'green', Fertilizing: 'blue', PlantProtection: 'orange',
  SoilTillage: 'brown', Harvesting: 'gold',
};

export default function OperationsList() {
  const [result, setResult] = useState<PaginatedResult<AgroOperationDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState<FieldDto[]>([]);
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [form] = Form.useForm();
  const [editRecord, setEditRecord] = useState<AgroOperationDto | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm] = Form.useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { hasRole } = useRole();

  const canCreate = hasRole(['Administrator', 'Manager', 'Agronomist']);
  const canEdit = hasRole(['Administrator', 'Manager', 'Agronomist']);

  const load = (p = page, ps = pageSize) => {
    setLoading(true);
    getOperations({ operationType: typeFilter, page: p, pageSize: ps })
      .then(setResult)
      .catch(() => message.error(t.operations.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [typeFilter, page, pageSize]);

  useEffect(() => {
    getFields({ page: 1, pageSize: 100 })
      .then((r) => setFields(r.items))
      .catch(() => {/* ignore */});
  }, []);

  useEffect(() => {
    getEmployees(true)
      .then(setEmployees)
      .catch(() => {/* ignore */});
  }, []);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const performedAt = values.performedAt
        ? (values.performedAt as { toISOString: () => string }).toISOString()
        : new Date().toISOString();
      await createOperation({ ...values, performedAt });
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

  const handleEdit = async () => {
    if (!editRecord) return;
    try {
      const values = await editForm.validateFields();
      setEditSaving(true);
      const plannedDate = values.plannedDate
        ? (values.plannedDate as { toISOString: () => string }).toISOString()
        : editRecord.plannedDate;
      await updateOperation(editRecord.id, { ...values, plannedDate });
      message.success(t.operations.operationUpdated);
      editForm.resetFields();
      setEditModalOpen(false);
      setEditRecord(null);
      load();
    } catch {
      message.error(t.operations.operationUpdateError);
    } finally {
      setEditSaving(false);
    }
  };

  const operationTypeOptions = Object.entries(t.operationTypes).map(([k, v]) => ({ value: k, label: v }));
  const fieldOptions = fields.map((f) => ({ value: f.id, label: f.name }));
  const employeeOptions = employees.map((e) => ({ value: e.id, label: `${e.lastName} ${e.firstName}` }));

  const columns = [
    { title: t.operations.field, dataIndex: 'fieldName', key: 'fieldName', sorter: (a: AgroOperationDto, b: AgroOperationDto) => a.fieldName.localeCompare(b.fieldName) },
    {
      title: t.operations.type, dataIndex: 'operationType', key: 'operationType',
      render: (v: AgroOperationType) => <Tag color={typeColors[v] || 'default'}>{t.operationTypes[v as keyof typeof t.operationTypes] || v}</Tag>,
    },
    {
      title: t.operations.performedAt, dataIndex: 'completedDate', key: 'completedDate',
      sorter: (a: AgroOperationDto, b: AgroOperationDto) => new Date(a.completedDate ?? a.plannedDate).getTime() - new Date(b.completedDate ?? b.plannedDate).getTime(),
      render: (v: string) => formatDate(v),
    },
    {
      title: t.operations.area, dataIndex: 'areaProcessed', key: 'areaProcessed',
      render: (v: number) => v ? v.toFixed(2) : '—',
    },
    {
      title: t.operations.performedBy, dataIndex: 'performedByName', key: 'performedByName',
      render: (v?: string) => v || '—',
    },
    {
      title: t.operations.actions, key: 'actions',
      render: (_: unknown, record: AgroOperationDto) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/operations/${record.id}`)}>
            {t.operations.details}
          </Button>
          {canEdit && !record.isCompleted && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditRecord(record);
                editForm.setFieldsValue({
                  operationType: record.operationType,
                  plannedDate: record.plannedDate ? dayjs(record.plannedDate) : undefined,
                  description: record.description,
                  areaProcessed: record.areaProcessed,
                });
                setEditModalOpen(true);
              }}
            />
          )}
        </Space>
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
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            {t.operations.createOperation}
          </Button>
        )}
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
          <Form.Item name="performedAt" label={t.operations.performedAt} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="areaProcessed" label={t.operations.areaProcessed}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="performedByEmployeeId" label={t.operations.performedBy}>
            <Select
              allowClear
              showSearch
              placeholder={t.operations.selectPerformer}
              options={employeeOptions}
              optionFilterProp="label"
              onChange={(val) => {
                const emp = employees.find((e) => e.id === val);
                form.setFieldsValue({ performedByName: emp ? `${emp.lastName} ${emp.firstName}` : undefined });
              }}
            />
          </Form.Item>
          <Form.Item name="performedByName" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="description" label={t.operations.description}>
            <Input.TextArea rows={3} placeholder={t.operations.enterDescription} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t.operations.editOperation}
        open={editModalOpen}
        onOk={handleEdit}
        onCancel={() => { editForm.resetFields(); setEditModalOpen(false); setEditRecord(null); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={editSaving}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="operationType" label={t.operations.type} rules={[{ required: true, message: t.common.required }]}>
            <Select options={operationTypeOptions} placeholder={t.operations.selectType} />
          </Form.Item>
          <Form.Item name="plannedDate" label={t.operations.plannedDate} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label={t.operations.description}>
            <Input.TextArea rows={3} placeholder={t.operations.enterDescription} />
          </Form.Item>
          <Form.Item name="areaProcessed" label={t.operations.areaProcessed}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

