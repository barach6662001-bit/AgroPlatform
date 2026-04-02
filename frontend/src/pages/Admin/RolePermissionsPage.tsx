import { useEffect, useState, useCallback } from 'react';
import { Table, Checkbox, Button, App, Spin, Alert } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useTranslation } from '../../i18n';
import s from './RolePermissionsPage.module.css';
import {
  getRolePermissions,
  getAvailableRoles,
  getAvailablePolicies,
  updateRolePermissions,
  type RolePermissionDto,
  type RolePermissionItem,
} from '../../api/rolePermissions';

const PROTECTED_ROLES = ['SuperAdmin', 'CompanyAdmin'];

type Matrix = Record<string, Record<string, boolean>>;

function buildMatrix(data: RolePermissionDto[], roles: string[], policies: string[]): Matrix {
  const m: Matrix = {};
  for (const role of roles) {
    m[role] = {};
    for (const policy of policies) {
      m[role][policy] = false;
    }
  }
  for (const item of data) {
    if (m[item.roleName]) {
      m[item.roleName][item.policyName] = item.isGranted;
    }
  }
  return m;
}

export default function RolePermissionsPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [matrix, setMatrix] = useState<Matrix>({});
  const [original, setOriginal] = useState<Matrix>({});
  const [roles, setRoles] = useState<string[]>([]);
  const [policies, setPolicies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, fetchedRoles, fetchedPolicies] = await Promise.all([
        getRolePermissions(),
        getAvailableRoles(),
        getAvailablePolicies(),
      ]);
      setRoles(fetchedRoles);
      setPolicies(fetchedPolicies);
      const m = buildMatrix(data, fetchedRoles, fetchedPolicies);
      setMatrix(m);
      setOriginal(JSON.parse(JSON.stringify(m)));
    } catch {
      setError(t.rolePermissions.loadError);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const toggle = (role: string, policy: string) => {
    setMatrix((prev) => ({
      ...prev,
      [role]: { ...prev[role], [policy]: !prev[role][policy] },
    }));
  };

  const getDiff = (): RolePermissionItem[] => {
    const items: RolePermissionItem[] = [];
    for (const role of roles) {
      for (const policy of policies) {
        if (matrix[role]?.[policy] !== original[role]?.[policy]) {
          items.push({ roleName: role, policyName: policy, isGranted: !!matrix[role]?.[policy] });
        }
      }
    }
    return items;
  };

  const handleSave = async () => {
    const diff = getDiff();
    if (diff.length === 0) return;
    setSaving(true);
    try {
      await updateRolePermissions(diff);
      message.success(t.rolePermissions.saveSuccess);
      setOriginal(JSON.parse(JSON.stringify(matrix)));
    } catch {
      message.error(t.rolePermissions.saveError);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = getDiff().length > 0;

  const columns = [
    {
      title: t.rolePermissions.policy,
      dataIndex: 'policy',
      key: 'policy',
      fixed: 'left' as const,
      width: 200,
    },
    ...roles.map((role) => ({
      title: role,
      dataIndex: role,
      key: role,
      width: 120,
      align: 'center' as const,
      render: (_: unknown, record: { policy: string }) => {
        const isProtected = PROTECTED_ROLES.includes(role);
        return (
          <Checkbox
            checked={!!matrix[role]?.[record.policy]}
            disabled={isProtected}
            onChange={() => toggle(role, record.policy)}
          />
        );
      },
    })),
  ];

  const dataSource = policies.map((policy) => ({
    key: policy,
    policy,
  }));

  if (loading) {
    return (
      <div className={s.textCenter}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={s.padded}>
        <Alert type="error" message={error} showIcon />
      </div>
    );
  }

  return (
    <div className={s.padded}>
      <div className={s.flex_center_between}>
        <div>
          <h2 className={s.spaced}>{t.rolePermissions.title}</h2>
          <p className={s.spaced1}>{t.rolePermissions.subtitle}</p>
        </div>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          disabled={!hasChanges}
          onClick={handleSave}
        >
          {t.rolePermissions.save}
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ x: 'max-content' }}
        size="small"
        bordered
      />
    </div>
  );
}
