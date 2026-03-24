import { useState, useEffect } from 'react';
import { Select } from 'antd';
import { BankOutlined } from '@ant-design/icons';
import { getTenants, type TenantDto } from '../../api/tenants';
import { useAuthStore } from '../../stores/authStore';

export default function FarmSwitcher() {
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const { tenantId, setTenantId } = useAuthStore();

  useEffect(() => {
    getTenants()
      .then(setTenants)
      .catch((err) => {
        console.warn('[FarmSwitcher] Failed to load tenants:', err?.message ?? err);
      });
  }, []);

  if (tenants.length <= 1) return null;

  return (
    <Select
      value={tenantId ?? undefined}
      onChange={(value) => setTenantId(value)}
      style={{ minWidth: 160, maxWidth: 220 }}
      size="small"
      variant="filled"
      suffixIcon={<BankOutlined style={{ color: 'var(--text-secondary)' }} />}
      popupMatchSelectWidth={false}
    >
      {tenants.map((t) => (
        <Select.Option key={t.id} value={t.id}>
          {t.name}
        </Select.Option>
      ))}
    </Select>
  );
}
