import { useEffect, useState } from 'react';
import { Badge, message, Button, Space, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getWarehouses, createWarehouse } from '../../api/warehouses';
import type { WarehouseDto } from '../../types/warehouse';
import type { PaginatedResult } from '../../types/common';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import s from './WarehousesList.module.css';
import PremiumTable from '../../components/PremiumTable/PremiumTable';
import DataTable from '../../components/ui/DataTable';

export default function WarehousesList() {
  const [result, setResult] = useState<PaginatedResult<WarehouseDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { hasPermission } = useRole();

  const canCreate = hasPermission('warehouses', 'manage');

  const load = (p = page, ps = pageSize) => {
    setLoading(true);
    getWarehouses({ page: p, pageSize: ps })
      .then(setResult)
      .catch(() => message.error(t.warehouses.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, pageSize]);

  const handleCreate = async () => {
    let values: { name: string; location?: string; type?: number };
    try {
      values = await form.validateFields();
    } catch {
      return; // form validation failed - inline errors are shown on the fields
    }

    setSaving(true);
    try {
      await createWarehouse(values);
      message.success(t.warehouses.createSuccess);
      form.resetFields();
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) return; // axios interceptor already showed the conflict notification
      if (status && status >= 500) return; // axios interceptor already showed the global error notification
      message.error(t.warehouses.createError);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: t.warehouses.name, dataIndex: 'name', key: 'name', sorter: (a: WarehouseDto, b: WarehouseDto) => a.name.localeCompare(b.name) },
    { title: t.warehouses.location, dataIndex: 'location', key: 'location', render: (v: string) => v || '—' },
    {
      title: t.warehouses.type, dataIndex: 'type', key: 'type',
      render: (v: number) => v === 1 ? t.warehouses.typeGrain : t.warehouses.typeGeneral,
      filters: [{ text: t.warehouses.typeGeneral, value: 0 }, { text: t.warehouses.typeGrain, value: 1 }],
      onFilter: (value: unknown, record: WarehouseDto) => record.type === value,
    },
    {
      title: t.warehouses.status, dataIndex: 'isActive', key: 'isActive',
      render: (v: boolean) => v ? <Badge status="success" text={t.warehouses.active} /> : <Badge status="default" text={t.warehouses.inactive} />,
      filters: [{ text: t.warehouses.active, value: true }, { text: t.warehouses.inactive, value: false }],
      onFilter: (value: unknown, record: WarehouseDto) => record.isActive === value,
    },
    {
      title: t.warehouses.actions, key: 'actions',
      render: (_: unknown, record: WarehouseDto) => (
        <a onClick={() => navigate(`/warehouses/items?warehouse=${record.id}`)}>{t.warehouses.balances}</a>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t.warehouses.title} subtitle={t.warehouses.subtitle} breadcrumbs={<Breadcrumbs items={[{ label: t.nav.storageLogistics, path: '/warehouses' }, { label: t.nav.warehouses }]} />} />
      <Space className={s.spaced}>
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            {t.warehouses.createWarehouse}
          </Button>
        )}
      </Space>
      <PremiumTable
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
        onRow={(record) => ({ onClick: () => navigate(`/warehouses/items?warehouse=${record.id}`) })}
        rowClassName={() => 'clickable-row'}
      />

      <Modal
        title={t.warehouses.createWarehouse}
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText={t.common.create}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" className={s.spaced1}>
          <Form.Item name="name" label={t.warehouses.name} rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="location" label={t.warehouses.location}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label={t.warehouses.type} initialValue={0}>
            <Select options={[
              { value: 0, label: t.warehouses.typeGeneral },
              { value: 1, label: t.warehouses.typeGrain },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
