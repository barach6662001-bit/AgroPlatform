import { useLocation, useNavigate } from 'react-router-dom';
import { Select } from 'antd';
import { useTranslation } from '../../i18n';
import CostAnalytics from '../Economics/CostAnalytics';
import MarginalityDashboard from '../Economics/MarginalityDashboard';
import SeasonComparison from '../Economics/SeasonComparison';
import BreakEvenCalculator from '../Economics/BreakEvenCalculator';
import FieldPnl from '../Economics/FieldPnl';
import FieldEfficiency from '../Analytics/FieldEfficiency';
import ResourceConsumption from '../Analytics/ResourceConsumption';
import SalaryFuelAnalytics from '../Analytics/SalaryFuelAnalytics';
import RevenueAnalytics from '../Sales/RevenueAnalytics';

type Dimension =
  | 'costs'
  | 'revenue'
  | 'field'
  | 'season'
  | 'breakeven'
  | 'category'
  | 'resources'
  | 'efficiency'
  | 'payroll';

const DIMENSIONS: { value: Dimension; label: string }[] = [
  { value: 'costs', label: 'Аналітика витрат' },
  { value: 'revenue', label: 'Аналітика доходів' },
  { value: 'field', label: 'P&L по полях' },
  { value: 'category', label: 'Маржинальність' },
  { value: 'season', label: 'Порівняння сезонів' },
  { value: 'breakeven', label: 'Точка беззбитковості' },
  { value: 'resources', label: 'Споживання ресурсів' },
  { value: 'efficiency', label: 'Ефективність полів' },
  { value: 'payroll', label: 'Зарплати і пальне' },
];

function parseDimension(search: string): Dimension {
  const dim = new URLSearchParams(search).get('dim') as Dimension | null;
  return dim && DIMENSIONS.some((d) => d.value === dim) ? dim : 'costs';
}

const DIM_COMPONENTS: Record<Dimension, React.ComponentType> = {
  costs: CostAnalytics,
  revenue: RevenueAnalytics,
  field: FieldPnl,
  category: MarginalityDashboard,
  season: SeasonComparison,
  breakeven: BreakEvenCalculator,
  resources: ResourceConsumption,
  efficiency: FieldEfficiency,
  payroll: SalaryFuelAnalytics,
};

export default function FinanceAnalytics() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const dim = parseDimension(location.search);
  const ActiveComponent = DIM_COMPONENTS[dim];

  const handleDimChange = (value: Dimension) => {
    const params = new URLSearchParams(location.search);
    params.set('tab', 'analytics');
    params.set('dim', value);
    navigate(`/finance?${params.toString()}`, { replace: true });
  };

  return (
    <div>
      {/* Dimension selector */}
      <div style={{ marginBottom: 20 }}>
        <Select
          value={dim}
          onChange={handleDimChange}
          options={DIMENSIONS}
          style={{ width: 240 }}
          size="middle"
        />
      </div>

      {/* Active analytics view */}
      <ActiveComponent />
    </div>
  );
}
