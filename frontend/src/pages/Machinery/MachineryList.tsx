import { exportToCsv } from '../../utils/exportCsv';
import { useEffect, useState } from 'react';
import { Table, Button, Space, Select, Input, message, Modal, Form, InputNumber, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { EyeOutlined, SearchOutlined, PlusOutlined, EditOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getMachines, createMachine, updateMachine, deleteMachine } from '../../api/machinery';
import type { MachineDto, MachineryType, MachineryStatus } from '../../types/machinery';
import type { PaginatedResult } from '../../types/common';
import type { EmployeeDto } from '../../types/hr';
import PageHeader from '../../components/PageHeader';
import TableSkeleton from '../../components/TableSkeleton';
import DeleteConfirmButton from '../../components/DeleteConfirmButton';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import { useFleetHub } from '../../hooks/useFleetHub';
import { getEmployees } from '../../api/hr';
import EmptyState from '../../components/EmptyState';


const { Text } = Typography;

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
  const { hasPermission } = useRole();
  const { activeVehicleIds } = useFleetHub();

  const canCreate = hasPermission('machinery', 'manage');
  const canEdit = hasPermission('machinery', 'manage');
  const canDelete = hasPermission('machinery', 'manage');

  const [employees, setEmployees] = useState<EmployeeDto[]>([]);

  useEffect(() => {
    getEmployees(true).then(setEmployees).catch(() => {});
  }, []);

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
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) return;
      if (status) message.error(t.machinery.machineUpdateError);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMachine(id);
      message.success(t.machinery.deleteSuccess);
      load();
    } catch {
      message.error(t.machinery.deleteError);
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
      render: (v: MachineryStatus) => {
        const color = v === 'Active' ? 'green' : v === 'UnderRepair' ? 'orange' : 'default';
        return <Tag color={color}>{t.machineryStatuses[v as keyof typeof t.machineryStatuses] || v}</Tag>;
      },
    },
    {
      title: t.machinery.assignedDriver,
      dataIndex: 'assignedDriverName',
      key: 'assignedDriverName',
      render: (v?: string) => v || <span style={{ color: '#8b949e' }}>{t.machinery.noDriver}</span>,
    },
    {
      title: 'Наступне ТО',
      dataIndex: 'nextMaintenanceDate',
      render: (date: string | null) => {
        if (!date) return <Text type="secondary">—</Text>;
        const days = dayjs(date).diff(dayjs(), 'day');
        if (days < 0) return <Tag color="red">Прострочено {Math.abs(days)} дн.</Tag>;
        if (days <= 7) return <Tag color="orange">Через {days} дн.</Tag>;
        return <Text type="secondary">{dayjs(date).format('DD.MM.YYYY')}</Text>;
      },
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
          {canDelete && (
            <DeleteConfirmButton
              title={t.common.confirm}
              onConfirm={() => handleDelete(record.id)}
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
            onClick={() => setModalOpen(true)}
          >
            {t.machinery.createMachine}
          </Button>
        )}
        <Button
          icon={<DownloadOutlined />}
          onClick={() => exportToCsv('machinery', result?.items ?? [], [
            { key: 'name', title: t.machinery.name },
            { key: 'inventoryNumber', title: t.machinery.invNumber },
            { key: 'type', title: t.machinery.type },
            { key: 'brand', title: t.machinery.brand },
            { key: 'model', title: t.machinery.model },
            { key: 'year', title: t.machinery.year },
            { key: 'status', title: t.machinery.status },
            { key: 'assignedDriverName', title: t.machinery.assignedDriver },
          ])}
        >
          {t.common.export}
        </Button>
      </Space>
      {loading && !result ? (
        <TableSkeleton rows={8} />
      ) : (
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
          locale={{
            emptyText: <EmptyState
              message={t.machinery.noMachinery || 'Ще немає техніки. Додайте першу'}
              actionLabel={canCreate ? t.machinery.createMachine : undefined}
              onAction={canCreate ? () => setModalOpen(true) : undefined}
            />,
          }}
        />
      )}

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
          <Form.Item name="assignedDriverId" label={t.machinery.assignedDriver}>
            <Select
              allowClear
              showSearch
              placeholder={t.machinery.selectDriver}
              filterOption={(input, option) =>
                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
              }
              options={employees.map(e => ({
                value: e.id,
                label: `${e.lastName} ${e.firstName}`,
              }))}
              onChange={(_val, option) => {
                form.setFieldsValue({
                  assignedDriverName: option ? (option as { label: string }).label : null,
                });
              }}
            />
          </Form.Item>
          <Form.Item name="assignedDriverName" hidden>
            <Input />
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
          <Form.Item name="assignedDriverId" label={t.machinery.assignedDriver}>
            <Select
              allowClear
              showSearch
              placeholder={t.machinery.selectDriver}
              filterOption={(input, option) =>
                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
              }
              options={employees.map(e => ({
                value: e.id,
                label: `${e.lastName} ${e.firstName}`,
              }))}
              onChange={(_val, option) => {
                editForm.setFieldsValue({
                  assignedDriverName: option ? (option as { label: string }).label : null,
                });
              }}
            />
          </Form.Item>
          <Form.Item name="assignedDriverName" hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
