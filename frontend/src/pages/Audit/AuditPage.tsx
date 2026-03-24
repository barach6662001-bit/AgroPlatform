import EmptyState from '../../components/EmptyState';
import { useEffect, useRef, useState } from 'react';
import { Table, Select, DatePicker, Input, message, Tag, Space, Typography } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import { getAuditLogs } from '../../api/auditLogs';
import type { AuditLog, AuditLogsResponse } from '../../types/auditLog';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { formatDateTime } from '../../utils/dateFormat';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const ACTION_COLORS: Record<string, string> = {
  Created: 'green',
  Updated: 'blue',
  Deleted: 'red',
};

const ENTITY_TYPE_OPTIONS = [
  'StockMove',
  'GrainMovement',
  'GrainBatch',
  'AgroOperation',
  'Field',
  'Warehouse',
  'WarehouseItem',
  'Machine',
  'Employee',
  'CostRecord',
  'FuelTransaction',
  'Sale',
];

const ACTION_OPTIONS = ['Created', 'Updated', 'Deleted'];

export default function AuditPage() {
  const [result, setResult] = useState<AuditLogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [entityType, setEntityType] = useState<string | undefined>();
  const [actionFilter, setActionFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const { t } = useTranslation();

  const userIdDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedUserId, setDebouncedUserId] = useState<string>('');

  const handleUserIdChange = (value: string) => {
    setUserId(value);
    if (userIdDebounceRef.current) clearTimeout(userIdDebounceRef.current);
    userIdDebounceRef.current = setTimeout(() => setDebouncedUserId(value), 400);
  };

  useEffect(() => { setPage(1); }, [debouncedUserId, entityType, actionFilter, dateRange]);

  useEffect(() => {
    setLoading(true);
    getAuditLogs({
      userId: debouncedUserId || undefined,
      entityType,
      action: actionFilter,
      dateFrom: dateRange?.[0],
      dateTo: dateRange?.[1],
      page,
      pageSize,
    })
      .then(setResult)
      .catch(() => message.error(t.audit.loadError))
      .finally(() => setLoading(false));
  }, [debouncedUserId, entityType, actionFilter, dateRange, page, pageSize, t.audit.loadError]);

  const handleDateChange: RangePickerProps['onChange'] = (_, strs) => {
    setDateRange(strs[0] && strs[1] ? [strs[0], strs[1]] : null);
  };

  const logs = result?.items ?? [];

  const columns = [
    {
      title: t.audit.timestamp,
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (v: string) => formatDateTime(v),
      width: 160,
    },
    {
      title: t.audit.action,
      dataIndex: 'action',
      key: 'action',
      render: (v: string) => (
        <Tag color={ACTION_COLORS[v] ?? 'default'}>{v}</Tag>
      ),
      width: 100,
    },
    {
      title: t.audit.entityType,
      dataIndex: 'entityType',
      key: 'entityType',
      width: 160,
    },
    {
      title: t.audit.entityId,
      dataIndex: 'entityId',
      key: 'entityId',
      render: (v?: string) => v
        ? <Text copyable style={{ fontSize: 12 }}>{v.slice(0, 8)}…</Text>
        : '—',
      width: 140,
    },
    {
      title: t.audit.userId,
      dataIndex: 'userId',
      key: 'userId',
      render: (v: string) => v || '—',
      width: 220,
    },
    {
      title: t.audit.metadata,
      dataIndex: 'metadata',
      key: 'metadata',
      render: (v?: string) => {
        if (!v) return '—';
        try {
          const parsed = JSON.parse(v) as Record<string, unknown>;
          return (
            <Text style={{ fontSize: 11 }} title={v}>
              {Object.entries(parsed)
                .slice(0, 3)
                .map(([k, val]) => `${k}: ${val}`)
                .join(', ')}
              {Object.keys(parsed).length > 3 ? '…' : ''}
            </Text>
          );
        } catch {
          return <Text style={{ fontSize: 11 }}>{v}</Text>;
        }
      },
      ellipsis: true,
    },
  ];

  return (
    <div>
      <PageHeader title={t.audit.title} subtitle={t.audit.subtitle} />

      <Space wrap style={{ marginBottom: 16 }}>
        <Input
          placeholder={t.audit.filterUser}
          value={userId}
          onChange={(e) => handleUserIdChange(e.target.value)}
          allowClear
          style={{ width: 220 }}
        />
        <RangePicker onChange={handleDateChange} style={{ width: 280 }} />
        <Select
          placeholder={t.audit.filterEntity}
          value={entityType}
          onChange={(v) => setEntityType(v)}
          allowClear
          style={{ width: 180 }}
          options={ENTITY_TYPE_OPTIONS.map((et) => ({ value: et, label: et }))}
        />
        <Select
          placeholder={t.audit.filterAction}
          value={actionFilter}
          onChange={(v) => setActionFilter(v)}
          allowClear
          style={{ width: 140 }}
          options={ACTION_OPTIONS.map((a) => ({
            value: a,
            label: <Tag color={ACTION_COLORS[a] ?? 'default'}>{a}</Tag>,
          }))}
        />
      </Space>

      <Table<AuditLog>
        rowKey="id"
        columns={columns}
        dataSource={logs}
        loading={loading}
        locale={{ emptyText: <EmptyState /> }}
        pagination={{
          current: page,
          pageSize,
          total: result?.totalCount ?? 0,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
          showTotal: (total) => `${total}`,
        }}
        scroll={{ x: 900 }}
        size="small"
      />
    </div>
  );
}
