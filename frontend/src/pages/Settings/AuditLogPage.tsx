import { useEffect, useState, useCallback } from 'react';
import { Table, Select, DatePicker, Input, Button, Row, Col, message, Tag, Space, Tooltip } from 'antd';
import { SearchOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getAuditLogs } from '../../api/audit';
import type { AuditLogDto } from '../../types/audit';
import type { PaginatedResult } from '../../types/common';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const { RangePicker } = DatePicker;

const ACTION_COLORS: Record<string, string> = {
  Created: 'green',
  Updated: 'blue',
  Deleted: 'red',
};

const ENTITY_TYPES = [
  'StockMove', 'Batch', 'WarehouseItem', 'Warehouse',
  'AgroOperation', 'CostRecord', 'Field', 'Machine',
  'Employee', 'GrainMovement', 'GrainBatch', 'Sale', 'FuelTransaction',
];

const ACTIONS = ['Created', 'Updated', 'Deleted'];

export default function AuditLogPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<PaginatedResult<AuditLogDto> | null>(null);
  const [loading, setLoading] = useState(false);

  const [userFilter, setUserFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string | undefined>();
  const [actionFilter, setActionFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const load = useCallback(() => {
    setLoading(true);
    getAuditLogs({
      userId: userFilter || undefined,
      entityType: entityTypeFilter,
      action: actionFilter,
      dateFrom: dateRange?.[0]?.toISOString(),
      dateTo: dateRange?.[1]?.toISOString(),
      page,
      pageSize,
    })
      .then(setData)
      .catch(() => message.error(t.auditLog.loadError))
      .finally(() => setLoading(false));
  }, [userFilter, entityTypeFilter, actionFilter, dateRange, page, t.auditLog.loadError]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    {
      title: t.auditLog.timestamp,
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (v: string) => dayjs(v).format('DD.MM.YYYY HH:mm:ss'),
    },
    {
      title: t.auditLog.user,
      dataIndex: 'userId',
      key: 'userId',
      width: 200,
      ellipsis: true,
      render: (v?: string) => v ?? '—',
    },
    {
      title: t.auditLog.action,
      dataIndex: 'action',
      key: 'action',
      width: 110,
      render: (v: string) => (
        <Tag color={ACTION_COLORS[v] ?? 'default'}>{v}</Tag>
      ),
    },
    {
      title: t.auditLog.entityType,
      dataIndex: 'entityType',
      key: 'entityType',
      width: 160,
    },
    {
      title: t.auditLog.entityId,
      dataIndex: 'entityId',
      key: 'entityId',
      width: 260,
      ellipsis: true,
      render: (v: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{v}</span>
      ),
    },
    {
      title: t.auditLog.metadata,
      dataIndex: 'metadata',
      key: 'metadata',
      render: (v?: string) =>
        v ? (
          <Tooltip
            title={
              <pre style={{ maxWidth: 400, maxHeight: 200, overflow: 'auto', fontSize: 11 }}>
                {(() => { try { return JSON.stringify(JSON.parse(v), null, 2); } catch { return v; } })()}
              </pre>
            }
            overlayStyle={{ maxWidth: 450 }}
          >
            <Button type="link" size="small" icon={<InfoCircleOutlined />}>
              {t.auditLog.view}
            </Button>
          </Tooltip>
        ) : '—',
    },
  ];

  return (
    <div>
      <PageHeader title={t.auditLog.title} subtitle={t.auditLog.subtitle} />

      <div style={{ background: 'var(--bg-surface)', borderRadius: 8, padding: 16, marginBottom: 16, border: '1px solid var(--border)' }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder={t.auditLog.filterUser}
              prefix={<SearchOutlined />}
              value={userFilter}
              onChange={(e) => { setUserFilter(e.target.value); setPage(1); }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder={t.auditLog.filterEntityType}
              style={{ width: '100%' }}
              allowClear
              value={entityTypeFilter}
              onChange={(v) => { setEntityTypeFilter(v); setPage(1); }}
              options={ENTITY_TYPES.map((e) => ({ value: e, label: e }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder={t.auditLog.filterAction}
              style={{ width: '100%' }}
              allowClear
              value={actionFilter}
              onChange={(v) => { setActionFilter(v); setPage(1); }}
              options={ACTIONS.map((a) => ({ value: a, label: a }))}
            />
          </Col>
          <Col xs={24} sm={12} md={7}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={(v) => { setDateRange(v as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null); setPage(1); }}
              showTime
            />
          </Col>
          <Col xs={24} sm={24} md={2}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => load()} loading={loading} />
            </Space>
          </Col>
        </Row>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.items ?? []}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total: data?.totalCount ?? 0,
          onChange: setPage,
          showSizeChanger: false,
          showTotal: (total) => `${t.auditLog.total}: ${total}`,
        }}
        scroll={{ x: 900 }}
        size="small"
      />
    </div>
  );
}
