import { Button, Typography } from 'antd';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import s from './EmptyState.module.css';

const { Text } = Typography;

interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ message, icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className={s.wrapper}>
      <div className={s.iconBadge}>
        {icon ?? <InboxOutlined className={s.icon} />}
      </div>
      <div className={s.text}>
        <Text type="secondary">{message}</Text>
      </div>
      {actionLabel && onAction && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAction}
          className={s.action}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
