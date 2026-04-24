import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Heading } from '../Heading';

describe('Heading', () => {
  it('default level=2 renders an <h2>', () => {
    render(<Heading data-testid="h">Title</Heading>);
    const el = screen.getByTestId('h');
    expect(el.tagName).toBe('H2');
    expect(el.style.getPropertyValue('--ds-h-size')).toBe('var(--font-size-h2)');
  });

  it('display level renders an <h1> with display tokens', () => {
    render(<Heading level="display" data-testid="h">D</Heading>);
    const el = screen.getByTestId('h');
    expect(el.tagName).toBe('H1');
    expect(el.style.getPropertyValue('--ds-h-size')).toBe('var(--font-size-display)');
  });

  it('decouples visual `level` from semantic `as`', () => {
    render(<Heading level={1} as="h2" data-testid="h">Big H2</Heading>);
    const el = screen.getByTestId('h');
    expect(el.tagName).toBe('H2');
    expect(el.style.getPropertyValue('--ds-h-size')).toBe('var(--font-size-h1)');
  });

  it('applies tone via data-attribute (not inline color)', () => {
    render(<Heading tone="muted" data-testid="h">x</Heading>);
    expect(screen.getByTestId('h')).toHaveAttribute('data-tone', 'muted');
  });

  it('weight override is applied', () => {
    render(<Heading weight="medium" data-testid="h">x</Heading>);
    expect(screen.getByTestId('h').style.getPropertyValue('--ds-h-weight')).toBe('var(--font-weight-medium)');
  });

  it('truncate emits data-truncate', () => {
    render(<Heading truncate data-testid="h">x</Heading>);
    expect(screen.getByTestId('h')).toHaveAttribute('data-truncate', 'true');
  });
});
