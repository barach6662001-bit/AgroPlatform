import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Container } from '../Container';

describe('Container', () => {
  it('defaults to size "xl" (1280 px)', () => {
    render(<Container data-testid="c" />);
    expect(screen.getByTestId('c').style.getPropertyValue('--ds-container-max')).toBe('1280px');
  });

  it('accepts size presets', () => {
    render(<Container size="sm" data-testid="c" />);
    expect(screen.getByTestId('c').style.getPropertyValue('--ds-container-max')).toBe('640px');
  });

  it('size="full" disables the max-width', () => {
    render(<Container size="full" data-testid="c" />);
    expect(screen.getByTestId('c').style.getPropertyValue('--ds-container-max')).toBe('none');
  });

  it('renders the requested element', () => {
    render(<Container as="main" data-testid="c" />);
    expect(screen.getByTestId('c').tagName).toBe('MAIN');
  });
});
