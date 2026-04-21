import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MaterialKpiCards from '../MaterialKpiCards/MaterialKpiCards';
import type { MaterialKpiItem } from '../../types/economics';

/** Minimal icon stand-in so tests don't need to import @ant-design/icons. */
const Icon = () => <span>icon</span>;

const ITEMS: MaterialKpiItem[] = [
  { key: 'Fertilizers', label: 'Добрива',  amount: 80_000, icon: <Icon /> },
  { key: 'Seeds',       label: 'Насіння',  amount: 50_000, icon: <Icon /> },
  { key: 'Pesticides',  label: 'Хімікати', amount: 40_000, icon: <Icon /> },
  { key: 'Fuel',        label: 'Паливо',   amount: 60_000, icon: <Icon /> },
  { key: 'Harvest',     label: 'Врожай',   amount: 0,      icon: <Icon /> },
  { key: 'Total',       label: 'Всього',   amount: 230_000, icon: <Icon />, isTotal: true },
];

describe('MaterialKpiCards', () => {
  it('renders exactly six cards', () => {
    render(<MaterialKpiCards items={ITEMS} />);
    // Each card has data-testid="kpi-card-<key>"
    const cards = [
      screen.getByTestId('kpi-card-Fertilizers'),
      screen.getByTestId('kpi-card-Seeds'),
      screen.getByTestId('kpi-card-Pesticides'),
      screen.getByTestId('kpi-card-Fuel'),
      screen.getByTestId('kpi-card-Harvest'),
      screen.getByTestId('kpi-card-Total'),
    ];
    expect(cards).toHaveLength(6);
  });

  it('displays the correct label for each card', () => {
    render(<MaterialKpiCards items={ITEMS} />);
    expect(screen.getByText('Добрива')).toBeInTheDocument();
    expect(screen.getByText('Насіння')).toBeInTheDocument();
    expect(screen.getByText('Хімікати')).toBeInTheDocument();
    expect(screen.getByText('Паливо')).toBeInTheDocument();
    expect(screen.getByText('Врожай')).toBeInTheDocument();
    expect(screen.getByText('Всього')).toBeInTheDocument();
  });

  it('displays formatted amount values for each card', () => {
    render(<MaterialKpiCards items={ITEMS} />);
    // formatUA: 80_000 → "80.00 тис.", 230_000 → "230.00 тис."
    expect(screen.getByText('80.00 тис.')).toBeInTheDocument();
    expect(screen.getByText('50.00 тис.')).toBeInTheDocument();
    expect(screen.getByText('40.00 тис.')).toBeInTheDocument();
    expect(screen.getByText('60.00 тис.')).toBeInTheDocument();
    expect(screen.getByText('230.00 тис.')).toBeInTheDocument();
  });

  it('gives the "Всього" card the "total" variant attribute', () => {
    render(<MaterialKpiCards items={ITEMS} />);
    const totalCard = screen.getByTestId('kpi-card-Total');
    expect(totalCard).toHaveAttribute('data-variant', 'total');
  });

  it('does NOT give non-total cards the "total" variant', () => {
    render(<MaterialKpiCards items={ITEMS} />);
    const nonTotalKeys = ['Fertilizers', 'Seeds', 'Pesticides', 'Fuel', 'Harvest'];
    nonTotalKeys.forEach((key) => {
      const card = screen.getByTestId(`kpi-card-${key}`);
      expect(card).toHaveAttribute('data-variant', 'default');
    });
  });

  it('applies the blue background to the "Всього" card', () => {
    render(<MaterialKpiCards items={ITEMS} />);
    const totalCard = screen.getByTestId('kpi-card-Total');
    // Ant Design Card wraps content, the data-testid is on the ant-card root div
    expect(totalCard.style.background).toBe('var(--info)');
  });

  it('renders loading skeletons when loading=true', () => {
    render(<MaterialKpiCards items={[]} loading={true} />);
    expect(screen.getByTestId('material-kpi-cards-loading')).toBeInTheDocument();
  });

  it('renders the cards container when not loading', () => {
    render(<MaterialKpiCards items={ITEMS} />);
    expect(screen.getByTestId('material-kpi-cards')).toBeInTheDocument();
  });
});
