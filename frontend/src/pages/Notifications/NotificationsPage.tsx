import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Checkbox, Alert, message } from 'antd';
import { InfoCircleOutlined, WarningOutlined, CloseCircleOutlined, BellOutlined } from '@ant-design/icons';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearReadNotifications,
  type NotificationDto,
} from '../../api/notifications';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { usePushNotifications } from '../../hooks/usePushNotifications';

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
  const { permissionState, isRegistering, requestPermission } = usePushNotifications();

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
      {permissionState === 'default' && (
        <Alert
          style={{ marginBottom: 16 }}
          type="info"
          icon={<BellOutlined />}
          showIcon
          message={t.notifications.pushEnable}
          action={
            <Button size="small" loading={isRegistering} onClick={requestPermission}>
              {isRegistering ? t.notifications.pushRegistering : t.notifications.pushEnable}
            </Button>
          }
        />
      )}
      {permissionState === 'granted' && (
        <Alert
          style={{ marginBottom: 16 }}
          type="success"
          showIcon
          message={t.notifications.pushEnabled}
        />
      )}
      {permissionState === 'denied' && (
        <Alert
          style={{ marginBottom: 16 }}
          type="warning"
          showIcon
          message={t.notifications.pushDenied}
        />
      )}
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
