import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Surface } from '../Surface';

const styleOf = (el: Element) => el.getAttribute('style') ?? '';

describe('Surface', () => {
  it('renders a <div> by default', () => {
    const { container } = render(<Surface>x</Surface>);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('respects the polymorphic `as` prop (e.g. <section>)', () => {
    const { container } = render(<Surface as="section">x</Surface>);
    expect(container.firstElementChild?.tagName).toBe('SECTION');
  });

  it('forwards refs to the underlying element', () => {
    let captured: HTMLElement | null = null;
    render(
      <Surface
        ref={(el) => {
          captured = el;
        }}
      >
        ref
      </Surface>,
    );
    expect(captured).toBeInstanceOf(HTMLElement);
  });

  it('exposes the variant via data-variant for downstream selectors', () => {
    const { container } = render(<Surface variant="raised">x</Surface>);
    expect(container.firstElementChild).toHaveAttribute('data-variant', 'raised');
  });

  it('emits data-bordered="false" when bordered={false}', () => {
    const { container } = render(<Surface bordered={false}>x</Surface>);
    expect(container.firstElementChild).toHaveAttribute('data-bordered', 'false');
  });

  it('emits token-driven background/border/radius/shadow inline (subtle, xl, elev=2)', () => {
    const { container } = render(
      <Surface variant="subtle" radius="xl" elevation={2} bordered>
        x
      </Surface>,
    );
    const inline = styleOf(container.firstElementChild!);
    expect(inline).toContain('var(--card-bg)');
    expect(inline).toContain('var(--border)');
    expect(inline).toContain('var(--radius-xl)');
    expect(inline).toContain('var(--shadow-2)');
  });

  it('emits the elevated background token for variant="raised"', () => {
    const { container } = render(<Surface variant="raised">x</Surface>);
    expect(styleOf(container.firstElementChild!)).toContain('var(--bg-elevated)');
  });

  it('omits a background declaration when variant="flat"', () => {
    const { container } = render(<Surface variant="flat">x</Surface>);
    const inline = styleOf(container.firstElementChild!);
    expect(inline).not.toContain('var(--card-bg)');
    expect(inline).not.toContain('var(--bg-elevated)');
  });

  it('omits the border declaration when bordered={false}', () => {
    const { container } = render(<Surface bordered={false}>x</Surface>);
    expect(styleOf(container.firstElementChild!)).not.toContain('var(--border)');
  });

  it('marks interactive surfaces via data-interactive', () => {
    const { container } = render(<Surface interactive>x</Surface>);
    expect(container.firstElementChild).toHaveAttribute('data-interactive', 'true');
  });

  it('translates the spacing tokens to padding (p="5" → var(--space-5))', () => {
    const { container } = render(<Surface p="5">x</Surface>);
    expect(styleOf(container.firstElementChild!)).toContain('padding: var(--space-5)');
  });

  it('supports per-axis padding (px / py) as longhand', () => {
    const { container } = render(<Surface px="3" py="6">x</Surface>);
    const inline = styleOf(container.firstElementChild!);
    expect(inline).toContain('padding-left: var(--space-3)');
    expect(inline).toContain('padding-right: var(--space-3)');
    expect(inline).toContain('padding-top: var(--space-6)');
    expect(inline).toContain('padding-bottom: var(--space-6)');
  });

  it('passes arbitrary HTML attributes through (id, role, aria-*)', () => {
    render(
      <Surface id="zone" role="region" aria-label="my zone">
        x
      </Surface>,
    );
    const el = screen.getByRole('region', { name: 'my zone' });
    expect(el).toHaveAttribute('id', 'zone');
  });

  it('renders children verbatim', () => {
    render(
      <Surface>
        <span data-testid="child">hi</span>
      </Surface>,
    );
    expect(screen.getByTestId('child')).toHaveTextContent('hi');
  });
});
