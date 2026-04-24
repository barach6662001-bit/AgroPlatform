import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../Card';

const styleOf = (el: Element) => el.getAttribute('style') ?? '';

describe('Card', () => {
  it('renders a <div> by default', () => {
    const { container } = render(<Card>x</Card>);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('applies card defaults: subtle bg, xl radius, no shadow, padding 5', () => {
    const { container } = render(<Card>x</Card>);
    const el = container.firstElementChild as HTMLElement;
    const inline = styleOf(el);
    expect(inline).toContain('var(--card-bg)');
    expect(inline).toContain('var(--radius-xl)');
    expect(inline).toContain('var(--shadow-0)');
    expect(inline).toContain('padding: var(--space-5)');
    expect(el).toHaveAttribute('data-variant', 'subtle');
    expect(el).toHaveAttribute('data-bordered', 'true');
  });

  it('lays children out as a vertical flex with token gap', () => {
    const { container } = render(<Card gap="6">x</Card>);
    const inline = styleOf(container.firstElementChild!);
    expect(inline).toContain('display: flex');
    expect(inline).toContain('flex-direction: column');
    expect(inline).toContain('gap: var(--space-6)');
  });

  it('uses the default gap of 4 when none is provided', () => {
    const { container } = render(<Card>x</Card>);
    expect(styleOf(container.firstElementChild!)).toContain('gap: var(--space-4)');
  });

  it('can be rendered as <section> via `as`', () => {
    const { container } = render(<Card as="section">x</Card>);
    expect(container.firstElementChild?.tagName).toBe('SECTION');
  });

  it('forwards refs', () => {
    let captured: HTMLElement | null = null;
    render(
      <Card
        ref={(el) => {
          captured = el;
        }}
      >
        x
      </Card>,
    );
    expect(captured).toBeInstanceOf(HTMLElement);
  });

  it('overrides defaults when explicit props are passed', () => {
    const { container } = render(
      <Card variant="raised" radius="md" elevation={3} bordered={false} p="3">
        x
      </Card>,
    );
    const el = container.firstElementChild as HTMLElement;
    const inline = styleOf(el);
    expect(inline).toContain('var(--bg-elevated)');
    expect(inline).toContain('var(--radius-md)');
    expect(inline).toContain('var(--shadow-3)');
    expect(inline).not.toContain('var(--border)');
    expect(inline).toContain('padding: var(--space-3)');
  });

  it('marks interactive cards via data-interactive', () => {
    const { container } = render(<Card interactive>x</Card>);
    expect(container.firstElementChild).toHaveAttribute('data-interactive', 'true');
  });
});

describe('Card sub-components', () => {
  it('renders the full Card.* anatomy with correct semantic tags', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="hdr">
          <CardTitle>My title</CardTitle>
          <CardDescription>My description</CardDescription>
        </CardHeader>
        <CardContent data-testid="body">
          <p>row a</p>
          <p>row b</p>
        </CardContent>
        <CardFooter data-testid="foot">
          <button type="button">Confirm</button>
        </CardFooter>
      </Card>,
    );

    const title = screen.getByRole('heading', { level: 3, name: 'My title' });
    expect(title).toBeInTheDocument();

    expect(screen.getByText('My description').tagName).toBe('P');

    const header = screen.getByTestId('hdr');
    expect(header.tagName).toBe('HEADER');

    const footer = screen.getByTestId('foot');
    expect(footer.tagName).toBe('FOOTER');

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('CardTitle accepts a `level` override', () => {
    render(<CardTitle level={2}>Big</CardTitle>);
    expect(screen.getByRole('heading', { level: 2, name: 'Big' })).toBeInTheDocument();
  });

  it('CardDescription accepts size and tone overrides', () => {
    const { container } = render(
      <CardDescription size="xs" tone="tertiary">
        small
      </CardDescription>,
    );
    expect(container.firstElementChild).toHaveAttribute('data-tone', 'tertiary');
  });
});
