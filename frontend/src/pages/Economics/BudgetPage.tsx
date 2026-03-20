import { useEffect, useState } from 'react';
import { Table, InputNumber, Button, Select, message, Space, Tag } from 'antd';
import { SaveOutlined, DownloadOutlined } from '@ant-design/icons';
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
      title: t.economics.plColFact,
      key: 'fact',
      render: (_: unknown, row: { category: string }) => {
        const factEntry = summary?.byCategory.find((c) => c.category === row.category);
        const fact = factEntry?.amount ?? 0;
        return <span style={{ color: fact > 0 ? '#E6EDF3' : '#8B949E' }}>{fact.toLocaleString()} UAH</span>;
      },
    },
    {
      title: t.economics.plColExecution,
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
        scroll={{ x: 800 }}
        pagination={false}
      />
    </div>
  );
}
