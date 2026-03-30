import { useState, useEffect } from 'react';
import { Table, Button, Space, Spin, Select, message, Drawer, Collapse } from 'antd';
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getAuditLog, type AuditEntryDto } from '../../api/audit';

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [entityType, setEntityType] = useState<string | undefined>(undefined);
  const [selectedEntry, setSelectedEntry] = useState<AuditEntryDto | null>(null);

  const loadAuditLog = async () => {
    setLoading(true);
    try {
      const result = await getAuditLog(entityType, undefined, undefined, undefined, pageNumber, pageSize);
      setEntries(result.entries);
      setTotal(result.total);
    } catch (err) {
      message.error('Failed to load audit log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLog();
  }, [entityType, pageNumber, pageSize]);

  const parseValue = (value?: string) => {
    if (!value) {
      return null;
    }

    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'createdAtUtc',
      key: 'createdAtUtc',
      width: 160,
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm:ss'),
      sorter: (a: AuditEntryDto, b: AuditEntryDto) =>
        dayjs(a.createdAtUtc).unix() - dayjs(b.createdAtUtc).unix(),
    },
    {
      title: 'User',
      dataIndex: 'userEmail',
      key: 'userEmail',
      width: 180,
    },
    {
      title: 'Entity Type',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 120,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (action: string) => {
        const colors: Record<string, string> = {
          Created: '#52c41a', // green
          Updated: '#1890ff', // blue
          Deleted: '#f5222d', // red
        };
        return <span style={{ color: colors[action] || '#999' }}>{action}</span>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      align: 'center' as const,
      render: (_: unknown, record: AuditEntryDto) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => setSelectedEntry(record)}
          size="small"
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Select
            placeholder="Filter by entity type"
            style={{ width: 200 }}
            allowClear
            value={entityType}
            onChange={setEntityType}
            options={[
              { label: 'Operation', value: 'Operation' },
              { label: 'Field', value: 'Field' },
              { label: 'CostRecord', value: 'CostRecord' },
              { label: 'Machinery', value: 'Machinery' },
              { label: 'Employee', value: 'Employee' },
            ]}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={loadAuditLog}
          >
            Refresh
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={entries.map((e) => ({ ...e, key: e.id }))}
        pagination={{
          total,
          pageSize,
          current: pageNumber,
          onChange: (page, size) => {
            setPageNumber(page);
            setPageSize(size);
          },
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total}`,
        }}
        loading={loading}
      />

      <Drawer
        title="Audit Entry Details"
        onClose={() => setSelectedEntry(null)}
        open={!!selectedEntry}
        width={600}
      >
        {selectedEntry && (
          <Collapse
            items={[
              {
                key: 'general',
                label: 'General Info',
                children: (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Timestamp</div>
                      <div>{dayjs(selectedEntry.createdAtUtc).format('DD.MM.YYYY HH:mm:ss')}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>User</div>
                      <div>{selectedEntry.userEmail}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Entity Type</div>
                      <div>{selectedEntry.entityType}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Action</div>
                      <div>{selectedEntry.action}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Entity ID</div>
                      <div style={{ fontSize: 11, wordBreak: 'break-all' }}>{selectedEntry.entityId}</div>
                    </div>
                    {selectedEntry.ipAddress && (
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>IP Address</div>
                        <div>{selectedEntry.ipAddress}</div>
                      </div>
                    )}
                  </div>
                ),
              },
              ...(selectedEntry.oldValues
                ? [
                    {
                      key: 'oldValues',
                      label: 'Old Values',
                      children: (
                        <pre style={{ backgroundColor: 'var(--bg-muted)', padding: 12, borderRadius: 4, overflow: 'auto' }}>
                          {parseValue(selectedEntry.oldValues)}
                        </pre>
                      ),
                    },
                  ]
                : []),
              ...(selectedEntry.affectedColumns && selectedEntry.affectedColumns.length > 0
                ? [
                    {
                      key: 'affectedColumns',
                      label: 'Affected Columns',
                      children: (
                        <Space wrap>
                          {selectedEntry.affectedColumns.map((column) => (
                            <span key={column} style={{ padding: '2px 8px', backgroundColor: 'var(--bg-muted)', borderRadius: 999 }}>
                              {column}
                            </span>
                          ))}
                        </Space>
                      ),
                    },
                  ]
                : []),
              ...(selectedEntry.newValues
                ? [
                    {
                      key: 'newValues',
                      label: 'New Values',
                      children: (
                        <pre style={{ backgroundColor: 'var(--bg-muted)', padding: 12, borderRadius: 4, overflow: 'auto' }}>
                          {parseValue(selectedEntry.newValues)}
                        </pre>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        )}
      </Drawer>
    </Spin>
  );
}
