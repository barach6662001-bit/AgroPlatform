import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Text } from '../Text';

describe('Text', () => {
  it('defaults: <p>, size base, weight normal', () => {
    render(<Text data-testid="t">hi</Text>);
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('P');
    expect(el.style.getPropertyValue('--ds-text-size')).toBe('var(--font-size-base)');
    expect(el.style.getPropertyValue('--ds-text-weight')).toBe('var(--font-weight-normal)');
  });

  it('size+weight map to CSS variables', () => {
    render(<Text size="lg" weight="semibold" data-testid="t">x</Text>);
    const el = screen.getByTestId('t');
    expect(el.style.getPropertyValue('--ds-text-size')).toBe('var(--font-size-lg)');
    expect(el.style.getPropertyValue('--ds-text-weight')).toBe('var(--font-weight-semibold)');
  });

  it('mono / tabular flags emit data attributes', () => {
    render(<Text mono tabular data-testid="t">123</Text>);
    const el = screen.getByTestId('t');
    expect(el).toHaveAttribute('data-mono', 'true');
    expect(el).toHaveAttribute('data-tabular', 'true');
  });

  it('clamp accepts 2/3/4', () => {
    render(<Text clamp={3} data-testid="t">long…</Text>);
    expect(screen.getByTestId('t')).toHaveAttribute('data-clamp', '3');
  });

  it('omits data-tone by default and sets it when provided', () => {
    const { rerender } = render(<Text data-testid="t">x</Text>);
    expect(screen.getByTestId('t')).not.toHaveAttribute('data-tone');
    rerender(<Text tone="success" data-testid="t">x</Text>);
    expect(screen.getByTestId('t')).toHaveAttribute('data-tone', 'success');
  });

  it('renders custom element via `as`', () => {
    render(<Text as="label" data-testid="t">L</Text>);
    expect(screen.getByTestId('t').tagName).toBe('LABEL');
  });
});
