import { Table } from 'antd';
import type { TableProps } from 'antd';
import TableSkeleton from '../TableSkeleton';

type Density = 'compact' | 'default' | 'comfortable';

interface DataTableProps<T> extends TableProps<T> {
  density?: Density;
}

const densityPadding: Record<Density, string> = {
  compact: '6px 12px',
  default: '10px 16px',
  comfortable: '14px 16px',
};

export default function DataTable<T extends object>({
  density = 'default',
  loading,
  ...rest
}: DataTableProps<T>) {
  if (loading && !rest.dataSource?.length) {
    return <TableSkeleton rows={rest.pagination ? 10 : 5} />;
  }

  return (
    <Table<T>
      loading={loading}
      style={{
        ['--cell-padding' as string]: densityPadding[density],
      }}
      {...rest}
    />
  );
}
