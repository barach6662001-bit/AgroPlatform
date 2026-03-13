import { useEffect, useState } from 'react';
import { Table, Button, Space, Select, Input, message, Badge, Modal, Form, InputNumber, Tag } from 'antd';
import { EyeOutlined, SearchOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getMachines, createMachine, updateMachine } from '../../api/machinery';
import type { MachineDto, MachineryType, MachineryStatus } from '../../types/machinery';
import type { PaginatedResult } from '../../types/common';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import { useFleetHub } from '../../hooks/useFleetHub';

const statusColors: Record<string, string> = {
  Active: 'success', UnderRepair: 'warning', Decommissioned: 'error',
};

export default function MachineryList() {
  const [result, setResult] = useState<PaginatedResult<MachineDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [editRecord, setEditRecord] = useState<MachineDto | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm] = Form.useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { hasRole } = useRole();
  const { activeVehicleIds } = useFleetHub();

  const canCreate = hasRole(['Administrator', 'Manager']);
  const canEdit = hasRole(['Administrator', 'Manager']);

  const load = (p = page, ps = pageSize) => {
    setLoading(true);
    getMachines({ type: typeFilter, status: statusFilter, search, page: p, pageSize: ps })
      .then(setResult)
      .catch(() => message.error(t.machinery.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [typeFilter, statusFilter, page, pageSize]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await createMachine(values);
      message.success(t.machinery.createSuccess);
      form.resetFields();
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) return;
      if (status) message.error(t.machinery.createError);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editRecord) return;
    try {
      const values = await editForm.validateFields();
      setEditSaving(true);
      await updateMachine(editRecord.id, values);
      message.success(t.machinery.machineUpdated);
      editForm.resetFields();
      setEditModalOpen(false);
      setEditRecord(null);
      load();
    } catch {
      message.error(t.machinery.machineUpdateError);
    } finally {
      setEditSaving(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    setLoading(true);
    getMachines({ type: typeFilter, status: statusFilter, search: value || undefined, page: 1, pageSize })
      .then(setResult)
      .catch(() => message.error(t.machinery.loadError))
      .finally(() => setLoading(false));
  };

  const columns = [
    {
      title: t.machinery.name, dataIndex: 'name', key: 'name',
      sorter: (a: MachineDto, b: MachineDto) => a.name.localeCompare(b.name),
      render: (name: string, record: MachineDto) => (
        <Space>
          {name}
          {activeVehicleIds.has(record.id) && (
            <Tag color="green" style={{ margin: 0, fontSize: 11 }}>
              {t.fleet.liveSignal}
            </Tag>
          )}
        </Space>
      ),
    },
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
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/machinery/${record.id}`)}>
            {t.machinery.details}
          </Button>
          {canEdit && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => { setEditRecord(record); editForm.setFieldsValue(record); setEditModalOpen(true); }}
            />
          )}
        </Space>
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
          onChange={(e) => handleSearchChange(e.target.value)}
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
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
            onClick={() => setModalOpen(true)}
          >
            {t.machinery.createMachine}
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
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
      />

      <Modal
        title={t.machinery.createMachine}
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText={t.common.create}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label={t.machinery.name} rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="inventoryNumber" label={t.machinery.invNumberFull} rules={[{ required: true, message: t.common.required }]}>
            <Input placeholder={t.machinery.enterInventoryNumber} />
          </Form.Item>
          <Form.Item name="type" label={t.machinery.type} rules={[{ required: true, message: t.common.required }]}>
            <Select
              placeholder={t.machinery.selectType}
              options={Object.entries(t.machineryTypes).map(([k, v]) => ({ value: k, label: v }))}
            />
          </Form.Item>
          <Form.Item name="brand" label={t.machinery.brand}>
            <Input />
          </Form.Item>
          <Form.Item name="model" label={t.machinery.model}>
            <Input />
          </Form.Item>
          <Form.Item name="year" label={t.machinery.year}>
            <InputNumber min={1950} max={2100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="fuelType" label={t.machinery.fuelType} rules={[{ required: true, message: t.common.required }]}>
            <Select
              placeholder={t.machinery.selectFuelType}
              options={Object.entries(t.fuelTypes).map(([k, v]) => ({ value: k, label: v }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t.machinery.editMachine}
        open={editModalOpen}
        onOk={handleEdit}
        onCancel={() => { editForm.resetFields(); setEditModalOpen(false); setEditRecord(null); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={editSaving}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label={t.machinery.name} rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="inventoryNumber" label={t.machinery.invNumberFull}>
            <Input placeholder={t.machinery.enterInventoryNumber} />
          </Form.Item>
          <Form.Item name="type" label={t.machinery.type}>
            <Select
              placeholder={t.machinery.selectType}
              options={Object.entries(t.machineryTypes).map(([k, v]) => ({ value: k, label: v }))}
            />
          </Form.Item>
          <Form.Item name="brand" label={t.machinery.brand}>
            <Input />
          </Form.Item>
          <Form.Item name="model" label={t.machinery.model}>
            <Input />
          </Form.Item>
          <Form.Item name="year" label={t.machinery.year}>
            <InputNumber min={1900} max={2030} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label={t.machinery.status}>
            <Select
              options={Object.entries(t.machineryStatuses).map(([k, v]) => ({ value: k, label: v }))}
            />
          </Form.Item>
          <Form.Item name="fuelType" label={t.machinery.fuelType}>
            <Select
              placeholder={t.machinery.selectFuelType}
              options={Object.entries(t.fuelTypes).map(([k, v]) => ({ value: k, label: v }))}
            />
          </Form.Item>
          <Form.Item name="fuelConsumptionPerHour" label={t.machinery.fuelConsumption}>
            <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
