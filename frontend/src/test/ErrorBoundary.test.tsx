import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';

// Component that throws an error when rendered
function BrokenComponent(): never {
  throw new Error('Test error from BrokenComponent');
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Healthy content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Healthy content')).toBeInTheDocument();
  });

  it('catches errors and renders fallback UI', () => {
    // Suppress expected console.error output from React during error boundary test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    // The fallback shows the server error title from uk i18n
    expect(screen.getByText(/помилка сервера/i)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('renders a reload button in the fallback UI', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('button', { name: /reload|перезавантажити/i })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
