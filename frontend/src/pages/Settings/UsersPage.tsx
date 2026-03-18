import { useEffect, useState } from 'react';
import { Table, Select, Button, message, Card, Radio } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { getUsers, updateUserRole } from '../../api/users';
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

  useEffect(() => { load(); }, []);

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
        pagination={false}
      />
    </div>
  );
}
