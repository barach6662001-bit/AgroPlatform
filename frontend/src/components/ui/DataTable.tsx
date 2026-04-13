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

  const paginationConfig = rest.pagination === false
    ? false
    : {
        showSizeChanger: true,
        showTotal: (total: number, range: [number, number]) =>
          `Показано ${range[0]}-${range[1]} з ${total}`,
        pageSizeOptions: ['10', '20', '50'],
        ...(typeof rest.pagination === 'object' ? rest.pagination : {}),
      };

  return (
    <Table<T>
      loading={loading}
      className={`data-table ${rest.className || ''}`}
      size="middle"
      style={{
        ['--cell-padding' as string]: densityPadding[density],
        ...rest.style,
      }}
      {...rest}
      pagination={paginationConfig}
    />
  );
}
