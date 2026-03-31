import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import {
  getCompanies,
  createCompany,
  updateCompany,
  deactivateCompany,
  type CompanyDto,
  type CreateCompanyRequest,
} from '../../api/companies';

export default function CompaniesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CompanyDto | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      setCompanies(await getCompanies());
    } catch {
      message.error(t.superAdmin.loadCompaniesError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (company: CompanyDto) => {
    setEditing(company);
    form.setFieldsValue(company);
    setModalOpen(true);
  };

  const onSubmit = async (values: CreateCompanyRequest) => {
    try {
      if (editing) {
        await updateCompany(editing.id, values);
        message.success(t.superAdmin.companyUpdated);
      } else {
        await createCompany(values);
        message.success(t.superAdmin.companyCreated);
      }
      setModalOpen(false);
      load();
    } catch {
      message.error(t.superAdmin.saveCompanyError);
    }
  };

  const onDeactivate = async (id: string) => {
    try {
      await deactivateCompany(id);
      message.success(t.superAdmin.companyDeactivated);
      load();
    } catch {
      message.error(t.superAdmin.deactivateError);
    }
  };

  const columns = [
    {
      title: t.superAdmin.companyName,
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: CompanyDto) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
          {record.companyName && (
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{record.companyName}</div>
          )}
        </div>
      ),
    },
    {
      title: t.superAdmin.edrpou,
      dataIndex: 'edrpou',
      key: 'edrpou',
      render: (v: string) => v || '—',
    },
    {
      title: t.superAdmin.userCount,
      dataIndex: 'userCount',
      key: 'userCount',
    },
    {
      title: t.common.status,
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v: boolean) => (
        <Tag color={v ? 'green' : 'red'}>
          {v ? t.common.active : t.common.inactive}
        </Tag>
      ),
    },
    {
      title: t.common.actions,
      key: 'actions',
      render: (_: unknown, record: CompanyDto) => (
        <Space>
          <Button
            icon={<TeamOutlined />}
            size="small"
            onClick={() => navigate(`/superadmin/companies/${record.id}/users`)}
          >
            {t.superAdmin.manageUsers}
          </Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          {record.isActive && (
            <Popconfirm
              title={t.superAdmin.confirmDeactivate}
              onConfirm={() => onDeactivate(record.id)}
              okText={t.common.confirm}
              cancelText={t.common.cancel}
            >
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{t.superAdmin.companiesTitle}</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>
            {t.superAdmin.companiesSubtitle}
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t.superAdmin.createCompany}
        </Button>
      </div>

      <Table
        dataSource={companies}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
      />

      <Modal
        open={modalOpen}
        title={editing ? t.superAdmin.editCompany : t.superAdmin.createCompany}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="name" label={t.superAdmin.companyName} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="companyName" label={t.superAdmin.legalName}>
            <Input />
          </Form.Item>
          <Form.Item name="edrpou" label={t.superAdmin.edrpou}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label={t.superAdmin.address}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label={t.superAdmin.phone}>
            <Input />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>{t.common.cancel}</Button>
              <Button type="primary" htmlType="submit">{t.common.save}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
