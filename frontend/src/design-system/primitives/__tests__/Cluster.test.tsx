import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Cluster } from '../Cluster';

describe('Cluster', () => {
  it('uses default gap of var(--space-2) and align="center"', () => {
    render(<Cluster data-testid="c" />);
    const el = screen.getByTestId('c');
    expect(el.style.getPropertyValue('--ds-cluster-gap')).toBe('var(--space-2)');
    expect(el).toHaveAttribute('data-align', 'center');
  });

  it('opt-in nowrap emits data-nowrap', () => {
    render(<Cluster nowrap data-testid="c" />);
    expect(screen.getByTestId('c')).toHaveAttribute('data-nowrap', 'true');
  });

  it('omits data-nowrap by default', () => {
    render(<Cluster data-testid="c" />);
    expect(screen.getByTestId('c')).not.toHaveAttribute('data-nowrap');
  });

  it('respects custom gap', () => {
    render(<Cluster gap="6" data-testid="c" />);
    expect(screen.getByTestId('c').style.getPropertyValue('--ds-cluster-gap')).toBe('var(--space-6)');
  });
});
