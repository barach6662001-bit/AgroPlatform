import { useEffect, useState, useCallback } from 'react';
import { Table, Checkbox, Button, App, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useTranslation } from '../../i18n';
import {
  getRolePermissions,
  updateRolePermissions,
  type RolePermissionDto,
  type RolePermissionItem,
} from '../../api/rolePermissions';

const ALL_POLICIES = [
  'Warehouses.View',
  'Warehouses.Manage',
  'Inventory.View',
  'Inventory.Manage',
  'Analytics.View',
  'Machinery.View',
  'Machinery.Manage',
  'Fields.View',
  'Fields.Manage',
  'Economics.Manage',
  'HR.Manage',
  'GrainStorage.Manage',
  'Fuel.Manage',
  'Sales.Manage',
  'Admin.Manage',
  'Platform.SuperAdmin',
];

const EDITABLE_ROLES = [
  'Manager',
  'WarehouseOperator',
  'Accountant',
  'Viewer',
  'Agronomist',
  'Storekeeper',
  'Director',
  'Operator',
];

const ALL_ROLES = ['SuperAdmin', 'CompanyAdmin', ...EDITABLE_ROLES];

type Matrix = Record<string, Record<string, boolean>>;

function buildMatrix(data: RolePermissionDto[]): Matrix {
  const m: Matrix = {};
  for (const role of ALL_ROLES) {
    m[role] = {};
    for (const policy of ALL_POLICIES) {
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRolePermissions();
      const m = buildMatrix(data);
      setMatrix(m);
      setOriginal(JSON.parse(JSON.stringify(m)));
    } catch {
      message.error(t.rolePermissions.loadError);
    } finally {
      setLoading(false);
    }
  }, [message, t]);

  useEffect(() => { load(); }, [load]);

  const toggle = (role: string, policy: string) => {
    setMatrix((prev) => ({
      ...prev,
      [role]: { ...prev[role], [policy]: !prev[role][policy] },
    }));
  };

  const getDiff = (): RolePermissionItem[] => {
    const items: RolePermissionItem[] = [];
    for (const role of ALL_ROLES) {
      for (const policy of ALL_POLICIES) {
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
    ...ALL_ROLES.map((role) => ({
      title: role,
      dataIndex: role,
      key: role,
      width: 120,
      align: 'center' as const,
      render: (_: unknown, record: { policy: string }) => {
        const isProtected = role === 'SuperAdmin' || role === 'CompanyAdmin';
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

  const dataSource = ALL_POLICIES.map((policy) => ({
    key: policy,
    policy,
  }));

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>{t.rolePermissions.title}</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{t.rolePermissions.subtitle}</p>
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
