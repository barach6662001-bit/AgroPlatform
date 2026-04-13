import { useState, useEffect } from 'react';
import { Button, Space, Spin, Select, message, Drawer, Collapse } from 'antd';
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getAuditLog, type AuditEntryDto } from '../../api/audit';
import s from './AuditLogPage.module.css';
import DataTable from '../../components/ui/DataTable';

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
          Created: 'var(--success)', // green
          Updated: 'var(--info)', // blue
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
      <div className={s.spaced}>
        <Space>
          <Select
            placeholder="Filter by entity type"
            className={s.block2}
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

      <DataTable
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
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total: number, range: [number, number]) =>
            `Показано ${range[0]}-${range[1]} з ${total}`,
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
                  <div className={s.block3}>
                    <div>
                      <div className={s.text12}>Timestamp</div>
                      <div>{dayjs(selectedEntry.createdAtUtc).format('DD.MM.YYYY HH:mm:ss')}</div>
                    </div>
                    <div>
                      <div className={s.text12}>User</div>
                      <div>{selectedEntry.userEmail}</div>
                    </div>
                    <div>
                      <div className={s.text12}>Entity Type</div>
                      <div>{selectedEntry.entityType}</div>
                    </div>
                    <div>
                      <div className={s.text12}>Action</div>
                      <div>{selectedEntry.action}</div>
                    </div>
                    <div>
                      <div className={s.text12}>Entity ID</div>
                      <div className={s.text11}>{selectedEntry.entityId}</div>
                    </div>
                    {selectedEntry.ipAddress && (
                      <div>
                        <div className={s.text12}>IP Address</div>
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
                        <pre className={s.padded}>
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
                            <span key={column} className={s.padded1}>
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
                        <pre className={s.padded}>
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
