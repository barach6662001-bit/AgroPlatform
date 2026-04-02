import { useEffect, useState, useCallback } from 'react';
import { Table, Select, DatePicker, Input, Button, Row, Col, message, Tag, Space, Drawer, Typography } from 'antd';
import { SearchOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getAuditLogs } from '../../api/audit';
import type { AuditLogDto } from '../../types/audit';
import type { PaginatedResult } from '../../types/common';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import s from './AuditLogPage.module.css';

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

function parseAuditPayload(value?: string): Record<string, unknown> {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function formatAuditValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(value, null, 2);
}

export default function AuditLogPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<PaginatedResult<AuditLogDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AuditLogDto | null>(null);

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

  const diffRows = (() => {
    if (!selectedEntry) {
      return [] as Array<{ key: string; field: string; before: string; after: string }>;
    }

    const oldValues = parseAuditPayload(selectedEntry.oldValues);
    const newValues = parseAuditPayload(selectedEntry.newValues);
    const keys = (selectedEntry.affectedColumns?.length ?? 0) > 0
      ? selectedEntry.affectedColumns
      : Array.from(new Set([...Object.keys(oldValues), ...Object.keys(newValues)])).sort();

    return keys.map((key) => ({
      key,
      field: key,
      before: formatAuditValue(oldValues[key]),
      after: formatAuditValue(newValues[key]),
    }));
  })();

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
        <span className={s.text12}>{v}</span>
      ),
    },
    {
      title: t.auditLog.affectedColumns,
      dataIndex: 'affectedColumns',
      key: 'affectedColumns',
      render: (values?: string[]) =>
        values && values.length > 0 ? (
          <Space size={[4, 4]} wrap>
            {values.map((value) => (
              <Tag key={value}>{value}</Tag>
            ))}
          </Space>
        ) : '—',
    },
    {
      title: t.auditLog.changes,
      key: 'changes',
      width: 120,
      render: (_: unknown, record: AuditLogDto) => (
        <Button
          type="link"
          size="small"
          icon={<InfoCircleOutlined />}
          onClick={() => setSelectedEntry(record)}
        >
          {t.auditLog.view}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t.auditLog.title} subtitle={t.auditLog.subtitle} />

      <div className={s.spaced}>
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
              className={s.fullWidth}
              allowClear
              value={entityTypeFilter}
              onChange={(v) => { setEntityTypeFilter(v); setPage(1); }}
              options={ENTITY_TYPES.map((e) => ({ value: e, label: e }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder={t.auditLog.filterAction}
              className={s.fullWidth}
              allowClear
              value={actionFilter}
              onChange={(v) => { setActionFilter(v); setPage(1); }}
              options={ACTIONS.map((a) => ({ value: a, label: a }))}
            />
          </Col>
          <Col xs={24} sm={12} md={7}>
            <RangePicker
              className={s.fullWidth}
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

      <Drawer
        title={t.auditLog.changes}
        open={!!selectedEntry}
        width={760}
        onClose={() => setSelectedEntry(null)}
      >
        {selectedEntry && (
          <Space direction="vertical" size={16} className={s.fullWidth}>
            <div className={s.block6}>
              <div>
                <div className={s.text121}>{t.auditLog.timestamp}</div>
                <div>{dayjs(selectedEntry.timestamp).format('DD.MM.YYYY HH:mm:ss')}</div>
              </div>
              <div>
                <div className={s.text121}>{t.auditLog.user}</div>
                <div>{selectedEntry.userId ?? '—'}</div>
              </div>
              <div>
                <div className={s.text121}>{t.auditLog.entityType}</div>
                <div>{selectedEntry.entityType}</div>
              </div>
              <div>
                <div className={s.text121}>{t.auditLog.action}</div>
                <div>{selectedEntry.action}</div>
              </div>
              <div className={s.block11}>
                <div className={s.text121}>{t.auditLog.entityId}</div>
                <Typography.Text code copyable>
                  {selectedEntry.entityId}
                </Typography.Text>
              </div>
            </div>

            <Table
              rowKey="key"
              size="small"
              pagination={false}
              dataSource={diffRows}
              locale={{ emptyText: selectedEntry.notes ?? t.auditLog.noDetails }}
              columns={[
                {
                  title: t.auditLog.affectedColumns,
                  dataIndex: 'field',
                  key: 'field',
                  width: 220,
                },
                {
                  title: t.auditLog.before,
                  dataIndex: 'before',
                  key: 'before',
                  render: (value: string) => (
                    <pre className={s.spaced1}>{value}</pre>
                  ),
                },
                {
                  title: t.auditLog.after,
                  dataIndex: 'after',
                  key: 'after',
                  render: (value: string) => (
                    <pre className={s.spaced1}>{value}</pre>
                  ),
                },
              ]}
            />

            {selectedEntry.notes ? (
              <div>
                <div className={s.text122}>{t.auditLog.notes}</div>
                <Typography.Text>{selectedEntry.notes}</Typography.Text>
              </div>
            ) : null}
          </Space>
        )}
      </Drawer>
    </div>
  );
}
