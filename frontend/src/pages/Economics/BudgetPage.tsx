import { useEffect, useState } from 'react';
import { Table, InputNumber, Button, Select, message, Space, Tag, Card, Row, Col, Statistic } from 'antd';
import { SaveOutlined, DownloadOutlined, RiseOutlined, FallOutlined, PercentageOutlined, DollarOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getBudgets, getBudgetPlanVsFact, upsertBudget, exportBudgets, type BudgetDto, type BudgetPlanVsFactDto } from '../../api/budgets';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';

const CATEGORIES = ['Seeds', 'Fertilizers', 'Pesticides', 'Fuel', 'Labor', 'Equipment', 'Other'];

const CARD_BG = '#161B22';
const CARD_BORDER = '#30363D';
const CARD_TEXT = '#E6EDF3';
const SECONDARY_TEXT = '#8B949E';
const SUCCESS_COLOR = '#3FB950';
const DANGER_COLOR = '#F85149';
const WARNING_COLOR = '#d4a574';
const PLAN_COLOR = '#1F6FEB';
const FACT_COLOR = '#3FB950';

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const y = currentYear - 2 + i;
  return { value: y, label: String(y) };
});

const fmt = (v: number) => v.toLocaleString('uk-UA', { maximumFractionDigits: 0 });

export default function BudgetPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [budgets, setBudgets] = useState<BudgetDto[]>([]);
  const [pvf, setPvf] = useState<BudgetPlanVsFactDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [exporting, setExporting] = useState(false);
  const [pendingAmounts, setPendingAmounts] = useState<Record<string, number | null>>({});
  const { t } = useTranslation();
  const { hasRole } = useRole();
  const canEdit = hasRole(['Administrator', 'Manager', 'Director']);

  const load = () => {
    setLoading(true);
    Promise.all([getBudgets(year), getBudgetPlanVsFact(year)])
      .then(([b, p]) => {
        setBudgets(b);
        setPvf(p);
        const amounts: Record<string, number | null> = {};
        b.forEach((bd) => { amounts[bd.category] = bd.plannedAmount; });
        setPendingAmounts(amounts);
      })
      .catch(() => message.error(t.budget.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [year]);

  const handleSave = async (category: string) => {
    const amount = pendingAmounts[category];
    if (amount == null || amount < 0) return;
    setSaving((p) => ({ ...p, [category]: true }));
    try {
      await upsertBudget({ year, category, plannedAmount: amount });
      message.success(t.budget.saveSuccess);
      load();
    } catch {
      message.error(t.budget.saveError);
    } finally {
      setSaving((p) => ({ ...p, [category]: false }));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const resp = await exportBudgets(year);
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `budgets-${year}-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error(t.budget.loadError);
    } finally {
      setExporting(false);
    }
  };

  const execPct = pvf?.overallExecutionPercent ?? 0;
  const execColor = execPct > 100 ? DANGER_COLOR : execPct > 80 ? WARNING_COLOR : SUCCESS_COLOR;

  const chartData = (pvf?.rows ?? [])
    .filter((r) => r.planned > 0 || r.actual > 0)
    .map((r) => ({
      name: t.costCategories[r.category as keyof typeof t.costCategories] ?? r.category,
      [t.budget.chartPlan]: r.planned,
      [t.budget.chartFact]: r.actual,
    }));

  const pvfColumns = [
    {
      title: t.budget.category,
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => (
        <Tag color="blue">{t.costCategories[cat as keyof typeof t.costCategories] ?? cat}</Tag>
      ),
    },
    {
      title: t.budget.colPlan,
      key: 'planned',
      render: (_: unknown, row: { category: string }) => (
        <InputNumber
          min={0}
          step={1000}
          style={{ width: 160 }}
          value={pendingAmounts[row.category] ?? undefined}
          onChange={(v) => setPendingAmounts((p) => ({ ...p, [row.category]: v }))}
          disabled={!canEdit}
          formatter={(v) => (v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '')}
          addonAfter="UAH"
        />
      ),
    },
    {
      title: t.budget.colFact,
      key: 'actual',
      render: (_: unknown, row: { category: string }) => {
        const r = pvf?.rows.find((x) => x.category === row.category);
        const val = r?.actual ?? 0;
        return <span style={{ color: val > 0 ? CARD_TEXT : SECONDARY_TEXT }}>{fmt(val)} UAH</span>;
      },
    },
    {
      title: t.budget.colVariance,
      key: 'variance',
      render: (_: unknown, row: { category: string }) => {
        const r = pvf?.rows.find((x) => x.category === row.category);
        if (!r || r.planned === 0) return <span style={{ color: SECONDARY_TEXT }}>—</span>;
        const color = r.variance >= 0 ? SUCCESS_COLOR : DANGER_COLOR;
        return <span style={{ color }}>{r.variance >= 0 ? '+' : ''}{fmt(r.variance)} UAH</span>;
      },
    },
    {
      title: t.budget.colExecution,
      key: 'execution',
      render: (_: unknown, row: { category: string }) => {
        const r = pvf?.rows.find((x) => x.category === row.category);
        if (!r || r.planned === 0) return <span style={{ color: SECONDARY_TEXT }}>—</span>;
        const pct = r.executionPercent;
        return (
          <Tag color={pct > 100 ? 'error' : pct > 80 ? 'warning' : 'success'}>
            {pct.toFixed(1)}%
          </Tag>
        );
      },
    },
    {
      title: t.common.actions,
      key: 'actions',
      render: (_: unknown, row: { category: string }) => {
        const existing = budgets.find((b) => b.category === row.category);
        const changed = pendingAmounts[row.category] !== (existing?.plannedAmount ?? null);
        return canEdit ? (
          <Button
            size="small"
            type="primary"
            icon={<SaveOutlined />}
            loading={saving[row.category]}
            disabled={!changed || pendingAmounts[row.category] == null}
            onClick={() => handleSave(row.category)}
          >
            {t.common.save}
          </Button>
        ) : null;
      },
    },
  ];

  const tableData = CATEGORIES.map((cat) => ({ category: cat, key: cat }));

  const kpiCardStyle = {
    background: CARD_BG,
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: 8,
  };

  return (
    <div>
      <PageHeader title={t.budget.pvfTitle} subtitle={t.budget.pvfSubtitle} />

      <Space style={{ marginBottom: 16 }}>
        <span style={{ color: SECONDARY_TEXT }}>{t.budget.year}:</span>
        <Select value={year} onChange={setYear} options={YEAR_OPTIONS} style={{ width: 100 }} />
        <Button icon={<DownloadOutlined />} loading={exporting} onClick={handleExport}>
          {t.warehouses_export.exportCosts}
        </Button>
      </Space>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={kpiCardStyle}>
            <Statistic
              title={<span style={{ color: SECONDARY_TEXT }}>{t.budget.kpiTotalPlanned}</span>}
              value={pvf?.totalPlanned ?? 0}
              suffix="UAH"
              formatter={(v) => fmt(Number(v))}
              valueStyle={{ color: CARD_TEXT }}
              prefix={<DollarOutlined style={{ color: PLAN_COLOR }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={kpiCardStyle}>
            <Statistic
              title={<span style={{ color: SECONDARY_TEXT }}>{t.budget.kpiTotalActual}</span>}
              value={pvf?.totalActual ?? 0}
              suffix="UAH"
              formatter={(v) => fmt(Number(v))}
              valueStyle={{ color: CARD_TEXT }}
              prefix={<RiseOutlined style={{ color: FACT_COLOR }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={kpiCardStyle}>
            <Statistic
              title={<span style={{ color: SECONDARY_TEXT }}>{t.budget.kpiVariance}</span>}
              value={pvf?.totalVariance ?? 0}
              suffix="UAH"
              formatter={(v) => fmt(Number(v))}
              valueStyle={{ color: (pvf?.totalVariance ?? 0) >= 0 ? SUCCESS_COLOR : DANGER_COLOR }}
              prefix={(pvf?.totalVariance ?? 0) >= 0
                ? <RiseOutlined style={{ color: SUCCESS_COLOR }} />
                : <FallOutlined style={{ color: DANGER_COLOR }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={kpiCardStyle}>
            <Statistic
              title={<span style={{ color: SECONDARY_TEXT }}>{t.budget.kpiExecution}</span>}
              value={execPct}
              suffix="%"
              precision={1}
              valueStyle={{ color: execColor }}
              prefix={<PercentageOutlined style={{ color: execColor }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Bar Chart */}
      <Card
        title={<span style={{ color: CARD_TEXT }}>{t.budget.chartTitle}</span>}
        style={{ ...kpiCardStyle, marginBottom: 24 }}
      >
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CARD_BORDER} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: SECONDARY_TEXT }} />
              <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 12, fill: SECONDARY_TEXT }} />
              <Tooltip
                formatter={(v: number) => `${fmt(v)} UAH`}
                contentStyle={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, color: CARD_TEXT }}
              />
              <Legend wrapperStyle={{ color: CARD_TEXT }} />
              <Bar dataKey={t.budget.chartPlan} fill={PLAN_COLOR} radius={[3, 3, 0, 0]} />
              <Bar dataKey={t.budget.chartFact} fill={FACT_COLOR} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <span style={{ color: SECONDARY_TEXT }}>{t.budget.noChartData}</span>
        )}
      </Card>

      {/* Plan/Fact Table with editable planned amounts */}
      <Card style={kpiCardStyle}>
        <Table
          dataSource={tableData}
          columns={pvfColumns}
          rowKey="category"
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
}
