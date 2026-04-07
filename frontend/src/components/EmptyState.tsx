import { Button, Typography } from 'antd';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
import s from './EmptyState.module.css';

const { Text } = Typography;

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className={s.wrapper}>
      <div className={s.iconBadge}>
        <InboxOutlined className={s.icon} />
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
