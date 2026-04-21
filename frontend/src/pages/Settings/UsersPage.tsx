import { useEffect, useState } from 'react';
import { Select, Button, message, Card, Radio, Form, Input, Row, Col, Typography, Divider, Alert, Modal, Space } from 'antd';
import { SaveOutlined, DatabaseOutlined } from '@ant-design/icons';
import apiClient from '../../api/axios';
import { getUsers, updateUserRole, resetUserPassword } from '../../api/users';
import { getCurrentTenant, updateCurrentTenant } from '../../api/tenants';
import type { UserDto } from '../../types/users';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { useTranslation, languages } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import s from './UsersPage.module.css';
import DataTable from '../../components/ui/DataTable';

const { Text } = Typography;

const ROLES = ['CompanyAdmin', 'Manager', 'WarehouseOperator', 'Accountant', 'Viewer'];

export default function UsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  // Map of userId -> currently selected role (may differ from saved)
  const [pendingRoles, setPendingRoles] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [companySaving, setCompanySaving] = useState(false);
  const [companyForm] = Form.useForm();
  const [resetModalUserId, setResetModalUserId] = useState<string | null>(null);
  const [resetForm] = Form.useForm();
  const { t, lang, setLang } = useTranslation();
  const { isAdmin } = useRole();

  const [seedLoading, setSeedLoading] = useState(false);

  const handleSeedDemo = async () => {
    setSeedLoading(true);
    try {
      await apiClient.post('/api/tenants/seed-demo');
      message.success(t.settings.demoDataSuccess);
      setTimeout(() => window.location.reload(), 800);
    } catch {
      message.error(t.settings.demoDataError);
    } finally {
      setSeedLoading(false);
    }
  };

  const load = () => {
    setLoading(true);
    getUsers()
      .then((list) => {
        setUsers(list);
        const initial: Record<string, string> = {};
        list.forEach((u) => { initial[u.id] = u.role; });
        setPendingRoles(initial);
      })
      .catch(() => message.error(t.settings.loadError))
      .finally(() => setLoading(false));
  };

  const loadCompany = () => {
    getCurrentTenant()
      .then((tenant) => {
        companyForm.setFieldsValue({
          companyName: tenant.companyName ?? '',
          edrpou: tenant.edrpou ?? '',
          address: tenant.address ?? '',
          phone: tenant.phone ?? '',
        });
      })
      .catch(() => message.error(t.settings.companyLoadError));
  };

  useEffect(() => { load(); loadCompany(); }, []);

  const handleSave = async (userId: string) => {
    const role = pendingRoles[userId];
    if (!role) return;
    setSaving((prev) => ({ ...prev, [userId]: true }));
    try {
      await updateUserRole(userId, role);
      message.success(t.settings.updateRoleSuccess);
      // Update the local user list so the "saved" role reflects reality
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
    } catch {
      message.error(t.settings.updateRoleError);
    } finally {
      setSaving((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleSaveCompany = async (values: { companyName?: string; edrpou?: string; address?: string; phone?: string }) => {
    setCompanySaving(true);
    try {
      await updateCurrentTenant(values);
      message.success(t.settings.companySaveSuccess);
    } catch {
      message.error(t.settings.companySaveError);
    } finally {
      setCompanySaving(false);
    }
  };

  const handleResetPassword = async (values: { newPassword: string }) => {
    if (!resetModalUserId) return;
    try {
      await resetUserPassword(resetModalUserId, values.newPassword);
      message.success(t.settings.resetPasswordSuccess);
      setResetModalUserId(null);
      resetForm.resetFields();
      load();
    } catch {
      message.error(t.settings.resetPasswordError);
    }
  };

  const columns = [
    {
      title: t.settings.email,
      dataIndex: 'email',
      key: 'email',
      sorter: (a: UserDto, b: UserDto) => a.email.localeCompare(b.email),
    },
    {
      title: t.settings.firstName,
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: t.settings.lastName,
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: t.settings.role,
      key: 'role',
      render: (_: unknown, record: UserDto) => (
        <Select
          value={pendingRoles[record.id] ?? record.role}
          className={s.block0}
          onChange={(v) =>
            setPendingRoles((prev) => ({ ...prev, [record.id]: v }))
          }
          options={ROLES.map((r) => ({
            value: r,
            label: t.roles[r as keyof typeof t.roles] ?? r,
          }))}
          disabled={!isAdmin}
        />
      ),
    },
    {
      title: t.common.actions,
      key: 'actions',
      render: (_: unknown, record: UserDto) => (
        <Space>
          <Button
            size="small"
            type="primary"
            icon={<SaveOutlined />}
            loading={saving[record.id]}
            disabled={!isAdmin || pendingRoles[record.id] === record.role}
            onClick={() => handleSave(record.id)}
          >
            {t.settings.saveRole}
          </Button>
          {isAdmin && (
            <Button
              size="small"
              onClick={() => { setResetModalUserId(record.id); resetForm.resetFields(); }}
            >
              {t.settings.resetPassword}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t.settings.usersTitle} subtitle={t.settings.usersSubtitle} breadcrumbs={<Breadcrumbs items={[{ label: t.nav.settings, path: '/settings/users' }, { label: t.nav.users }]} />} />

      <Card title={t.settings.companyInfo} className={s.spaced}>
        <Form layout="vertical" form={companyForm} onFinish={handleSaveCompany}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="companyName" label={t.settings.companyName}>
                <Input placeholder="ТОВ Агрофірма" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="edrpou" label={t.settings.edrpou}>
                <Input placeholder="12345678" maxLength={10} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="address" label={t.settings.address}>
                <Input placeholder="Дніпропетровська обл., с. Центральне" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label={t.settings.phone}>
                <Input placeholder="+380 XX XXX XX XX" />
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" htmlType="submit" loading={companySaving}>{t.common.save}</Button>
        </Form>
      </Card>

      <Card title={t.settings.language} className={s.spaced}>
        <Radio.Group value={lang} onChange={(e) => setLang(e.target.value)}>
          {languages.map((language) => (
            <Radio.Button key={language.code} value={language.code}
              className={s.spaced1}>
              <img src={language.flag} alt={language.shortLabel} className={s.spaced2} />
              {language.label}
            </Radio.Button>
          ))}
        </Radio.Group>
      </Card>

      {isAdmin && (
        <Card
          title={
            <span>
              <DatabaseOutlined className={s.spaced3} />
              {t.settings.demoDataTitle}
            </span>
          }
          className={s.spaced}
        >
          <Alert
            type="warning"
            showIcon
            message={t.settings.demoDataWarning}
            className={s.spaced4}
          />
          <Text type="secondary" className={s.spaced5}>
            {t.settings.demoDataDescription}
          </Text>
          <Divider className={s.spaced6} />
          <Button
            icon={<DatabaseOutlined />}
            loading={seedLoading}
            onClick={handleSeedDemo}
          >
            {t.settings.demoDataButton}
          </Button>
        </Card>
      )}

      <DataTable
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        open={!!resetModalUserId}
        title={t.settings.resetPassword}
        onCancel={() => { setResetModalUserId(null); resetForm.resetFields(); }}
        footer={null}
        destroyOnClose
      >
        <Form form={resetForm} layout="vertical" onFinish={handleResetPassword}>
          <Form.Item
            name="newPassword"
            label={t.settings.newPassword}
            rules={[{ required: true, min: 8, message: t.settings.enterNewPassword }]}
          >
            <Input.Password placeholder={t.settings.enterNewPassword} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setResetModalUserId(null); resetForm.resetFields(); }}>{t.common.cancel}</Button>
              <Button type="primary" htmlType="submit">{t.settings.resetPassword}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

