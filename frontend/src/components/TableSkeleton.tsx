import { Skeleton, Space } from 'antd';

export default function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Space direction="vertical" style={{ width: '100%', padding: '16px 0' }} size={8}>
      <Skeleton.Input active block style={{ height: 36, borderRadius: 6 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton.Input key={i} active block style={{ height: 44, borderRadius: 4 }} />
      ))}
    </Space>
  );
}
