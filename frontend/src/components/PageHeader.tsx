import { Typography } from 'antd';

interface Props {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: Props) {
  return (
    <div style={{ marginBottom: 24 }}>
      <Typography.Title level={3} style={{ margin: 0, color: '#389e0d' }}>
        {title}
      </Typography.Title>
      {subtitle && (
        <Typography.Text type="secondary">{subtitle}</Typography.Text>
      )}
    </div>
  );
}
