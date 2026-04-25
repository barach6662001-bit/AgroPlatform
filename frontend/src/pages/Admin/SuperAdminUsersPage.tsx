import { useEffect, useState } from 'react';
import { Table, Input, Typography, Tag, Button, Modal, Form, message, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  listAdminUsers,
  startImpersonation,
  type AdminUser,
} from '../../api/admin';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from '../../i18n';

const { Title } = Typography;

/**
 * Global users page (PR #614 / TZ ПУНКТ 14). Visible to super-admins only.
 * Shows users across all tenants with global search and an "impersonate" action
 * gated by a reason modal (≥10 chars).
 */
export default function SuperAdminUsersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const token = useAuthStore((s) => s.token);
  const email = useAuthStore((s) => s.email);
  const role = useAuthStore((s) => s.role);
  const tenantId = useAuthStore((s) => s.tenantId);
  const firstName = useAuthStore((s) => s.firstName);
  const lastName = useAuthStore((s) => s.lastName);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setImpersonation = useAuthStore((s) => s.setImpersonation);

  const [data, setData] = useState<{ items: AdminUser[]; total: number }>({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');

  const [target, setTarget] = useState<AdminUser | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const resp = await listAdminUsers({ search: search || undefined, page, pageSize });
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

  const columns = [
    { title: t.admin.colEmail, dataIndex: 'email' },
    {
      title: t.admin.colFullName,
      render: (_: unknown, r: AdminUser) => `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() || '—',
    },
    { title: t.admin.colRole, dataIndex: 'role' },
    { title: t.admin.colTenant, dataIndex: 'tenantName' },
    {
      title: t.admin.colActive,
      dataIndex: 'isActive',
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '✓' : '✕'}</Tag>,
    },
    {
      title: t.admin.colSuperAdmin,
      dataIndex: 'isSuperAdmin',
      render: (v: boolean) => (v ? <Tag color="gold">★</Tag> : null),
    },
    {
      title: t.admin.colActions,
      render: (_: unknown, r: AdminUser) => (
        <Button
          size="small"
          danger
          disabled={r.isSuperAdmin}
          onClick={() => {
            setTarget(r);
            setReason('');
          }}
        >
          {t.admin.actionImpersonate}
        </Button>
      ),
    },
  ];

  const onConfirm = async () => {
    if (!target) return;
    if (reason.trim().length < 10) {
      message.warning(t.admin.impersonateReasonTooShort);
      return;
    }
    setBusy(true);
    try {
      const resp = await startImpersonation(target.id, reason.trim());
      // Snapshot original super-admin identity so the banner can restore on exit.
      setImpersonation({
        impersonatedBy: '', // server-side derived; not needed by banner
        targetUserId: resp.targetUserId,
        targetEmail: resp.targetEmail,
        targetFirstName: resp.targetFirstName,
        targetLastName: resp.targetLastName,
        targetTenantId: resp.targetTenantId,
        targetTenantName: resp.targetTenantName,
        reason: reason.trim(),
        expiresAtUtc: resp.expiresAtUtc,
        originalToken: token ?? '',
        originalTenantId: tenantId ?? '',
        originalEmail: email ?? '',
        originalFirstName: firstName ?? '',
        originalLastName: lastName ?? '',
        originalRole: role ?? '',
      });
      // Swap auth to the impersonation token. is_super_admin=false on the JWT,
      // mirror that locally so the SPA hides super-admin-only UI.
      setAuth(
        resp.token,
        resp.targetEmail,
        '', // role is encoded in JWT; the frontend doesn't need to drive impersonation by role
        resp.targetTenantId,
        false,
        true,
        resp.targetFirstName,
        resp.targetLastName,
        undefined,
        false,
      );
      message.success(t.admin.impersonateStarted);
      setTarget(null);
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { error?: string } } };
      if (e.response?.status === 429) {
        message.error(t.admin.impersonateRateLimited);
      } else {
        message.error(e.response?.data?.error ?? t.admin.impersonateStartFailed);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>{t.admin.usersTitle}</Title>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder={t.admin.usersSearchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={() => {
            setPage(1);
            void reload();
          }}
          style={{ width: 360 }}
          allowClear
        />
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
      />

      <Modal
        open={target !== null}
        title={t.admin.impersonateTitle}
        onCancel={() => setTarget(null)}
        onOk={onConfirm}
        confirmLoading={busy}
        okText={t.admin.impersonateConfirm}
        cancelText={t.admin.impersonateCancel}
        okButtonProps={{ danger: true }}
      >
        <Form layout="vertical">
          <Form.Item label={t.admin.impersonateTargetLabel}>
            <Input value={target?.email ?? ''} disabled />
          </Form.Item>
          <Form.Item label={t.admin.impersonateReasonLabel} required>
            <Input.TextArea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t.admin.impersonateReasonPlaceholder}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
