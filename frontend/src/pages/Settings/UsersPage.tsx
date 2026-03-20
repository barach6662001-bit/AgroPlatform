import { useEffect, useState } from 'react';
import { Table, Select, Button, message, Card, Radio, Form, Input, Row, Col } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { getUsers, updateUserRole } from '../../api/users';
import { getCurrentTenant, updateCurrentTenant } from '../../api/tenants';
import type { UserDto } from '../../types/users';
import PageHeader from '../../components/PageHeader';
import { useTranslation, languages } from '../../i18n';
import { useRole } from '../../hooks/useRole';

const ROLES = ['Administrator', 'Manager', 'Agronomist', 'Storekeeper', 'Director'];

export default function UsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  // Map of userId -> currently selected role (may differ from saved)
  const [pendingRoles, setPendingRoles] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [companySaving, setCompanySaving] = useState(false);
  const [companyForm] = Form.useForm();
  const { t, lang, setLang } = useTranslation();
  const { isAdmin } = useRole();

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
          style={{ width: 160 }}
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
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t.settings.usersTitle} subtitle={t.settings.usersSubtitle} />

      <Card title={t.settings.companyInfo} style={{ marginBottom: 24 }}>
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

      <Card title={t.settings.language} style={{ marginBottom: 24 }}>
        <Radio.Group value={lang} onChange={(e) => setLang(e.target.value)}>
          {languages.map((language) => (
            <Radio.Button key={language.code} value={language.code}
              style={{ marginRight: 8, marginBottom: 8 }}>
              <span style={{ marginRight: 6 }}>{language.flag}</span>
              {language.label}
            </Radio.Button>
          ))}
        </Radio.Group>
      </Card>

      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: 800 }}
        pagination={false}
      />
    </div>
  );
}

