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
      title: t.notifications.titleColumn,
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t.notifications.bodyColumn,
      dataIndex: 'body',
      key: 'body',
    },
    {
      title: t.notifications.dateColumn,
      dataIndex: 'createdAtUtc',
      key: 'date',
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      title: t.notifications.statusColumn,
      key: 'status',
      render: (_: unknown, row: NotificationDto) =>
        row.isRead ? <Tag color="default">{t.notifications.statusRead}</Tag> : <Tag color="blue">{t.notifications.statusNew}</Tag>,
    },
    {
      title: t.common.actions,
      key: 'actions',
      render: (_: unknown, row: NotificationDto) => (
        <Button
          size="small"
          disabled={row.isRead}
          onClick={() => handleMarkRead(row.id)}
        >
          {t.notifications.markAsRead}
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
        scroll={{ x: 800 }}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
