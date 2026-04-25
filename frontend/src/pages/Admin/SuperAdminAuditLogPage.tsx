import { useEffect, useState } from 'react';
import { Table, Input, Typography, DatePicker, Button, Space, message, Tag } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { listAdminAuditLog, type SuperAdminAuditEntry } from '../../api/admin';
import { useTranslation } from '../../i18n';

const { Title } = Typography;

/**
 * Super-admin audit log page (PR #614 / TZ ПУНКТ 14). Shows the platform-wide
 * audit trail with filters by action / admin / tenant / period. Visible to
 * super-admins only.
 */
export default function SuperAdminAuditLogPage() {
  const { t } = useTranslation();

  const [data, setData] = useState<{ items: SuperAdminAuditEntry[]; total: number }>({
    items: [],
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const [action, setAction] = useState('');
  const [adminUserId, setAdminUserId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [from, setFrom] = useState<Dayjs | null>(null);
  const [to, setTo] = useState<Dayjs | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const resp = await listAdminAuditLog({
        action: action || undefined,
        adminUserId: adminUserId || undefined,
        tenantId: tenantId || undefined,
        fromUtc: from ? from.toISOString() : undefined,
        toUtc: to ? to.toISOString() : undefined,
        page,
        pageSize,
      });
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

  const reset = () => {
    setAction('');
    setAdminUserId('');
    setTenantId('');
    setFrom(null);
    setTo(null);
    setPage(1);
    setTimeout(() => void reload(), 0);
  };

  const columns = [
    {
      title: t.admin.auditColOccurredAt,
      dataIndex: 'occurredAt',
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss'),
      width: 170,
    },
    {
      title: t.admin.auditColAction,
      dataIndex: 'action',
      render: (v: string) => <Tag color={v.startsWith('impersonate') ? 'red' : 'blue'}>{v}</Tag>,
      width: 220,
    },
    { title: t.admin.auditColAdmin, dataIndex: 'adminUserId', width: 280 },
    {
      title: t.admin.auditColTarget,
      render: (_: unknown, r: SuperAdminAuditEntry) => `${r.targetType}: ${r.targetId ?? '—'}`,
    },
    { title: t.admin.auditColIp, dataIndex: 'ipAddress', width: 130 },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>{t.admin.auditLogTitle}</Title>
      <Space wrap style={{ marginBottom: 16 }}>
        <Input
          placeholder={t.admin.auditFilterAction}
          value={action}
          onChange={(e) => setAction(e.target.value)}
          style={{ width: 220 }}
          allowClear
        />
        <Input
          placeholder={t.admin.auditFilterAdmin}
          value={adminUserId}
          onChange={(e) => setAdminUserId(e.target.value)}
          style={{ width: 280 }}
          allowClear
        />
        <Input
          placeholder={t.admin.auditFilterTenant}
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
          style={{ width: 280 }}
          allowClear
        />
        <DatePicker
          showTime
          placeholder={t.admin.auditFilterFrom}
          value={from}
          onChange={setFrom}
        />
        <DatePicker
          showTime
          placeholder={t.admin.auditFilterTo}
          value={to}
          onChange={setTo}
        />
        <Button
          type="primary"
          onClick={() => {
            setPage(1);
            void reload();
          }}
        >
          {t.admin.auditFilterApply}
        </Button>
        <Button onClick={reset}>{t.admin.auditFilterReset}</Button>
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data.items}
        pagination={{
          current: page,
          pageSize,
          total: data.total,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
        expandable={{
          expandedRowRender: (r: SuperAdminAuditEntry) => (
            <div>
              <div style={{ marginBottom: 8 }}>
                <strong>{t.admin.auditColPayload}</strong>
              </div>
              <pre
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  padding: 8,
                  borderRadius: 4,
                  fontSize: 12,
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {JSON.stringify({ before: r.before, after: r.after, userAgent: r.userAgent }, null, 2)}
              </pre>
            </div>
          ),
        }}
      />
    </div>
  );
}
