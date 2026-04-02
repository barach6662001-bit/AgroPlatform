import { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Switch, Space,
  message, Popconfirm, Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { getGrainStorages, createGrainStorage, updateGrainStorage, deleteGrainStorage } from '../../api/grain';
import type { GrainStorageDto } from '../../types/grain';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';

export default function GrainStorageList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasPermission } = useRole();
  const canManage = hasPermission('inventory', 'manage');

  const [storages, setStorages] = useState<GrainStorageDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<GrainStorageDto | null>(null);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    getGrainStorages()
      .then(setStorages)
      .catch(() => message.error(t.grainStorages.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setModalOpen(true);
  };

  const openEdit = (record: GrainStorageDto) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      location: record.location,
      storageType: record.storageType,
      capacityTons: record.capacityTons,
      notes: record.notes,
      isActive: record.isActive,
    });
    setModalOpen(true);
  };

  const handleOk = async () => {
    let values: Record<string, unknown>;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateGrainStorage(editing.id, values);
        message.success(t.grainStorages.updateSuccess);
      } else {
        await createGrainStorage(values);
        message.success(t.grainStorages.createSuccess);
      }
      setModalOpen(false);
      load();
    } catch {
      message.error(t.common.cancel);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGrainStorage(id);
      message.success(t.grainStorages.deleteSuccess);
      load();
    } catch {
      message.error(t.grainStorages.loadError);
    }
  };

  const columns: ColumnsType<GrainStorageDto> = [
    {
      title: t.grainStorages.name,
      dataIndex: 'name',
      key: 'name',
      render: (v: string) => <strong>{v}</strong>,
    },
    {
      title: t.grainStorages.code,
      dataIndex: 'code',
      key: 'code',
      render: (v?: string) => v ?? '—',
    },
    {
      title: t.grainStorages.location,
      dataIndex: 'location',
      key: 'location',
      render: (v?: string) => v ?? '—',
    },
    {
      title: t.grainStorages.storageType,
      dataIndex: 'storageType',
      key: 'storageType',
      render: (v?: string) => v ?? '—',
    },
    {
      title: t.grainStorages.capacity,
      dataIndex: 'capacityTons',
      key: 'capacityTons',
      align: 'right',
      render: (v?: number) => (v != null ? `${v.toLocaleString()} т` : '—'),
    },
    {
      title: t.grainStorages.totalTons,
      dataIndex: 'totalTons',
      key: 'totalTons',
      align: 'right',
      render: (v: number) => `${v.toFixed(2)} т`,
    },
    {
      title: t.grainStorages.batches,
      dataIndex: 'batchCount',
      key: 'batchCount',
      align: 'center',
    },
    {
      title: t.common.status,
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v: boolean) => (
        <Tag color={v ? 'green' : 'default'}>
          {v ? t.common.active : t.common.inactive}
        </Tag>
      ),
    },
    {
      title: t.common.actions,
      key: 'actions',
      width: 100,
      render: (_: unknown, record: GrainStorageDto) => (
        <Space>
          {canManage && (
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => openEdit(record)}
            />
          )}
          {canManage && (
            <Popconfirm
              title={t.grainStorages.deleteConfirm}
              onConfirm={() => handleDelete(record.id)}
              okText={t.common.yes}
              cancelText={t.common.cancel}
            >
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t.grainStorages.title}
        subtitle={t.grainStorages.subtitle}
        breadcrumbs={<Breadcrumbs items={[{ label: t.nav.storageLogistics, path: '/warehouses' }, { label: t.nav.grainStorages }]} />}
        actions={
          <Space>
            <Button
              icon={<UnorderedListOutlined />}
              onClick={() => navigate('/grain')}
            >
              {t.grain.receiveGrain}
            </Button>
            {canManage && (
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                {t.grainStorages.create}
              </Button>
            )}
          </Space>
        }
      />

      <Table
        rowKey="id"
        dataSource={storages}
        columns={columns}
        loading={loading}
        pagination={false}
        locale={{ emptyText: t.grainStorages.noStorages }}
      />

      <Modal
        title={editing ? t.grainStorages.editTitle : t.grainStorages.createTitle}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={t.grainStorages.name}
            rules={[{ required: true, message: t.common.required }]}
          >
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item name="code" label={t.grainStorages.code}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item name="location" label={t.grainStorages.location}>
            <Input maxLength={300} />
          </Form.Item>
          <Form.Item name="storageType" label={t.grainStorages.storageType}>
            <Input maxLength={50} placeholder="Елеватор, амбар, склад..." />
          </Form.Item>
          <Form.Item name="capacityTons" label={t.grainStorages.capacity}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
          <Form.Item name="notes" label={t.grainStorages.notes}>
            <Input.TextArea rows={3} maxLength={1000} />
          </Form.Item>
          <Form.Item name="isActive" label={t.common.active} valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
