import { useEffect, useState } from 'react';
import {
  Card, Col, Row, Progress, Tag, Table, Select, Switch, Alert, Space,
  Typography, Tooltip, Badge, Button, message,
} from 'antd';
import {
  WarningOutlined, CheckCircleOutlined, DatabaseOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { getGrainStorageOverview } from '../../api/grain';
import type { GrainStorageOverviewDto, GrainBatchSummaryDto } from '../../types/grain';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { useTranslation } from '../../i18n';
import s from './GrainStorageOverview.module.css';

const { Text } = Typography;

function occupancyColor(pct: number): string {
  if (pct >= 90) return 'var(--error)';
  if (pct >= 70) return 'var(--warning)';
  return 'var(--success)';
}

function ownershipLabel(t: ReturnType<typeof useTranslation>['t'], value: number): string {
  const map: Record<number, string> = {
    0: t.grainStorages.ownershipOwn,
    1: t.grainStorages.ownershipConsignment,
    2: t.grainStorages.ownershipStorage,
    3: t.grainStorages.ownershipOther,
  };
  return map[value] ?? String(value);
}

function batchColumns(t: ReturnType<typeof useTranslation>['t']): ColumnsType<GrainBatchSummaryDto> {
  return [
    {
      title: t.grainStorages.grainTypes,
      dataIndex: 'grainType',
      key: 'grainType',
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: t.grainStorages.initialQty,
      dataIndex: 'initialQuantityTons',
      key: 'initialQuantityTons',
      align: 'right',
      render: (v: number) => `${v.toFixed(2)} т`,
    },
    {
      title: t.grainStorages.remainingQty,
      dataIndex: 'quantityTons',
      key: 'quantityTons',
      align: 'right',
      render: (v: number) => (
        <Text strong style={{ color: v > 0 ? 'var(--text-primary)' : 'var(--text-disabled)' }}>
          {v.toFixed(2)} т
        </Text>
      ),
    },
    {
      title: t.grain.ownershipType,
      dataIndex: 'ownershipType',
      key: 'ownershipType',
      render: (v: number) => ownershipLabel(t, v),
    },
    {
      title: t.grainStorages.moisture,
      dataIndex: 'moisturePercent',
      key: 'moisturePercent',
      align: 'right',
      render: (v?: number) => {
        if (v == null) return '—';
        const high = v > 15;
        return (
          <Text style={{ color: high ? 'var(--warning)' : undefined }}>
            {v.toFixed(1)}%{high && <WarningOutlined className={s.spaced} />}
          </Text>
        );
      },
    },
    {
      title: t.grainStorages.sourceField,
      dataIndex: 'sourceFieldName',
      key: 'sourceFieldName',
      render: (v?: string) => v ?? '—',
    },
    {
      title: t.common.date,
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
  ];
}

export default function GrainStorageOverview() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [data, setData] = useState<GrainStorageOverviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOnly, setActiveOnly] = useState(false);
  const [selectedStorageId, setSelectedStorageId] = useState<string | undefined>(undefined);

  const load = async () => {
    setLoading(true);
    try {
      const result = await getGrainStorageOverview({
        activeOnly: activeOnly || undefined,
        storageId: selectedStorageId,
      });
      setData(result);
    } catch {
      message.error(t.grainStorages.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOnly, selectedStorageId]);

  // Build storage options for the filter dropdown (use all loaded or re-fetch — here we derive from current data or show whatever we have)
  const storageOptions = data.map(s => ({ value: s.id, label: s.name }));

  const totalOccupied = data.reduce((sum, s) => sum + s.occupiedTons, 0);
  const totalCapacity = data.reduce((sum, s) => sum + (s.capacityTons ?? 0), 0);
  const totalBatches = data.reduce((sum, s) => sum + s.batchCount, 0);
  const storagesWithWarnings = data.filter(s => s.warnings.length > 0).length;

  return (
    <div>
      <PageHeader
        title={t.grainStorages.overviewTitle}
        subtitle={t.grainStorages.overviewSubtitle}
        breadcrumbs={<Breadcrumbs items={[{ label: t.nav.storageLogistics, path: '/warehouses' }, { label: t.nav.grainOverview }]} />}
        actions={
          <Space>
            <Switch
              checked={activeOnly}
              onChange={setActiveOnly}
              checkedChildren={t.grainStorages.filterActiveOnly}
              unCheckedChildren={t.grainStorages.filterActiveOnly}
            />
            <Select
              allowClear
              placeholder={t.grainStorages.filterAllStorages}
              className={s.block3}
              options={storageOptions}
              value={selectedStorageId}
              onChange={setSelectedStorageId}
            />
          </Space>
        }
      />

      {/* Summary KPI row */}
      <Row gutter={[16, 16]} className={s.spaced1}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Text type="secondary" className={s.text12}>{t.grainStorages.occupied}</Text>
            <div className={s.text22}>
              {totalOccupied.toFixed(1)} т
            </div>
            {totalCapacity > 0 && (
              <Text type="secondary" className={s.text11}>
                / {totalCapacity.toFixed(1)} т {t.grainStorages.capacity}
              </Text>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Text type="secondary" className={s.text12}>{t.grainStorages.batches}</Text>
            <div className={s.text22}>{totalBatches}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Text type="secondary" className={s.text12}>{t.grainStorages.title}</Text>
            <div className={s.text22}>{data.length}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Text type="secondary" className={s.text12}>{t.grainStorages.warningsTitle}</Text>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: storagesWithWarnings > 0 ? 'var(--warning)' : 'var(--success)' }}>
              {storagesWithWarnings > 0 ? (
                <><WarningOutlined className={s.spaced2} />{storagesWithWarnings}</>
              ) : (
                <><CheckCircleOutlined className={s.spaced2} />0</>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Per-storage cards */}
      {!loading && data.length === 0 && (
        <Card>
          <div className={s.textCenter}>
            <DatabaseOutlined className={s.text40} />
            <div>{t.grainStorages.noStorages}</div>
          </div>
        </Card>
      )}

      <Row gutter={[16, 16]}>
        {data.map(storage => {
          const pct = storage.occupancyPercent ?? 0;
          const color = storage.capacityTons ? occupancyColor(pct) : 'var(--info)';

          return (
            <Col xs={24} key={storage.id}>
              <Card
                loading={loading}
                styles={{ body: { padding: '16px 20px' } }}
                title={
                  <Space>
                    <span className={s.bold}>{storage.name}</span>
                    {storage.code && <Tag>{storage.code}</Tag>}
                    {storage.storageType && <Tag color="geekblue">{storage.storageType}</Tag>}
                    <Badge
                      status={storage.isActive ? 'success' : 'default'}
                      text={storage.isActive ? t.common.active : t.common.inactive}
                    />
                  </Space>
                }
                extra={
                  <Button
                    type="link"
                    size="small"
                    icon={<ArrowRightOutlined />}
                    onClick={() => navigate(`/grain?storageId=${storage.id}`)}
                  >
                    {t.grainStorages.goToBatches}
                  </Button>
                }
              >
                {/* Warnings */}
                {storage.warnings.length > 0 && (
                  <div className={s.spaced3}>
                    {storage.warnings.map((w, i) => (
                      <Alert
                        key={i}
                        type="warning"
                        showIcon
                        message={w}
                        className={s.spaced4}
                      />
                    ))}
                  </div>
                )}

                {/* Occupancy + stats */}
                <Row gutter={[24, 16]} className={s.spaced5}>
                  <Col xs={24} md={8}>
                    {storage.capacityTons ? (
                      <>
                        <div className={s.text121}>
                          {t.grainStorages.occupancy}
                        </div>
                        <Tooltip title={`${storage.occupiedTons.toFixed(2)} / ${storage.capacityTons.toFixed(2)} т`}>
                          <Progress
                            percent={Math.min(100, Number(pct.toFixed(1)))}
                            strokeColor={color}
                            format={p => `${p}%`}
                          />
                        </Tooltip>
                        <Space className={s.spaced6}>
                          <Text className={s.text12}>
                            {t.grainStorages.occupied}: <strong>{storage.occupiedTons.toFixed(2)} т</strong>
                          </Text>
                          <Text className={s.text12}>
                            {t.grainStorages.free}: <strong>{(storage.freeTons ?? 0).toFixed(2)} т</strong>
                          </Text>
                        </Space>
                      </>
                    ) : (
                      <>
                        <div className={s.text121}>
                          {t.grainStorages.occupied}
                        </div>
                        <div className={s.text20}>
                          {storage.occupiedTons.toFixed(2)} т
                        </div>
                        <Text type="secondary" className={s.text11}>{t.grainStorages.noCapacity}</Text>
                      </>
                    )}
                  </Col>

                  <Col xs={24} md={8}>
                    <div className={s.text122}>
                      {t.grainStorages.grainTypes}
                    </div>
                    {storage.grainTypes.length > 0 ? (
                      <Space wrap>
                        {storage.grainTypes.map(gt => (
                          <Tag key={gt} color="green">{gt}</Tag>
                        ))}
                      </Space>
                    ) : (
                      <Text type="secondary">—</Text>
                    )}
                  </Col>

                  <Col xs={24} md={8}>
                    <div className={s.text121}>
                      {t.grainStorages.batchesInStorage}
                    </div>
                    <div className={s.text20}>
                      {storage.batchCount}
                    </div>
                    {storage.location && (
                      <Text type="secondary" className={s.text11}>{storage.location}</Text>
                    )}
                  </Col>
                </Row>

                {/* Batch table */}
                {storage.batches.length > 0 && (
                  <Table<GrainBatchSummaryDto>
                    dataSource={storage.batches}
                    columns={batchColumns(t)}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    className={s.spaced7}
                  />
                )}

                {storage.batches.length === 0 && (
                  <div className={s.text123}>
                    {t.grainStorages.noBatches}
                  </div>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
