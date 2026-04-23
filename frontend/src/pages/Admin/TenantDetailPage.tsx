import { useEffect, useState } from 'react';
import { Tabs, Card, Descriptions, Tag, Switch, Button, Space, message, Typography, Spin } from 'antd';
import { useParams, Link } from 'react-router-dom';
import {
  getAdminTenant,
  getAdminTenantFeatures,
  updateAdminTenantFeatures,
  type AdminTenant,
  type AdminFeature,
} from '../../api/admin';
import { useTranslation } from '../../i18n';

const { Title } = Typography;

export default function TenantDetailPage() {
  const { id = '' } = useParams();
  const { t } = useTranslation();

  const [tenant, setTenant] = useState<AdminTenant | null>(null);
  const [features, setFeatures] = useState<AdminFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [t, fs] = await Promise.all([getAdminTenant(id), getAdminTenantFeatures(id)]);
        if (cancelled) return;
        setTenant(t);
        setFeatures(fs);
      } catch {
        if (!cancelled) message.error('Load failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const toggle = (key: string, value: boolean) => {
    setFeatures((prev) => prev.map((f) => (f.key === key ? { ...f, isEnabled: value } : f)));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateAdminTenantFeatures(
        id,
        features.map(({ key, isEnabled }) => ({ key, isEnabled })),
      );
      setFeatures(updated);
      setDirty(false);
      message.success(t.admin.featuresSaved);
    } catch {
      message.error(t.admin.featuresSaveFailed);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin style={{ margin: 48 }} />;
  if (!tenant) return null;

  return (
    <div style={{ padding: 24 }}>
      <Link to="/admin/tenants">← {t.admin.backToList}</Link>
      <Title level={3} style={{ marginTop: 8 }}>
        {tenant.name}
      </Title>
      <Tabs
        items={[
          {
            key: 'overview',
            label: t.admin.tabOverview,
            children: (
              <Card>
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label={t.admin.colName}>{tenant.name}</Descriptions.Item>
                  <Descriptions.Item label={t.admin.colEdrpou}>{tenant.edrpou ?? '—'}</Descriptions.Item>
                  <Descriptions.Item label={t.admin.colPlan}>{tenant.plan}</Descriptions.Item>
                  <Descriptions.Item label={t.admin.colUserCount}>{tenant.userCount}</Descriptions.Item>
                  <Descriptions.Item label={t.admin.colFieldCount}>{tenant.fieldCount}</Descriptions.Item>
                  <Descriptions.Item label={t.admin.colTotalHectares}>
                    {tenant.totalHectares.toFixed(1)}
                  </Descriptions.Item>
                  <Descriptions.Item label={t.admin.colStatus}>
                    <Tag color={tenant.status === 'active' ? 'green' : 'red'}>{tenant.status}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={t.admin.colCreatedAt}>
                    {new Date(tenant.createdAt).toLocaleString()}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ),
          },
          {
            key: 'features',
            label: t.admin.tabFeatures,
            children: (
              <Card>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {features.map((f) => (
                    <div
                      key={f.key}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <span>{f.key}</span>
                      <Switch
                        checked={f.isEnabled}
                        onChange={(v) => toggle(f.key, v)}
                      />
                    </div>
                  ))}
                  <Space style={{ marginTop: 16 }}>
                    <Button type="primary" onClick={save} loading={saving} disabled={!dirty}>
                      {t.admin.save}
                    </Button>
                  </Space>
                </Space>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
