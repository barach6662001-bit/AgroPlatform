import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Box } from '../Box';

describe('Box', () => {
  it('renders a div by default', () => {
    render(<Box data-testid="b">hi</Box>);
    const el = screen.getByTestId('b');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveTextContent('hi');
  });

  it('honours the `as` prop', () => {
    render(<Box as="section" data-testid="b" />);
    expect(screen.getByTestId('b').tagName).toBe('SECTION');
  });

  it('maps spacing tokens to CSS variables (non-overlapping props)', () => {
    render(<Box data-testid="b" p="4" mx="2" mt="0_5" />);
    const inline = screen.getByTestId('b').getAttribute('style') ?? '';
    expect(inline).toContain('padding: var(--space-4)');
    expect(inline).toContain('margin-left: var(--space-2)');
    expect(inline).toContain('margin-right: var(--space-2)');
    expect(inline).toContain('margin-top: var(--space-0-5)');
  });

  it('per-side props take precedence over shorthand', () => {
    render(<Box data-testid="b" p="4" pt="0_5" />);
    const inline = screen.getByTestId('b').getAttribute('style') ?? '';
    // `pt` is applied after `p`, so the top edge wins; the shorthand
    // is partially expanded by the browser/jsdom.
    expect(inline).toContain('padding-top: var(--space-0-5)');
  });

  it('forwards refs', () => {
    let captured: HTMLElement | null = null;
    render(<Box ref={(el) => { captured = el; }} data-testid="b" />);
    expect(captured).not.toBeNull();
    expect(captured!.tagName).toBe('DIV');
  });

  it('forwards arbitrary HTML attributes', () => {
    render(<Box role="region" aria-label="x" data-testid="b" />);
    const el = screen.getByTestId('b');
    expect(el).toHaveAttribute('role', 'region');
    expect(el).toHaveAttribute('aria-label', 'x');
  });
});
