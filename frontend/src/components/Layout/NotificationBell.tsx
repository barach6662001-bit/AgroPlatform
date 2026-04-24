import { useEffect, useState, type KeyboardEvent } from 'react';
import { Badge, Button, Popover, List, Typography, Space, Tag, Empty, message } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNotificationStore } from '../../hooks/useNotifications';
import { useTranslation } from '../../i18n';
import type { Notification, NotificationType } from '../../hooks/useNotifications';
import s from './NotificationBell.module.css';
import {
  getNotifications,
  markAllNotificationsRead,
  clearReadNotifications,
  markNotificationRead,
} from '../../api/notifications';

const typeColor: Record<NotificationType, string> = {
  info: 'var(--info)',
  warning: 'var(--warning)',
  error: 'var(--error)',
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

// Sync backend notifications into the local store
function useBackendNotifications(open: boolean) {
  const { addNotification, notifications } = useNotificationStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    getNotifications({ pageSize: 50 })
      .then((items) => {
        items.forEach((n) => {
          // Only add if not already present (by backend id stored in local)
          const exists = notifications.find((local) => local.id === n.id);
          if (!exists) {
            addNotification({
              id: n.id,
              type: n.type as NotificationType,
              message: `${n.title}: ${n.body}`,
              timestamp: n.createdAtUtc,
              read: n.isRead,
            });
          }
        });
      })
      .catch(() => message.error(t.notifications.loadError));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}

export default function NotificationBell() {
  const { t } = useTranslation();
  const { notifications, markAllRead, clearAll, markAsRead, getUnreadCount } = useNotificationStore();
  const [open, setOpen] = useState(false);

  useBackendNotifications(open);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      markAllRead();
    } catch {
      message.error(t.notifications.markReadError);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearReadNotifications();
      clearAll();
    } catch {
      // ignore
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      markAsRead(id);
    } catch {
      markAsRead(id);
    }
  };

  const unreadCount = getUnreadCount();
  const recentNotifications = notifications.slice(0, 20);

  const content = (
    <div className={s.block0}>
      <Space className={s.fullWidth}>
        <Typography.Text strong>{t.notifications.title}</Typography.Text>
        <Space>
          <Button size="small" type="link" onClick={handleMarkAllRead}>
            {t.notifications.markAllRead}
          </Button>
          <Button size="small" type="link" danger onClick={handleClearAll}>
            {t.notifications.clearAll}
          </Button>
        </Space>
      </Space>
      {recentNotifications.length === 0 ? (
        <Empty description={t.notifications.noNotifications} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          dataSource={recentNotifications}
          className={s.block2}
          renderItem={(item: Notification) => {
            // Phase 2h — keyboard accessibility for AntD List.Item
            // notifications inside the bell Popover. The visible row
            // is mouse-clickable (cursor:pointer + acknowledge-on-
            // click) but had no role / tabIndex / key handler /
            // accessible name. We mirror the click intent for
            // keyboard + AT users with the same pattern used in
            // Phases 2b–2g.
            const acknowledge = () => handleMarkRead(item.id);

            // Concise screen-reader summary mirroring the visible
            // row content (severity, relative time, read-state,
            // message). Read/unread is communicated via aria-label
            // text instead of aria-pressed because clicking a
            // read item is functionally a no-op (acknowledgement,
            // not a toggle).
            const stateLabel = item.read ? t.notifications.read : t.notifications.unread;
            const ariaLabel =
              `${item.type.toUpperCase()}, ${formatRelativeTime(item.timestamp)}, ` +
              `${stateLabel}: ${item.message}`;

            return (
              <List.Item
                className={s.item}
                style={{
                  padding: '8px 4px',
                  cursor: 'pointer',
                  opacity: item.read ? 0.6 : 1,
                  borderLeft: `3px solid ${typeColor[item.type]}`,
                  paddingLeft: 8,
                  marginBottom: 4,
                }}
                role="button"
                tabIndex={0}
                aria-label={ariaLabel}
                onClick={acknowledge}
                onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                  // AntD types <List.Item> as a HTMLDivElement
                  // even though it renders an <li> — match their
                  // signature to satisfy strict typing.
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    acknowledge();
                  }
                }}
              >
                <div className={s.fullWidth1}>
                  <Space className={s.fullWidth2}>
                    {/* Decorative — duplicated in aria-label */}
                    <Tag color={typeTagColor[item.type]} className={s.spaced} aria-hidden="true">
                      {item.type.toUpperCase()}
                    </Tag>
                    <Typography.Text type="secondary" className={s.text11} aria-hidden="true">
                      {formatRelativeTime(item.timestamp)}
                    </Typography.Text>
                  </Space>
                  <Typography.Text
                    className={s.text13}
                    strong={!item.read}
                  >
                    {item.message}
                  </Typography.Text>
                </div>
              </List.Item>
            );
          }}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      overlayStyle={{ width: 360 }}
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined className={s.text18} aria-hidden="true" />}
          className={s.padded}
          aria-label={t.notifications.title}
        />
      </Badge>
    </Popover>
  );
}
