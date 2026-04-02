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
    <div className={s.textCenter}>
      <InboxOutlined className={s.text40} />
      <div>
        <Text type="secondary">{message}</Text>
      </div>
      {actionLabel && onAction && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAction}
          className={s.spaced}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
