import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageHeader from '../PageHeader';

describe('PageHeader', () => {
  it('renders the title', () => {
    render(<PageHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders the subtitle when provided', () => {
    render(<PageHeader title="My Title" subtitle="My Subtitle" />);
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('My Subtitle')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<PageHeader title="Only Title" />);
    expect(screen.queryByText('My Subtitle')).not.toBeInTheDocument();
  });
});
