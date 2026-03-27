import { useEffect, useState } from 'react';
import { Table, Badge, message, Button, Space, Modal, Form, Input, InputNumber, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getGrainStorages, createGrainStorage, updateGrainStorage, deleteGrainStorage } from '../../api/grain';
import type { GrainStorageDto } from '../../types/grain';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';

const STORAGE_TYPES = ['Elevator', 'Flat', 'Bin', 'Temporary'];

export default function GrainStorageList() {
  const [items, setItems] = useState<GrainStorageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { hasPermission } = useRole();
  const canManage = hasPermission('grain-storage', 'manage');

  const load = () => {
    setLoading(true);
    getGrainStorages()
      .then(setItems)
      .catch(() => message.error(t.grain.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setModalOpen(true);
  };

  const openEdit = (record: GrainStorageDto) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingId) {
        await updateGrainStorage(editingId, values);
        message.success(t.grainStorages.updateSuccess);
      } else {
        await createGrainStorage(values);
        message.success(t.grainStorages.createSuccess);
      }
      setModalOpen(false);
      form.resetFields();
      load();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status) message.error(t.grain.loadError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: t.grainStorages.deleteConfirm,
      okType: 'danger',
      onOk: () =>
        deleteGrainStorage(id)
          .then(() => { message.success(t.grainStorages.deleteSuccess); load(); })
          .catch(() => message.error(t.grain.loadError)),
    });
  };

  const columns = [
    {
      title: t.grainStorages.name,
      dataIndex: 'name',
      key: 'name',
      sorter: (a: GrainStorageDto, b: GrainStorageDto) => a.name.localeCompare(b.name),
    },
    {
      title: t.grainStorages.code,
      dataIndex: 'code',
      key: 'code',
      render: (v: string) => v || '—',
    },
    {
      title: t.grainStorages.storageType,
      dataIndex: 'storageType',
      key: 'storageType',
      render: (v: string) => v || '—',
    },
    {
      title: t.grainStorages.capacity,
      dataIndex: 'capacityTons',
      key: 'capacityTons',
      render: (v: number) => v != null ? `${v.toLocaleString('uk-UA')} т` : '—',
    },
    {
      title: t.grainStorages.totalTons,
      dataIndex: 'totalTons',
      key: 'totalTons',
      render: (v: number) => `${v.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} т`,
    },
    {
      title: t.grainStorages.batches,
      dataIndex: 'batchCount',
      key: 'batchCount',
    },
    {
      title: t.warehouses.location,
      dataIndex: 'location',
      key: 'location',
      render: (v: string) => v || '—',
    },
    {
      title: t.warehouses.status,
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v: boolean) =>
        v ? <Badge status="success" text={t.warehouses.active} />
          : <Badge status="default" text={t.warehouses.inactive} />,
    },
    ...(canManage ? [{
      title: t.warehouses.actions,
      key: 'actions',
      render: (_: unknown, record: GrainStorageDto) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openEdit(record); }} />
          <Button type="link" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }} />
        </Space>
      ),
    }] : []),
  ];

  return (
    <div>
      <PageHeader title={t.grainStorages.title} subtitle={t.grainStorages.subtitle} />
      <Space style={{ marginBottom: 16 }}>
        {canManage && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: '#d4a017', borderColor: '#d4a017' }}
            onClick={openCreate}
          >
            {t.grainStorages.create}
          </Button>
        )}
      </Space>
      <Table
        dataSource={items}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, hideOnSinglePage: true }}
      />
      <Modal
        title={editingId ? t.grainStorages.editTitle : t.grainStorages.createTitle}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText={editingId ? t.common.save : t.common.create}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label={t.grainStorages.name}
            rules={[{ required: true, message: t.common.required }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="code" label={t.grainStorages.code}>
            <Input />
          </Form.Item>
          <Form.Item name="location" label={t.warehouses.location}>
            <Input />
          </Form.Item>
          <Form.Item name="storageType" label={t.grainStorages.storageType}>
            <Select allowClear options={STORAGE_TYPES.map(s => ({ value: s, label: s }))} />
          </Form.Item>
          <Form.Item name="capacityTons" label={t.grainStorages.capacity}>
            <InputNumber min={0} style={{ width: '100%' }} addonAfter="т" />
          </Form.Item>
          <Form.Item name="isActive" label={t.warehouses.status}>
            <Select options={[
              { value: true, label: t.warehouses.active },
              { value: false, label: t.warehouses.inactive },
            ]} />
          </Form.Item>
          <Form.Item name="notes" label={t.grainStorages.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
