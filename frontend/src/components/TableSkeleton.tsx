import { Skeleton, Space } from 'antd';
import s from './TableSkeleton.module.css';

export default function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Space direction="vertical" className={s.fullWidth} size={8}>
      <Skeleton.Input active block className={s.bordered} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton.Input key={i} active block className={s.bordered1} />
      ))}
    </Space>
  );
}
