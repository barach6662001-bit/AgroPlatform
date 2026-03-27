import { useState, useEffect } from 'react';
import { Table, Button, Spin, message, Checkbox, Space, Input, Typography, Alert } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { getPermissions, updatePermissions, type PermissionDto, type UpdatePermissionDto } from '../../api/permissions';
import { useTranslation } from '../../i18n';

export default function PermissionsPage() {
  const { t } = useTranslation();
  const [roleId, setRoleId] = useState('');
  const [roleName, setRoleName] = useState('');
  const [permissions, setPermissions] = useState<PermissionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Record<string, UpdatePermissionDto>>({});

  const loadPermissions = async () => {
    if (!roleId) return;
    setLoading(true);
    try {
      const data = await getPermissions(roleId);
      setPermissions(data);
      setChanges({});
    } catch (err) {
      message.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roleId) loadPermissions();
  }, [roleId]);

  const handlePermissionChange = (permissionId: string, key: 'canRead' | 'canCreate' | 'canUpdate' | 'canDelete', value: boolean) => {
    const existing = changes[permissionId] || {
      permissionId,
      canRead: permissions.find(p => p.id === permissionId)?.canRead ?? false,
      canCreate: permissions.find(p => p.id === permissionId)?.canCreate ?? false,
      canUpdate: permissions.find(p => p.id === permissionId)?.canUpdate ?? false,
      canDelete: permissions.find(p => p.id === permissionId)?.canDelete ?? false,
    };

    setChanges({
      ...changes,
      [permissionId]: {
        ...existing,
        [key]: value,
      },
    });
  };

  const handleSave = async () => {
    if (Object.keys(changes).length === 0) {
      message.info('No changes to save');
      return;
    }

    setSaving(true);
    try {
      await updatePermissions(roleId, Object.values(changes));
      message.success('Permissions updated');
      await loadPermissions();
    } catch (err) {
      message.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      width: 150,
    },
    {
      title: 'Read',
      key: 'canRead',
      width: 80,
      align: 'center' as const,
      render: (_: unknown, record: PermissionDto) => {
        const changed = changes[record.id];
        const value = changed?.canRead ?? record.canRead;
        return (
          <Checkbox
            checked={value}
            onChange={(e) => handlePermissionChange(record.id, 'canRead', e.target.checked)}
          />
        );
      },
    },
    {
      title: 'Create',
      key: 'canCreate',
      width: 80,
      align: 'center' as const,
      render: (_: unknown, record: PermissionDto) => {
        const changed = changes[record.id];
        const value = changed?.canCreate ?? record.canCreate;
        return (
          <Checkbox
            checked={value}
            onChange={(e) => handlePermissionChange(record.id, 'canCreate', e.target.checked)}
          />
        );
      },
    },
    {
      title: 'Update',
      key: 'canUpdate',
      width: 80,
      align: 'center' as const,
      render: (_: unknown, record: PermissionDto) => {
        const changed = changes[record.id];
        const value = changed?.canUpdate ?? record.canUpdate;
        return (
          <Checkbox
            checked={value}
            onChange={(e) => handlePermissionChange(record.id, 'canUpdate', e.target.checked)}
          />
        );
      },
    },
    {
      title: 'Delete',
      key: 'canDelete',
      width: 80,
      align: 'center' as const,
      render: (_: unknown, record: PermissionDto) => {
        const changed = changes[record.id];
        const value = changed?.canDelete ?? record.canDelete;
        return (
          <Checkbox
            checked={value}
            onChange={(e) => handlePermissionChange(record.id, 'canDelete', e.target.checked)}
          />
        );
      },
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ marginBottom: 16 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Typography.Title level={4} style={{ margin: 0 }}>{t.permissions.title}</Typography.Title>
          <Alert
            type="info"
            showIcon
            message={t.permissions.staticRolesNotice}
            style={{ marginBottom: 12 }}
          />
          <Space>
            <Input
              placeholder="Role ID (GUID)"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              style={{ width: 380 }}
            />
            <Input
              placeholder="Role name (optional)"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              style={{ width: 220 }}
            />
            <Button icon={<ReloadOutlined />} onClick={loadPermissions} disabled={!roleId || saving}>Load</Button>
          </Space>
        </Space>
        <h3>{roleName || roleId || 'Select role'}</h3>
        <Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
            disabled={!roleId || Object.keys(changes).length === 0}
          >
            Save
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadPermissions}
            disabled={!roleId || saving}
          >
            Reset
          </Button>
          {Object.keys(changes).length > 0 && (
            <span style={{ color: 'var(--text-secondary)' }}>
              {Object.keys(changes).length} changes
            </span>
          )}
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={permissions.map((p) => ({ ...p, key: p.id }))}
        pagination={false}
        size="small"
        bordered
      />
    </Spin>
  );
}
