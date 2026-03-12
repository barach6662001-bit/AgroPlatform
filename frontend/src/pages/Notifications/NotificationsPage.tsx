import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Checkbox, message } from 'antd';
import { InfoCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearReadNotifications,
  type NotificationDto,
} from '../../api/notifications';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const typeIcon = (type: string) => {
  if (type === 'warning') return <WarningOutlined style={{ color: '#faad14' }} />;
  if (type === 'error') return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
  return <InfoCircleOutlined style={{ color: '#1677ff' }} />;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { t } = useTranslation();

  const load = (unread = unreadOnly) => {
    setLoading(true);
    getNotifications({ unreadOnly: unread })
      .then(setNotifications)
      .catch(() => message.error(t.notifications.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [unreadOnly]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      load();
    } catch {
      message.error(t.notifications.markReadError);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      load();
    } catch {
      message.error(t.notifications.markReadError);
    }
  };

  const handleClearRead = async () => {
    try {
      await clearReadNotifications();
      load();
    } catch {
      message.error(t.notifications.loadError);
    }
  };

  const columns = [
    {
      title: '',
      key: 'icon',
      width: 40,
      render: (_: unknown, row: NotificationDto) => typeIcon(row.type),
    },
    {
      title: t.notifications.title,
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Body',
      dataIndex: 'body',
      key: 'body',
    },
    {
      title: 'Date',
      dataIndex: 'createdAtUtc',
      key: 'date',
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: unknown, row: NotificationDto) =>
        row.isRead ? <Tag color="default">Read</Tag> : <Tag color="blue">New</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, row: NotificationDto) => (
        <Button
          size="small"
          disabled={row.isRead}
          onClick={() => handleMarkRead(row.id)}
        >
          Mark as read
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t.notifications.title} />
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={handleMarkAllRead}>{t.notifications.markAllRead}</Button>
        <Button onClick={handleClearRead}>{t.notifications.clearAll}</Button>
        <Checkbox
          checked={unreadOnly}
          onChange={(e) => setUnreadOnly(e.target.checked)}
        >
          Тільки непрочитані
        </Checkbox>
      </Space>
      <Table
        dataSource={notifications}
        columns={columns}
        rowKey="id"
        loading={loading}
        locale={{ emptyText: t.notifications.noNotifications }}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
