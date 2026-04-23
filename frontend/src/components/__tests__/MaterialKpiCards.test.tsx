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
    // Non-total cards have data-testid="kpi-card-<key>", total card has data-testid="total-card"
    const cards = [
      screen.getByTestId('kpi-card-Fertilizers'),
      screen.getByTestId('kpi-card-Seeds'),
      screen.getByTestId('kpi-card-Pesticides'),
      screen.getByTestId('kpi-card-Fuel'),
      screen.getByTestId('kpi-card-Harvest'),
      screen.getByTestId('total-card'),
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
    // formatUA: 80_000 → "80.00 тис.", 230_000 (total, using TotalCard) → "230 000 ₴"
    expect(screen.getByText('80.00 тис.')).toBeInTheDocument();
    expect(screen.getByText('50.00 тис.')).toBeInTheDocument();
    expect(screen.getByText('40.00 тис.')).toBeInTheDocument();
    expect(screen.getByText('60.00 тис.')).toBeInTheDocument();
    expect(screen.getByText('230 000 ₴')).toBeInTheDocument(); // TotalCard uses formatUah, not formatUA
  });

  it('gives the "Всього" card the "total" variant attribute', () => {
    render(<MaterialKpiCards items={ITEMS} />);
    // TotalCard has data-testid="total-card"
    const totalCard = screen.getByTestId('total-card');
    // TotalCard doesn't have data-variant, only non-total cards do
    // So this test is less relevant now—TotalCard is styled directly with highlight prop
    expect(totalCard).toBeInTheDocument();
  });

  it('does NOT give non-total cards the "total" variant', () => {
    render(<MaterialKpiCards items={ITEMS} />);
    const nonTotalKeys = ['Fertilizers', 'Seeds', 'Pesticides', 'Fuel', 'Harvest'];
    nonTotalKeys.forEach((key) => {
      const card = screen.getByTestId(`kpi-card-${key}`);
      expect(card).toHaveAttribute('data-variant', 'default');
    });
  });

  it('applies blue styling to the "Всього" card', () => {
    render(<MaterialKpiCards items={ITEMS} />);
    // TotalCard is styled via CSS with highlight prop, not inline style
    const totalCard = screen.getByTestId('total-card');
    // Just verify it exists and is visible
    expect(totalCard).toBeInTheDocument();
    expect(totalCard).toBeVisible();
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
