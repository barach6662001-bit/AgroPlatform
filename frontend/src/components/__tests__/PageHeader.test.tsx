import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageHeader from '../PageHeader';

describe('PageHeader', () => {
  it('renders the title as a semantic <h1>', () => {
    render(<PageHeader title="Test Title" />);
    const heading = screen.getByRole('heading', { level: 1, name: 'Test Title' });
    expect(heading).toBeInTheDocument();
  });

  it('renders the subtitle when provided', () => {
    render(<PageHeader title="Title" subtitle="Some subtitle" />);
    expect(screen.getByText('Some subtitle')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<PageHeader title="Title Only" />);
    expect(screen.queryByText(/subtitle/i)).not.toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(
      <PageHeader
        title="With actions"
        actions={<button type="button">Do thing</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Do thing' })).toBeInTheDocument();
  });

  it('renders breadcrumbs slot when provided', () => {
    render(
      <PageHeader
        title="Crumbs"
        breadcrumbs={<nav aria-label="breadcrumb">crumbs-here</nav>}
      />,
    );
    expect(screen.getByLabelText('breadcrumb')).toHaveTextContent('crumbs-here');
  });

  it('wraps the header in a semantic <header> element', () => {
    const { container } = render(<PageHeader title="x" />);
    expect(container.querySelector('header')).not.toBeNull();
  });
});
