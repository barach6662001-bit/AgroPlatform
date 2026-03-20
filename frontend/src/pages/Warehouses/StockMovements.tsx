import EmptyState from '../../components/EmptyState';
import { useEffect, useState } from 'react';
import { Table, Select, DatePicker, message, Tag, Space } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import { getStockMovements, getWarehouses, getWarehouseItems } from '../../api/warehouses';
import type { StockMoveDto, WarehouseDto, WarehouseItemDto } from '../../types/warehouse';
import type { PaginatedResult } from '../../types/common';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { formatDate } from '../../utils/dateFormat';

const { RangePicker } = DatePicker;

const MOVE_TYPE_COLORS: Record<string, string> = {
  Receipt: 'green',
  Issue: 'red',
  Transfer: 'blue',
  Adjustment: 'orange',
};

export default function StockMovements() {
  const [result, setResult] = useState<PaginatedResult<StockMoveDto> | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [items, setItems] = useState<WarehouseItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [warehouseId, setWarehouseId] = useState<string | undefined>();
  const [itemId, setItemId] = useState<string | undefined>();
  const [moveType, setMoveType] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const { t } = useTranslation();

  useEffect(() => {
    getWarehouses({ pageSize: 100 })
      .then((r) => setWarehouses(r.items))
      .catch(() => {});
    getWarehouseItems({ pageSize: 500 })
      .then((r) => setItems(r.items))
      .catch(() => {});
  }, []);

  const load = (p = page) => {
    setLoading(true);
    getStockMovements({
      warehouseId,
      itemId,
      type: moveType,
      dateFrom: dateRange?.[0],
      dateTo: dateRange?.[1],
      page: p,
      pageSize,
    })
      .then(setResult)
      .catch(() => message.error(t.warehouses.moveLoadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, [warehouseId, itemId, moveType, dateRange]);
  useEffect(() => { load(page); }, [page]);

  const handleDateChange: RangePickerProps['onChange'] = (_, strs) => {
    setDateRange(strs[0] && strs[1] ? [strs[0], strs[1]] : null);
    setPage(1);
  };

  const moves = result?.items ?? [];

  const columns = [
    {
      title: t.warehouses.moveDate,
      dataIndex: 'date',
      key: 'date',
      render: (v: string) => formatDate(v),
      sorter: (a: StockMoveDto, b: StockMoveDto) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: t.warehouses.moveType,
      dataIndex: 'type',
      key: 'type',
      render: (v: string) => (
        <Tag color={MOVE_TYPE_COLORS[v] ?? 'default'}>
          {t.moveTypes[v as keyof typeof t.moveTypes] ?? v}
        </Tag>
      ),
    },
    {
      title: t.warehouses.moveWarehouse,
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
    {
      title: t.warehouses.moveName,
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: t.warehouses.moveQty,
      key: 'qty',
      render: (_: unknown, r: StockMoveDto) => `${r.quantity} ${r.unitCode}`,
    },
    {
      title: t.warehouses.moveNote,
      dataIndex: 'note',
      key: 'note',
      render: (v: string) => v || '—',
    },
    {
      title: t.warehouses.totalCost,
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (v?: number) => v != null ? `${v.toFixed(2)} UAH` : '—',
    },
  ];

  const moveTypeOptions = [
    { value: 'Receipt', label: t.moveTypes.Receipt },
    { value: 'Issue', label: t.moveTypes.Issue },
    { value: 'Transfer', label: t.moveTypes.Transfer },
    { value: 'Adjustment', label: t.moveTypes.Adjustment },
  ];

  return (
    <div>
      <PageHeader title={t.warehouses.movementsTitle} subtitle={t.warehouses.movementsSubtitle} />

      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          placeholder={t.warehouses.allWarehouses}
          allowClear
          style={{ width: 200 }}
          value={warehouseId}
          onChange={(v) => { setWarehouseId(v); setPage(1); }}
          options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
        />
        <Select
          placeholder={t.warehouses.allItems}
          allowClear
          style={{ width: 200 }}
          value={itemId}
          onChange={(v) => { setItemId(v); setPage(1); }}
          showSearch
          filterOption={(input, opt) =>
            (opt?.label as string)?.toLowerCase().includes(input.toLowerCase())
          }
          options={items.map((i) => ({ value: i.id, label: i.name }))}
        />
        <Select
          placeholder={t.warehouses.allTypes}
          allowClear
          style={{ width: 160 }}
          value={moveType}
          onChange={(v) => { setMoveType(v); setPage(1); }}
          options={moveTypeOptions}
        />
        <RangePicker onChange={handleDateChange} />
      </Space>

      <Table
        dataSource={moves}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: 800 }}
        pagination={{
          current: page,
          pageSize,
          total: result?.totalCount ?? 0,
          onChange: (p) => setPage(p),
        }}
        locale={{
          emptyText: <EmptyState
            message={t.warehouses.noMovements || 'Ще немає рухів товарів'}
          />,
        }}
      />
    </div>
  );
}
