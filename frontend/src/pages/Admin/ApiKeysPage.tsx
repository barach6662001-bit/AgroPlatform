import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Space,
  Tag,
  Card,
  Alert,
} from 'antd';
import { PlusOutlined, CopyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getApiKeys, createApiKey, revokeApiKey, ApiKeyDto, CreateApiKeyResponse } from '../../api/apiKeys';
import DeleteConfirmButton from '../../components/DeleteConfirmButton';

export const ApiKeysPage: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeyDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [keyVisible, setKeyVisible] = useState(false);
  const [displayKey, setDisplayKey] = useState('');
  const [form] = Form.useForm();

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const data = await getApiKeys();
      setKeys(data);
    } catch (error) {
      message.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async (values: any) => {
    try {
      const result: CreateApiKeyResponse = await createApiKey({
        name: values.name,
        scopes: values.scopes?.join(',') || '',
        expiresAtUtc: values.expiresAtUtc ? values.expiresAtUtc.toISOString() : null,
        rateLimitPerHour: values.rateLimitPerHour,
        webhookUrl: values.webhookUrl,
        webhookEventTypes: values.webhookEventTypes?.join(',') || '',
      });

      setDisplayKey(result.key);
      setKeyVisible(true);
      message.success('API key created successfully');
      form.resetFields();
      setVisible(false);
      await fetchKeys();
    } catch (error) {
      message.error('Failed to create API key');
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await revokeApiKey(id);
      message.success('API key revoked');
      await fetchKeys();
    } catch (error) {
      message.error('Failed to revoke API key');
    }
  };

  const copyKeyToClipboard = () => {
    navigator.clipboard.writeText(displayKey);
    message.success('Key copied to clipboard');
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Scopes',
      dataIndex: 'scopes',
      key: 'scopes',
      render: (scopes: string) => (
        <div style={{ maxWidth: 200, overflow: 'auto' }}>
          {scopes.split(',').map((scope) => (
            <Tag key={scope} style={{ fontSize: '11px' }}>
              {scope.trim()}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Expires',
      dataIndex: 'expiresAtUtc',
      key: 'expiresAtUtc',
      render: (date: string | null) => (date ? dayjs(date).format('YYYY-MM-DD') : 'Never'),
    },
    {
      title: 'Last Used',
      dataIndex: 'lastUsedAtUtc',
      key: 'lastUsedAtUtc',
      render: (date: string | null) => (date ? dayjs(date).format('YYYY-MM-DD HH:mm') : 'Never'),
    },
    {
      title: 'Status',
      dataIndex: 'isRevoked',
      key: 'isRevoked',
      render: (revoked: boolean) =>
        revoked ? (
          <Tag color="red">Revoked</Tag>
        ) : (
          <Tag color="green">Active</Tag>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ApiKeyDto) => (
        <Space>
          <DeleteConfirmButton
            title="Revoke API Key"
            description="This action cannot be undone. The key will no longer work."
            onConfirm={() => handleRevoke(record.id)}
            iconOnly={false}
            buttonText="Revoke"
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="API Keys"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setVisible(true)}>
            Create Key
          </Button>
        }
      >
        <Alert
          message="Store your API key securely. You won't be able to see it again after closing this dialog."
          type="info"
          style={{ marginBottom: '16px' }}
        />
        <Table
          columns={columns}
          dataSource={keys}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create API Key Modal */}
      <Modal
        title="Create API Key"
        open={visible}
        onOk={() => form.submit()}
        onCancel={() => {
          setVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input placeholder="My Integration" />
          </Form.Item>

          <Form.Item
            label="Scopes"
            name="scopes"
            rules={[{ required: true, message: 'Please select at least one scope' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select scopes"
              options={[
                { label: 'read:operations', value: 'read:operations' },
                { label: 'write:operations', value: 'write:operations' },
                { label: 'read:costs', value: 'read:costs' },
                { label: 'write:costs', value: 'write:costs' },
                { label: 'read:fields', value: 'read:fields' },
                { label: 'write:fields', value: 'write:fields' },
              ]}
            />
          </Form.Item>

          <Form.Item label="Expires At" name="expiresAtUtc">
            <DatePicker />
          </Form.Item>

          <Form.Item label="Rate Limit (per hour)" name="rateLimitPerHour">
            <InputNumber min={1} placeholder="Unlimited if empty" />
          </Form.Item>

          <Form.Item label="Webhook URL" name="webhookUrl">
            <Input placeholder="https://example.com/webhook" />
          </Form.Item>

          <Form.Item label="Webhook Event Types" name="webhookEventTypes">
            <Select
              mode="multiple"
              placeholder="Select event types"
              options={[
                { label: 'operation.created', value: 'operation.created' },
                { label: 'operation.updated', value: 'operation.updated' },
                { label: 'cost.created', value: 'cost.created' },
                { label: 'cost.updated', value: 'cost.updated' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Display Key Modal */}
      <Modal
        title="API Key Created"
        open={keyVisible}
        onCancel={() => setKeyVisible(false)}
        footer={null}
        width={600}
      >
        <Alert
          message="Save this key securely. You won't see it again."
          type="warning"
          style={{ marginBottom: '16px' }}
        />
        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <code style={{ flex: 1, wordBreak: 'break-all' }}>{displayKey}</code>
            <Button icon={<CopyOutlined />} onClick={copyKeyToClipboard} />
          </div>
        </div>
        <Button type="primary" block onClick={() => setKeyVisible(false)}>
          Done
        </Button>
      </Modal>
    </div>
  );
};

export default ApiKeysPage;
