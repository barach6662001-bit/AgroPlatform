import { useEffect, useState } from 'react';
import { Table, InputNumber, Button, Select, message, Space, Tag, Row, Col, Card, Statistic } from 'antd';
import { SaveOutlined, DownloadOutlined, DollarOutlined, RiseOutlined, FallOutlined, PercentageOutlined } from '@ant-design/icons';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { getBudgets, upsertBudget, exportBudgets, getBudgetPlanVsFact, type BudgetDto, type BudgetPlanVsFactDto } from '../../api/budgets';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';

const CATEGORIES = ['Seeds', 'Fertilizers', 'Pesticides', 'Fuel', 'Labor', 'Equipment', 'Other'];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const y = currentYear - 2 + i;
  return { value: y, label: String(y) };
});

export default function BudgetPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [budgets, setBudgets] = useState<BudgetDto[]>([]);
  const [planVsFact, setPlanVsFact] = useState<BudgetPlanVsFactDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [exporting, setExporting] = useState(false);
  const [pendingAmounts, setPendingAmounts] = useState<Record<string, number | null>>({});
  const { t } = useTranslation();
  const { hasRole } = useRole();
  const canEdit = hasRole(['Administrator', 'Manager', 'Director']);

  const load = () => {
    setLoading(true);
    Promise.all([
      getBudgets(year),
      getBudgetPlanVsFact(year),
    ])
      .then(([b, pvf]) => {
        setBudgets(b);
        setPlanVsFact(pvf);
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

  const columns = [
    {
      title: t.budget.category,
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => (
        <Tag color="blue">{t.costCategories[cat as keyof typeof t.costCategories] ?? cat}</Tag>
      ),
    },
    {
      title: t.budget.plannedAmount,
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
      title: t.economics.plColFact,
      key: 'fact',
      render: (_: unknown, row: { category: string }) => {
        const factEntry = planVsFact.find((c) => c.category === row.category);
        const fact = factEntry?.factAmount ?? 0;
        return <span style={{ color: fact > 0 ? '#E6EDF3' : '#8B949E' }}>{fact.toLocaleString()} UAH</span>;
      },
    },
    {
      title: t.economics.plColExecution,
      key: 'execution',
      render: (_: unknown, row: { category: string }) => {
        const plan = pendingAmounts[row.category];
        const factEntry = planVsFact.find((c) => c.category === row.category);
        const fact = factEntry?.factAmount ?? 0;
        if (!plan || plan === 0) return <span style={{ color: '#8B949E' }}>—</span>;
        const pct = (fact / plan) * 100;
        return <Tag color={pct > 100 ? 'error' : pct > 80 ? 'warning' : 'success'}>{pct.toFixed(1)}%</Tag>;
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

  const totalPlanned = budgets.reduce((s, b) => s + b.plannedAmount, 0);
  const totalActual = planVsFact.reduce((s, p) => s + p.factAmount, 0);
  const totalVariance = totalPlanned - totalActual;
  const totalExecution = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

  const chartData = CATEGORIES.map((cat) => ({
    name: cat,
    planned: pendingAmounts[cat] ?? 0,
    actual: planVsFact.find((p) => p.category === cat)?.factAmount ?? 0,
  }));

  return (
    <div>
      <PageHeader
        title={t.budget.title}
        subtitle={t.budget.subtitle}
        breadcrumbs={<Breadcrumbs items={[{ label: t.nav.finance, path: '/economics' }, { label: t.nav.budget }]} />}
      />
      <Space style={{ marginBottom: 16 }}>
        <span style={{ color: '#8B949E' }}>{t.budget.year}:</span>
        <Select value={year} onChange={setYear} options={YEAR_OPTIONS} style={{ width: 100 }} />
        <Button icon={<DownloadOutlined />} loading={exporting} onClick={handleExport}>
          {t.warehouses_export.exportCosts}
        </Button>
      </Space>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t.economics.plTotalPlanned}
              value={totalPlanned}
              precision={0}
              prefix={<DollarOutlined />}
              suffix="UAH"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t.economics.plTotalActual}
              value={totalActual}
              precision={0}
              prefix={<RiseOutlined />}
              suffix="UAH"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t.economics.plVariance}
              value={totalVariance}
              precision={0}
              prefix={<FallOutlined />}
              suffix="UAH"
              valueStyle={{ color: totalVariance >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t.economics.plExecution}
              value={totalExecution}
              precision={1}
              prefix={<PercentageOutlined />}
              suffix="%"
              valueStyle={{ color: totalExecution > 100 ? '#cf1322' : totalExecution > 80 ? '#d4b106' : '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>
      <Table
        dataSource={tableData}
        columns={columns}
        rowKey="category"
        loading={loading}
        pagination={false}
        style={{ marginBottom: 24 }}
      />
      <Card title={t.economics.plChartTitle} style={{ marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="planned" name={t.economics.plColPlan} fill="#1890ff" />
            <Bar dataKey="actual" name={t.economics.plColFact} fill="#52c41a" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
