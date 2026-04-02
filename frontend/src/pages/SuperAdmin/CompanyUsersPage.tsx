import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import s from './CompanyUsersPage.module.css';
import {
  getCompanyUsers,
  createUser,
  deactivateUser,
  activateUser,
  updateUserRole,
  deleteUser,
  resetUserPassword,
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
  const [resetModalUserId, setResetModalUserId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [resetForm] = Form.useForm();

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

  const onDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      message.success(t.superAdmin.userDeleted);
      load();
    } catch {
      message.error(t.superAdmin.deleteError);
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

  const onResetPassword = async (values: { newPassword: string }) => {
    if (!resetModalUserId) return;
    try {
      await resetUserPassword(resetModalUserId, values.newPassword);
      message.success(t.superAdmin.resetPasswordSuccess);
      setResetModalUserId(null);
      resetForm.resetFields();
      load();
    } catch {
      message.error(t.superAdmin.resetPasswordError);
    }
  };

  const columns = [
    {
      title: t.superAdmin.userEmail,
      dataIndex: 'email',
      key: 'email',
      render: (email: string, record: CompanyUserDto) => (
        <div>
          <div className={s.colored}>{email}</div>
          {(record.firstName || record.lastName) && (
            <div className={s.text12}>
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
          className={s.block2}
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
          <Button size="small" onClick={() => { setResetModalUserId(record.id); resetForm.resetFields(); }}>
            {t.superAdmin.resetPassword}
          </Button>
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
          <Popconfirm
            title={t.superAdmin.deleteUserConfirm}
            onConfirm={() => onDeleteUser(record.id)}
            okText={t.common.confirm}
            cancelText={t.common.cancel}
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger>{t.superAdmin.deleteUser}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className={s.padded}>
      <div className={s.flex_center_between}>
        <div className={s.flex_center}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/superadmin/companies')} />
          <div>
            <h2 className={s.spaced}>{t.superAdmin.usersTitle}</h2>
            <p className={s.text13}>
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
        <Form form={form} layout="vertical" onFinish={onSubmit} className={s.spaced1}>
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
          <Form.Item className={s.textRight}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>{t.common.cancel}</Button>
              <Button type="primary" htmlType="submit">{t.common.create}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={!!resetModalUserId}
        title={t.superAdmin.resetPassword}
        onCancel={() => { setResetModalUserId(null); resetForm.resetFields(); }}
        footer={null}
        destroyOnClose
      >
        <Form form={resetForm} layout="vertical" onFinish={onResetPassword}>
          <Form.Item
            name="newPassword"
            label={t.superAdmin.newPassword}
            rules={[{ required: true, min: 8, message: t.superAdmin.enterNewPassword }]}
          >
            <Input.Password placeholder={t.superAdmin.enterNewPassword} />
          </Form.Item>
          <Form.Item className={s.textRight}>
            <Space>
              <Button onClick={() => { setResetModalUserId(null); resetForm.resetFields(); }}>{t.common.cancel}</Button>
              <Button type="primary" htmlType="submit">{t.superAdmin.resetPassword}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
