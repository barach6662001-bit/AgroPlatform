import { useEffect, useState, useCallback } from 'react';
import { Table, Button, App, Spin, Tag, Space, Modal, Input } from 'antd';
import { CheckOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from '../../i18n';
import {
  getPendingApprovals,
  getAllApprovals,
  approveRequest,
  rejectRequest,
  type ApprovalRequestDto,
} from '../../api/approvals';
import dayjs from 'dayjs';

const ACTION_TYPE_LABELS: Record<number, string> = {
  0: 'IssueStock',
  1: 'WriteOff',
  2: 'InventoryAdjust',
  3: 'TransferStock',
};

const STATUS_MAP: Record<number, { color: string; label: string }> = {
  0: { color: 'orange', label: 'Pending' },
  1: { color: 'green', label: 'Approved' },
  2: { color: 'red', label: 'Rejected' },
};

export default function PendingApprovalsPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [data, setData] = useState<ApprovalRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = showAll ? await getAllApprovals() : await getPendingApprovals();
      setData(result);
    } catch {
      message.error(t.approvals.loadError);
    } finally {
      setLoading(false);
    }
  }, [showAll, message, t]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await approveRequest(id);
      message.success(t.approvals.approveSuccess);
      load();
    } catch {
      message.error(t.approvals.approveError);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModalId) return;
    setActionLoading(rejectModalId);
    try {
      await rejectRequest(rejectModalId, rejectReason || undefined);
      message.success(t.approvals.rejectSuccess);
      setRejectModalId(null);
      setRejectReason('');
      load();
    } catch {
      message.error(t.approvals.rejectError);
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      title: t.approvals.entityType,
      dataIndex: 'entityType',
      key: 'entityType',
      width: 150,
    },
    {
      title: t.approvals.actionType,
      dataIndex: 'actionType',
      key: 'actionType',
      width: 140,
      render: (v: number) => ACTION_TYPE_LABELS[v] ?? v,
    },
    {
      title: t.approvals.amount,
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (v: number) => v?.toLocaleString() ?? '-',
    },
    {
      title: t.approvals.status,
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (v: number) => {
        const s = STATUS_MAP[v] ?? { color: 'default', label: String(v) };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: t.approvals.requestedBy,
      dataIndex: 'requestedBy',
      key: 'requestedBy',
      width: 160,
    },
    {
      title: t.approvals.date,
      dataIndex: 'createdAtUtc',
      key: 'createdAtUtc',
      width: 160,
      render: (v: string) => dayjs(v).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: t.common.actions,
      key: 'actions',
      width: 200,
      render: (_: unknown, record: ApprovalRequestDto) => {
        if (record.status !== 0) return record.decidedBy ? `${record.decidedBy}` : '-';
        return (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              loading={actionLoading === record.id}
              onClick={() => handleApprove(record.id)}
            >
              {t.approvals.approve}
            </Button>
            <Button
              danger
              size="small"
              icon={<CloseOutlined />}
              loading={actionLoading === record.id}
              onClick={() => setRejectModalId(record.id)}
            >
              {t.approvals.reject}
            </Button>
          </Space>
        );
      },
    },
  ];

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>{t.approvals.title}</h2>
        <Space>
          <Button
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? t.approvals.showPending : t.approvals.showAll}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={load} />
        </Space>
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 20 }}
        scroll={{ x: 1000 }}
      />
      <Modal
        open={!!rejectModalId}
        title={t.approvals.rejectTitle}
        onOk={handleReject}
        onCancel={() => { setRejectModalId(null); setRejectReason(''); }}
        confirmLoading={!!actionLoading}
      >
        <Input.TextArea
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder={t.approvals.rejectReasonPlaceholder}
        />
      </Modal>
    </div>
  );
}
