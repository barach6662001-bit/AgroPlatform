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
import s from './NotificationsPage.module.css';

const typeIcon = (type: string) => {
  if (type === 'warning') return <WarningOutlined className={s.colored} />;
  if (type === 'error') return <CloseCircleOutlined className={s.colored1} />;
  return <InfoCircleOutlined className={s.colored2} />;
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
          className={s.spaced}
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
          className={s.spaced}
          type="success"
          showIcon
          message={t.notifications.pushEnabled}
        />
      )}
      {permissionState === 'denied' && (
        <Alert
          className={s.spaced}
          type="warning"
          showIcon
          message={t.notifications.pushDenied}
        />
      )}
      <Space className={s.spaced}>
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
