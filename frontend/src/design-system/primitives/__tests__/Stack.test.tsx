import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Stack } from '../Stack';

describe('Stack', () => {
  it('renders children top-to-bottom with default gap (var(--space-4))', () => {
    render(<Stack data-testid="s"><span>a</span><span>b</span></Stack>);
    const el = screen.getByTestId('s');
    expect(el.tagName).toBe('DIV');
    expect(el.style.getPropertyValue('--ds-stack-gap')).toBe('var(--space-4)');
  });

  it('honours `gap` prop', () => {
    render(<Stack gap="6" data-testid="s" />);
    expect(screen.getByTestId('s').style.getPropertyValue('--ds-stack-gap')).toBe('var(--space-6)');
  });

  it('emits data-attributes for align/justify (no string concatenation in CSS)', () => {
    render(<Stack align="center" justify="between" data-testid="s" />);
    const el = screen.getByTestId('s');
    expect(el).toHaveAttribute('data-align', 'center');
    expect(el).toHaveAttribute('data-justify', 'between');
  });

  it('omits data-divide when divide is false', () => {
    render(<Stack data-testid="s" />);
    expect(screen.getByTestId('s')).not.toHaveAttribute('data-divide');
  });

  it('emits data-divide="true" when divide=true', () => {
    render(<Stack divide data-testid="s" />);
    expect(screen.getByTestId('s')).toHaveAttribute('data-divide', 'true');
  });

  it('renders as the requested element', () => {
    render(<Stack as="ul" data-testid="s" />);
    expect(screen.getByTestId('s').tagName).toBe('UL');
  });

  it('forwards user className alongside its own scoped class', () => {
    render(<Stack className="my-extra" data-testid="s" />);
    const el = screen.getByTestId('s');
    expect(el.className).toContain('my-extra');
    // Our own class is CSS-Module-scoped, so just assert there are 2 classes.
    expect(el.className.split(/\s+/).filter(Boolean).length).toBe(2);
  });
});
