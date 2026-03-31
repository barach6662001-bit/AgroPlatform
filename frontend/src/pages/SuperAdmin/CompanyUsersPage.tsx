import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import {
  getCompanyUsers,
  createUser,
  deactivateUser,
  activateUser,
  updateUserRole,
  type CompanyUserDto,
  type CreateUserRequest,
} from '../../api/companies';

const COMPANY_ROLES = ['CompanyAdmin', 'Manager', 'WarehouseOperator', 'Accountant', 'Viewer'];

export default function CompanyUsersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: companyId } = useParams<{ id: string }>();
  const [users, setUsers] = useState<CompanyUserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      setUsers(await getCompanyUsers(companyId));
    } catch {
      message.error(t.superAdmin.loadUsersError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [companyId]);

  const openCreate = () => {
    form.resetFields();
    setModalOpen(true);
  };

  const onSubmit = async (values: Omit<CreateUserRequest, 'tenantId'>) => {
    if (!companyId) return;
    try {
      await createUser(companyId, { ...values, tenantId: companyId });
      message.success(t.superAdmin.userCreated);
      setModalOpen(false);
      load();
    } catch {
      message.error(t.superAdmin.saveUserError);
    }
  };

  const onDeactivate = async (userId: string) => {
    try {
      await deactivateUser(userId);
      message.success(t.superAdmin.userDeactivated);
      load();
    } catch {
      message.error(t.superAdmin.deactivateError);
    }
  };

  const onActivate = async (userId: string) => {
    try {
      await activateUser(userId);
      message.success(t.superAdmin.userActivated);
      load();
    } catch {
      message.error(t.superAdmin.deactivateError);
    }
  };

  const onRoleChange = async (userId: string, role: string) => {
    try {
      await updateUserRole(userId, role);
      message.success(t.superAdmin.roleUpdated);
      load();
    } catch {
      message.error(t.superAdmin.saveUserError);
    }
  };

  const columns = [
    {
      title: t.superAdmin.userEmail,
      dataIndex: 'email',
      key: 'email',
      render: (email: string, record: CompanyUserDto) => (
        <div>
          <div style={{ color: 'var(--text-primary)' }}>{email}</div>
          {(record.firstName || record.lastName) && (
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              {[record.firstName, record.lastName].filter(Boolean).join(' ')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: t.auth.role,
      dataIndex: 'role',
      key: 'role',
      render: (role: string, record: CompanyUserDto) => (
        <Select
          value={role}
          size="small"
          style={{ width: 160 }}
          onChange={(v) => onRoleChange(record.id, v)}
          options={COMPANY_ROLES.map((r) => ({
            value: r,
            label: t.roles[r as keyof typeof t.roles] ?? r,
          }))}
        />
      ),
    },
    {
      title: t.common.status,
      key: 'status',
      render: (_: unknown, record: CompanyUserDto) => (
        <Space direction="vertical" size={2}>
          <Tag color={record.isActive ? 'green' : 'red'}>
            {record.isActive ? t.common.active : t.common.inactive}
          </Tag>
          {record.requirePasswordChange && (
            <Tag color="orange">{t.superAdmin.requiresPasswordChange}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: t.common.actions,
      key: 'actions',
      render: (_: unknown, record: CompanyUserDto) => (
        <Space>
          {record.isActive ? (
            <Popconfirm
              title={t.superAdmin.confirmDeactivate}
              onConfirm={() => onDeactivate(record.id)}
              okText={t.common.confirm}
              cancelText={t.common.cancel}
            >
              <Button size="small" danger>{t.common.deactivate}</Button>
            </Popconfirm>
          ) : (
            <Button size="small" onClick={() => onActivate(record.id)}>
              {t.common.activate}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/superadmin/companies')} />
          <div>
            <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{t.superAdmin.usersTitle}</h2>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>
              {t.superAdmin.usersSubtitle}
            </p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t.superAdmin.createUser}
        </Button>
      </div>

      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
      />

      <Modal
        open={modalOpen}
        title={t.superAdmin.createUser}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="email" label={t.auth.email} rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label={t.auth.password} rules={[{ required: true, min: 8 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="firstName" label={t.auth.firstName}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label={t.auth.lastName}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label={t.auth.role} rules={[{ required: true }]} initialValue="CompanyAdmin">
            <Select
              options={COMPANY_ROLES.map((r) => ({
                value: r,
                label: t.roles[r as keyof typeof t.roles] ?? r,
              }))}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>{t.common.cancel}</Button>
              <Button type="primary" htmlType="submit">{t.common.create}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
