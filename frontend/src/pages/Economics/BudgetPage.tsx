import { useEffect, useState } from 'react';
import { Table, InputNumber, Button, Select, message, Space, Tag, Progress } from 'antd';
import { SaveOutlined, DownloadOutlined } from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getBudgets, upsertBudget, exportBudgets, type BudgetDto } from '../../api/budgets';
import { getCostSummary, type CostSummaryDto } from '../../api/economics';
import PageHeader from '../../components/PageHeader';
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
  const [summary, setSummary] = useState<CostSummaryDto | null>(null);
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
      getCostSummary({ dateFrom: `${year}-01-01`, dateTo: `${year}-12-31` }),
    ])
      .then(([b, s]) => {
        setBudgets(b);
        setSummary(s);
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
      title: t.budget.fact,
      key: 'fact',
      render: (_: unknown, row: { category: string }) => {
        const factEntry = summary?.byCategory.find((c) => c.category === row.category);
        const fact = factEntry?.amount ?? 0;
        return <span style={{ color: fact > 0 ? '#E6EDF3' : '#8B949E' }}>{fact.toLocaleString()} UAH</span>;
      },
    },
    {
      title: t.budget.difference,
      key: 'difference',
      render: (_: unknown, row: { category: string }) => {
        const plan = pendingAmounts[row.category] ?? 0;
        const factEntry = summary?.byCategory.find((c) => c.category === row.category);
        const fact = factEntry?.amount ?? 0;
        if (!plan) return <span style={{ color: '#8B949E' }}>—</span>;
        const diff = plan - fact;
        return (
          <span style={{ color: diff >= 0 ? '#3fb950' : '#f85149', fontWeight: 500 }}>
            {diff >= 0 ? '+' : ''}{diff.toLocaleString()} UAH
          </span>
        );
      },
    },
    {
      title: t.budget.execution,
      key: 'execution',
      render: (_: unknown, row: { category: string }) => {
        const plan = pendingAmounts[row.category];
        const factEntry = summary?.byCategory.find((c) => c.category === row.category);
        const fact = factEntry?.amount ?? 0;
        if (!plan || plan === 0) return <span style={{ color: '#8B949E' }}>—</span>;
        const pct = (fact / plan) * 100;
        return <Tag color={pct > 100 ? 'error' : pct > 80 ? 'warning' : 'success'}>{pct.toFixed(1)}%</Tag>;
      },
    },
    {
      title: t.budget.progress,
      key: 'progress',
      width: 180,
      render: (_: unknown, row: { category: string }) => {
        const plan = pendingAmounts[row.category];
        const factEntry = summary?.byCategory.find((c) => c.category === row.category);
        const fact = factEntry?.amount ?? 0;
        if (!plan || plan === 0) return <span style={{ color: '#8B949E' }}>—</span>;
        const rawPct = (fact / plan) * 100;
        const displayPct = Math.min(rawPct, 100);
        const isOverBudget = rawPct > 100;
        const status = isOverBudget ? 'exception' : 'normal';
        const strokeColor = isOverBudget ? '#f85149' : rawPct > 80 ? '#faad14' : '#3fb950';
        return (
          <Progress
            percent={Number(displayPct.toFixed(1))}
            size="small"
            status={status}
            strokeColor={strokeColor}
            style={{ marginBottom: 0 }}
          />
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

  const chartData = CATEGORIES.map((cat) => {
    const plan = pendingAmounts[cat] ?? 0;
    const factEntry = summary?.byCategory.find((c) => c.category === cat);
    const fact = factEntry?.amount ?? 0;
    return {
      name: t.costCategories[cat as keyof typeof t.costCategories] ?? cat,
      plan,
      fact,
    };
  }).filter((d) => d.plan > 0 || d.fact > 0);

  return (
    <div>
      <PageHeader title={t.budget.title} subtitle={t.budget.subtitle} />
      <Space style={{ marginBottom: 16 }}>
        <span style={{ color: '#8B949E' }}>{t.budget.year}:</span>
        <Select value={year} onChange={setYear} options={YEAR_OPTIONS} style={{ width: 100 }} />
        <Button icon={<DownloadOutlined />} loading={exporting} onClick={handleExport}>
          {t.warehouses_export.exportCosts}
        </Button>
      </Space>
      <Table
        dataSource={tableData}
        columns={columns}
        rowKey="category"
        loading={loading}
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
      {chartData.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ color: '#E6EDF3', marginBottom: 16 }}>{t.budget.chartTitle}</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#8B949E', fontSize: 12 }}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fill: '#8B949E', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#161B22', border: '1px solid #30363D', color: '#E6EDF3' }}
                formatter={(value: number) => `${value.toLocaleString()} UAH`}
              />
              <Legend wrapperStyle={{ color: '#8B949E', paddingTop: 16 }} />
              <Bar dataKey="plan" name={t.budget.plannedAmount} fill="#388bfd" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fact" name={t.budget.fact} fill="#3fb950" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
