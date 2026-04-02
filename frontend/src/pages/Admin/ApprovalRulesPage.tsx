import { useEffect, useState, useCallback } from 'react';
import { Table, Button, App, Spin, Modal, Form, Input, InputNumber, Select, Space, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from '../../i18n';
import {
  getApprovalRules,
  createApprovalRule,
  updateApprovalRule,
  deleteApprovalRule,
  type ApprovalRuleDto,
} from '../../api/approvals';

const ACTION_TYPE_OPTIONS = [
  { value: 0, label: 'IssueStock' },
  { value: 1, label: 'WriteOff' },
  { value: 2, label: 'InventoryAdjust' },
  { value: 3, label: 'TransferStock' },
];

const ROLE_OPTIONS = [
  'CompanyAdmin',
  'Manager',
  'Accountant',
  'WarehouseOperator',
];

export default function ApprovalRulesPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [data, setData] = useState<ApprovalRuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRuleDto | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getApprovalRules());
    } catch {
      message.error(t.approvalRules.loadError);
    } finally {
      setLoading(false);
    }
  }, [message, t]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingRule) {
        await updateApprovalRule(editingRule.id, { ...editingRule, ...values });
        message.success(t.approvalRules.updateSuccess);
      } else {
        await createApprovalRule(values);
        message.success(t.approvalRules.createSuccess);
      }
      setModalOpen(false);
      setEditingRule(null);
      form.resetFields();
      load();
    } catch {
      message.error(t.approvalRules.saveError);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApprovalRule(id);
      message.success(t.approvalRules.deleteSuccess);
      load();
    } catch {
      message.error(t.approvalRules.deleteError);
    }
  };

  const openEdit = (rule: ApprovalRuleDto) => {
    setEditingRule(rule);
    form.setFieldsValue(rule);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingRule(null);
    form.resetFields();
    setModalOpen(true);
  };

  const columns = [
    {
      title: t.approvalRules.entityType,
      dataIndex: 'entityType',
      key: 'entityType',
      width: 180,
    },
    {
      title: t.approvalRules.actionType,
      dataIndex: 'actionType',
      key: 'actionType',
      width: 150,
      render: (v: number) => ACTION_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? v,
    },
    {
      title: t.approvalRules.threshold,
      dataIndex: 'threshold',
      key: 'threshold',
      width: 120,
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: t.approvalRules.requiredRole,
      dataIndex: 'requiredRole',
      key: 'requiredRole',
      width: 160,
    },
    {
      title: t.common.actions,
      key: 'actions',
      width: 150,
      render: (_: unknown, record: ApprovalRuleDto) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title={t.common.confirm} onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>{t.approvalRules.title}</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t.approvalRules.create}
        </Button>
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 20 }}
        scroll={{ x: 800 }}
      />
      <Modal
        open={modalOpen}
        title={editingRule ? t.approvalRules.editTitle : t.approvalRules.createTitle}
        onOk={handleSave}
        onCancel={() => { setModalOpen(false); setEditingRule(null); form.resetFields(); }}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="entityType" label={t.approvalRules.entityType} rules={[{ required: true }]}>
            <Input placeholder="WarehouseItem" />
          </Form.Item>
          <Form.Item name="actionType" label={t.approvalRules.actionType} rules={[{ required: true }]}>
            <Select options={ACTION_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="threshold" label={t.approvalRules.threshold} rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="requiredRole" label={t.approvalRules.requiredRole} rules={[{ required: true }]}>
            <Select options={ROLE_OPTIONS.map((r) => ({ value: r, label: r }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
