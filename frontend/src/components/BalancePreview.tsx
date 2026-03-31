import { useEffect, useState } from 'react';
import { Select, Card, Typography, Alert, Space, Spin } from 'antd';
import { getBalances, getWarehouses, getWarehouseItems } from '../api/warehouses';
import type { BalanceDto, WarehouseDto, WarehouseItemDto } from '../types/warehouse';
import type { PaginatedResult } from '../types/common';
import { useTranslation } from '../i18n';

const { Text, Title } = Typography;

interface BalancePreviewProps {
  /** Pre-selected item ID */
  itemId?: string;
  /** Pre-selected warehouse ID */
  warehouseId?: string;
  /** Quantity to deduct (for preview of post-operation balance) */
  pendingQuantity?: number;
}

export default function BalancePreview({ itemId: propItemId, warehouseId: propWarehouseId, pendingQuantity }: BalancePreviewProps) {
  const { t } = useTranslation();
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [items, setItems] = useState<WarehouseItemDto[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | undefined>(propWarehouseId);
  const [selectedItem, setSelectedItem] = useState<string | undefined>(propItemId);
  const [balance, setBalance] = useState<BalanceDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      getWarehouses({ pageSize: 200 }),
      getWarehouseItems({ pageSize: 200 }),
    ]).then(([w, i]) => {
      setWarehouses(w.items);
      setItems(i.items);
    });
  }, []);

  useEffect(() => {
    if (propItemId) setSelectedItem(propItemId);
  }, [propItemId]);

  useEffect(() => {
    if (propWarehouseId) setSelectedWarehouse(propWarehouseId);
  }, [propWarehouseId]);

  useEffect(() => {
    if (!selectedWarehouse || !selectedItem) {
      setBalance(null);
      return;
    }
    setLoading(true);
    getBalances({ warehouseId: selectedWarehouse, itemId: selectedItem, pageSize: 1 })
      .then((res: PaginatedResult<BalanceDto>) => {
        setBalance(res.items.length > 0 ? res.items[0] : null);
      })
      .finally(() => setLoading(false));
  }, [selectedWarehouse, selectedItem]);

  const currentBalance = balance?.balanceBase ?? 0;
  const unit = balance?.baseUnit ?? '';
  const qty = pendingQuantity ?? 0;
  const newBalance = currentBalance - qty;
  const isNegative = newBalance < 0;

  return (
    <Card size="small" style={{ marginTop: 8 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Text strong>{t.balancePreview.title}</Text>
        <Space wrap>
          <Select
            placeholder={t.balancePreview.selectWarehouse}
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
            style={{ width: 200 }}
            showSearch
            optionFilterProp="label"
            options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
            allowClear
          />
          <Select
            placeholder={t.balancePreview.selectItem}
            value={selectedItem}
            onChange={setSelectedItem}
            style={{ width: 200 }}
            showSearch
            optionFilterProp="label"
            options={items.map((i) => ({ value: i.id, label: `${i.name} (${i.code})` }))}
            allowClear
          />
        </Space>

        {loading && <Spin size="small" />}

        {!loading && selectedWarehouse && selectedItem && (
          <>
            <Title level={5} style={{ margin: 0 }}>
              {currentBalance.toFixed(1)} {unit}
              {qty > 0 && (
                <>
                  {' → '}
                  <span style={{ color: isNegative ? 'var(--error)' : 'var(--success)' }}>
                    {newBalance.toFixed(1)} {unit}
                  </span>
                </>
              )}
            </Title>
            {isNegative && (
              <Alert type="warning" message={t.balancePreview.negativeWarning} showIcon />
            )}
          </>
        )}
      </Space>
    </Card>
  );
}
