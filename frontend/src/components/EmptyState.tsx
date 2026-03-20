import { Button, Typography } from 'antd';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <InboxOutlined style={{ fontSize: 40, color: 'var(--agro-text-secondary)', marginBottom: 12 }} />
      <div>
        <Text type="secondary">{message}</Text>
      </div>
      {actionLabel && onAction && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAction}
          style={{ marginTop: 12 }}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
