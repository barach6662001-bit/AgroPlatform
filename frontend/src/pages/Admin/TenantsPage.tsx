import { useEffect, useMemo, useState } from 'react';
import { Table, Input, Typography, Tag, Dropdown, Button, Modal, message, Space, Select } from 'antd';
import { Link } from 'react-router-dom';
import { listAdminTenants, updateAdminTenantFeatures, type AdminTenant } from '../../api/admin';
import { allOptionalFeatureFlagKeys } from '../../features/optionalFeatureFlags';
import { useTranslation } from '../../i18n';

const { Title } = Typography;

export default function AdminTenantsPage() {
  const { t } = useTranslation();

  const [data, setData] = useState<{ items: AdminTenant[]; total: number }>({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkFeature, setBulkFeature] = useState<string | undefined>(undefined);
  const [bulkEnabled, setBulkEnabled] = useState(true);
  const [bulkBusy, setBulkBusy] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const resp = await listAdminTenants({ search, page, pageSize });
      setData({ items: resp.items, total: resp.total });
    } catch {
      message.error(t.admin.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const columns = useMemo(
    () => [
      {
        title: t.admin.colName,
        dataIndex: 'name',
        render: (v: string, r: AdminTenant) => <Link to={`/admin/tenants/${r.id}`}>{v}</Link>,
      },
      { title: t.admin.colEdrpou, dataIndex: 'edrpou' },
      { title: t.admin.colPlan, dataIndex: 'plan' },
      { title: t.admin.colUserCount, dataIndex: 'userCount' },
      { title: t.admin.colFieldCount, dataIndex: 'fieldCount' },
      {
        title: t.admin.colTotalHectares,
        dataIndex: 'totalHectares',
        render: (v: number) => v.toFixed(1),
      },
      {
        title: t.admin.colStatus,
        dataIndex: 'status',
        render: (s: string) => (
          <Tag color={s === 'active' ? 'green' : 'red'}>{s}</Tag>
        ),
      },
      {
        title: t.admin.colCreatedAt,
        dataIndex: 'createdAt',
        render: (v: string) => new Date(v).toLocaleDateString(),
      },
    ],
    [t],
  );

  const applyBulk = async () => {
    if (!bulkFeature || selectedRowKeys.length === 0) return;
    setBulkBusy(true);
    try {
      await Promise.all(
        selectedRowKeys.map((id) =>
          updateAdminTenantFeatures(String(id), [{ key: bulkFeature, isEnabled: bulkEnabled }]),
        ),
      );
      message.success(t.admin.bulkApplied);
      setBulkOpen(false);
      setSelectedRowKeys([]);
      void reload();
    } catch {
      message.error(t.admin.bulkFailed);
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>{t.admin.tenantsTitle}</Title>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder={t.admin.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={() => {
            setPage(1);
            void reload();
          }}
          allowClear
          style={{ width: 320 }}
        />
        <Dropdown
          disabled={selectedRowKeys.length === 0}
          menu={{
            items: [
              {
                key: 'enable-feature',
                label: t.admin.bulkEnableFeature,
                onClick: () => setBulkOpen(true),
              },
            ],
          }}
        >
          <Button>
            {t.admin.bulkActions} ({selectedRowKeys.length})
          </Button>
        </Dropdown>
      </Space>

      <Table<AdminTenant>
        rowKey="id"
        loading={loading}
        dataSource={data.items}
        columns={columns}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={{
          current: page,
          pageSize,
          total: data.total,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />

      <Modal
        title={t.admin.bulkEnableFeature}
        open={bulkOpen}
        onCancel={() => setBulkOpen(false)}
        onOk={applyBulk}
        confirmLoading={bulkBusy}
        okButtonProps={{ disabled: !bulkFeature }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            placeholder={t.admin.selectFeature}
            style={{ width: '100%' }}
            value={bulkFeature}
            onChange={setBulkFeature}
            options={allOptionalFeatureFlagKeys.map((k) => ({ label: k, value: k }))}
          />
          <Select
            value={bulkEnabled}
            onChange={setBulkEnabled}
            options={[
              { label: t.admin.enabled, value: true },
              { label: t.admin.disabled, value: false },
            ]}
            style={{ width: '100%' }}
          />
        </Space>
      </Modal>
    </div>
  );
}
