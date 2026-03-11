import { Badge, Button, Popover, List, Typography, Space, Tag, Empty } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNotificationStore } from '../../hooks/useNotifications';
import { useTranslation } from '../../i18n';
import type { Notification, NotificationType } from '../../hooks/useNotifications';

const typeColor: Record<NotificationType, string> = {
  info: '#1677ff',
  warning: '#faad14',
  error: '#ff4d4f',
};

const typeTagColor: Record<NotificationType, string> = {
  info: 'blue',
  warning: 'orange',
  error: 'red',
};

function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '<1 min';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function NotificationBell() {
  const { t } = useTranslation();
  const { notifications, markAllRead, clearAll, markAsRead, getUnreadCount } = useNotificationStore();

  const unreadCount = getUnreadCount();
  const recentNotifications = notifications.slice(0, 20);

  const content = (
    <div style={{ width: 340 }}>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }}>
        <Typography.Text strong>{t.notifications.title}</Typography.Text>
        <Space>
          <Button size="small" type="link" onClick={markAllRead}>
            {t.notifications.markAllRead}
          </Button>
          <Button size="small" type="link" danger onClick={clearAll}>
            {t.notifications.clearAll}
          </Button>
        </Space>
      </Space>
      {recentNotifications.length === 0 ? (
        <Empty description={t.notifications.noNotifications} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          dataSource={recentNotifications}
          style={{ maxHeight: 400, overflowY: 'auto' }}
          renderItem={(item: Notification) => (
            <List.Item
              style={{
                padding: '8px 4px',
                cursor: 'pointer',
                opacity: item.read ? 0.6 : 1,
                borderLeft: `3px solid ${typeColor[item.type]}`,
                paddingLeft: 8,
                marginBottom: 4,
              }}
              onClick={() => markAsRead(item.id)}
            >
              <div style={{ width: '100%' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Tag color={typeTagColor[item.type]} style={{ margin: 0 }}>
                    {item.type.toUpperCase()}
                  </Tag>
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    {formatRelativeTime(item.timestamp)}
                  </Typography.Text>
                </Space>
                <Typography.Text
                  style={{ display: 'block', marginTop: 4, fontSize: 13 }}
                  strong={!item.read}
                >
                  {item.message}
                </Typography.Text>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      overlayStyle={{ width: 360 }}
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18, color: '#E6EDF3' }} />}
          style={{ padding: '4px 8px' }}
        />
      </Badge>
    </Popover>
  );
}
