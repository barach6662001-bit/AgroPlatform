import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Select, InputNumber, message, Space, Empty, Spin, Divider } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, RiseOutlined, FundOutlined } from '@ant-design/icons';
import { getMarginality } from '../../api/economics';
import type { MarginalityItemDto } from '../../types/economics';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => {
  const y = 2020 + i;
  return { value: y, label: String(y) };
});

function marginColor(value: number): string {
  return value >= 0 ? '#3fb950' : '#f85149';
}

function MarginIcon({ value }: { value: number }) {
  return value >= 0
    ? <ArrowUpOutlined style={{ color: '#3fb950' }} />
    : <ArrowDownOutlined style={{ color: '#f85149' }} />;
}

export default function MarginalityDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState<MarginalityItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [pricePerTonne, setPricePerTonne] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    getMarginality({ year, estimatedPricePerTonne: pricePerTonne ?? undefined })
      .then(setData)
      .catch(() => message.error(t.marginality.loadError))
      .finally(() => setLoading(false));
  }, [year, pricePerTonne]);

  const totalActualMargin = data.reduce((s, d) => s + d.actualMargin, 0);
  const totalPlannedCosts = data.reduce((s, d) => s + d.plannedCosts, 0);
  const totalProjectedMargin = data
    .filter((d) => d.projectedMargin != null)
    .reduce((s, d) => s + (d.projectedMargin ?? 0), 0);

  return (
    <div>
      <PageHeader title={t.marginality.title} subtitle={t.marginality.subtitle} />

      {/* Filters */}
      <Space style={{ marginBottom: 24 }} wrap>
        <span style={{ color: '#8B949E' }}>{t.marginality.year}:</span>
        <Select
          value={year}
          onChange={setYear}
          options={YEAR_OPTIONS}
          style={{ width: 100 }}
        />
        <span style={{ color: '#8B949E' }}>{t.marginality.pricePerTonne}:</span>
        <InputNumber
          min={0}
          step={100}
          value={pricePerTonne}
          onChange={(v) => setPricePerTonne(v)}
          placeholder="UAH"
          style={{ width: 150 }}
        />
      </Space>

      {!pricePerTonne && (
        <div style={{ marginBottom: 16, color: '#8B949E', fontSize: 13 }}>
          ℹ️ {t.marginality.hintPrice}
        </div>
      )}

      {/* Summary cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card style={{ background: '#161B22', border: '1px solid #30363D' }}>
            <Statistic
              title={<span style={{ color: '#8B949E' }}>{t.marginality.totalActualMargin}</span>}
              value={totalActualMargin}
              suffix="UAH"
              valueStyle={{ color: marginColor(totalActualMargin) }}
              prefix={<DollarOutlined />}
              formatter={(v) => Number(v).toLocaleString()}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ background: '#161B22', border: '1px solid #30363D' }}>
            <Statistic
              title={<span style={{ color: '#8B949E' }}>{t.marginality.totalPlannedCosts}</span>}
              value={totalPlannedCosts}
              suffix="UAH"
              valueStyle={{ color: '#f85149' }}
              prefix={<FundOutlined />}
              formatter={(v) => Number(v).toLocaleString()}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ background: '#161B22', border: '1px solid #30363D' }}>
            <Statistic
              title={<span style={{ color: '#8B949E' }}>{t.marginality.totalProjectedMargin}</span>}
              value={pricePerTonne ? totalProjectedMargin : '—'}
              suffix={pricePerTonne ? 'UAH' : ''}
              valueStyle={{ color: pricePerTonne ? marginColor(totalProjectedMargin) : '#8B949E' }}
              prefix={<RiseOutlined />}
              formatter={(v) => typeof v === 'number' ? Number(v).toLocaleString() : String(v)}
            />
          </Card>
        </Col>
      </Row>

      {/* Per-crop cards */}
      <Spin spinning={loading}>
        {!loading && data.length === 0 ? (
          <Empty description={t.marginality.noData} />
        ) : (
          <Row gutter={[16, 16]}>
            {data.map((item) => (
              <Col xs={24} sm={12} lg={8} key={item.cropName}>
                <Card
                  title={
                    <span style={{ color: '#E6EDF3', fontWeight: 600 }}>
                      🌱 {item.cropName}
                    </span>
                  }
                  extra={
                    <span style={{ color: '#8B949E', fontSize: 12 }}>
                      {item.areaHa.toLocaleString()} {t.marginality.areaHa}
                    </span>
                  }
                  style={{ background: '#161B22', border: '1px solid #30363D' }}
                  styles={{ body: { paddingTop: 16 } }}
                >
                  {/* Actual */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: '#8B949E', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>
                      {t.marginality.actual}
                    </div>
                    <Row gutter={12}>
                      <Col span={12}>
                        <Statistic
                          title={<span style={{ color: '#8B949E', fontSize: 11 }}>{t.marginality.actualRevenue}</span>}
                          value={item.actualRevenue}
                          suffix="UAH"
                          valueStyle={{ color: '#3fb950', fontSize: 14 }}
                          formatter={(v) => Number(v).toLocaleString()}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title={<span style={{ color: '#8B949E', fontSize: 11 }}>{t.marginality.actualCosts}</span>}
                          value={item.actualCosts}
                          suffix="UAH"
                          valueStyle={{ color: '#f85149', fontSize: 14 }}
                          formatter={(v) => Number(v).toLocaleString()}
                        />
                      </Col>
                    </Row>
                    <div style={{ marginTop: 8 }}>
                      <Statistic
                        title={<span style={{ color: '#8B949E', fontSize: 11 }}>{t.marginality.actualMargin}</span>}
                        value={item.actualMargin}
                        suffix="UAH"
                        valueStyle={{ color: marginColor(item.actualMargin), fontSize: 16, fontWeight: 700 }}
                        prefix={<MarginIcon value={item.actualMargin} />}
                        formatter={(v) => Number(v).toLocaleString()}
                      />
                    </div>
                  </div>

                  <Divider style={{ borderColor: '#30363D', margin: '12px 0' }} />

                  {/* Planned */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: '#8B949E', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>
                      {t.marginality.planned}
                    </div>
                    <Row gutter={12}>
                      <Col span={12}>
                        <Statistic
                          title={<span style={{ color: '#8B949E', fontSize: 11 }}>{t.marginality.plannedCosts}</span>}
                          value={item.plannedCosts}
                          suffix="UAH"
                          valueStyle={{ color: '#f85149', fontSize: 14 }}
                          formatter={(v) => Number(v).toLocaleString()}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title={<span style={{ color: '#8B949E', fontSize: 11 }}>{t.marginality.plannedMargin}</span>}
                          value={item.plannedMargin}
                          suffix="UAH"
                          valueStyle={{ color: marginColor(item.plannedMargin), fontSize: 14 }}
                          formatter={(v) => Number(v).toLocaleString()}
                        />
                      </Col>
                    </Row>
                  </div>

                  {/* Projected */}
                  {pricePerTonne && (
                    <>
                      <Divider style={{ borderColor: '#30363D', margin: '12px 0' }} />
                      <div>
                        <div style={{ color: '#8B949E', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>
                          {t.marginality.projected}
                        </div>
                        {item.projectedRevenue != null ? (
                          <Row gutter={12}>
                            <Col span={12}>
                              <Statistic
                                title={<span style={{ color: '#8B949E', fontSize: 11 }}>{t.marginality.projectedRevenue}</span>}
                                value={item.projectedRevenue}
                                suffix="UAH"
                                valueStyle={{ color: '#58A6FF', fontSize: 14 }}
                                formatter={(v) => Number(v).toLocaleString()}
                              />
                            </Col>
                            <Col span={12}>
                              <Statistic
                                title={<span style={{ color: '#8B949E', fontSize: 11 }}>{t.marginality.projectedMargin}</span>}
                                value={item.projectedMargin ?? 0}
                                suffix="UAH"
                                valueStyle={{ color: marginColor(item.projectedMargin ?? 0), fontSize: 14 }}
                                formatter={(v) => Number(v).toLocaleString()}
                              />
                            </Col>
                          </Row>
                        ) : (
                          <span style={{ color: '#8B949E', fontSize: 12 }}>—</span>
                        )}
                      </div>
                    </>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
}
