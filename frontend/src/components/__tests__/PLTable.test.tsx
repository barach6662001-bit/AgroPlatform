import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PLTable from '../PLTable/PLTable';
import type { PLTableRow } from '../PLTable/PLTable';

const baseRows: PLTableRow[] = [
  { key: 'seeds',   label: 'Seeds',       plan: 50_000, fact: 40_000, unit: 'UAH', lowerIsBetter: true  },
  { key: 'fuel',    label: 'Fuel',        plan: 60_000, fact: 70_000, unit: 'UAH', lowerIsBetter: true  },
  { key: 'revenue', label: 'Revenue',     plan: 100_000, fact: 120_000, unit: 'UAH', lowerIsBetter: false },
];

describe('PLTable', () => {
  it('renders all row labels', () => {
    render(<PLTable rows={baseRows} />);
    expect(screen.getByText('Seeds')).toBeInTheDocument();
    expect(screen.getByText('Fuel')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('renders default column headers when labels prop is omitted', () => {
    render(<PLTable rows={baseRows} />);
    expect(screen.getByText('Показник')).toBeInTheDocument();
    expect(screen.getByText('План')).toBeInTheDocument();
    expect(screen.getByText('Факт')).toBeInTheDocument();
    expect(screen.getByText('Виконання')).toBeInTheDocument();
  });

  it('renders custom column headers when labels prop is provided', () => {
    render(<PLTable rows={baseRows} labels={{ metric: 'Category', plan: 'Target', fact: 'Actual', execution: 'Progress' }} />);
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Target')).toBeInTheDocument();
    expect(screen.getByText('Actual')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('renders formatted numbers (тис.) for thousands-range values', () => {
    render(<PLTable rows={baseRows} />);
    // plan for Seeds = 50 000 → "50.00 тис. UAH"
    expect(screen.getByText('50.00 тис. UAH')).toBeInTheDocument();
  });

  it('renders a green progress bar when lower-is-better and fact < plan', () => {
    const { container } = render(<PLTable rows={[baseRows[0]]} />);
    // Seeds: fact (40k) < plan (50k) → on-target → green bar (#3FB950 = rgb(63, 185, 80))
    const bar = container.querySelector('[role="progressbar"] div') as HTMLDivElement;
    expect(bar).toBeTruthy();
    expect(bar.style.background).toBe('rgb(63, 185, 80)');
  });

  it('renders a red progress bar when lower-is-better and fact > plan', () => {
    const { container } = render(<PLTable rows={[baseRows[1]]} />);
    // Fuel: fact (70k) > plan (60k) → over-budget → red bar (#F85149 = rgb(248, 81, 73))
    const bar = container.querySelector('[role="progressbar"] div') as HTMLDivElement;
    expect(bar).toBeTruthy();
    expect(bar.style.background).toBe('rgb(248, 81, 73)');
  });

  it('renders a green progress bar when higher-is-better and fact > plan', () => {
    const { container } = render(<PLTable rows={[baseRows[2]]} />);
    // Revenue: fact (120k) > plan (100k) → on-target → green bar (#3FB950 = rgb(63, 185, 80))
    const bar = container.querySelector('[role="progressbar"] div') as HTMLDivElement;
    expect(bar).toBeTruthy();
    expect(bar.style.background).toBe('rgb(63, 185, 80)');
  });

  it('renders progress percentage in the execution column', () => {
    render(<PLTable rows={[baseRows[0]]} />);
    // Seeds: 40k/50k = 80%
    expect(screen.getByText(/80%/)).toBeInTheDocument();
  });

  it('renders an empty table without crashing', () => {
    const { container } = render(<PLTable rows={[]} />);
    expect(container.querySelector('table')).toBeTruthy();
    expect(container.querySelector('tbody')!.children).toHaveLength(0);
  });
});
