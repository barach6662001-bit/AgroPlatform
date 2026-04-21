import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';

// Prevent actual API calls
vi.mock('../../api/auth', () => ({
  login: vi.fn(),
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
}

describe('Login page', () => {
  it('renders email and password input fields', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password|пароль/i)).toBeInTheDocument();
  });

  it('renders a submit button', () => {
    renderLogin();
    const buttons = screen.getAllByRole('button', { name: /login|увійти/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    expect(buttons[0]).toBeInTheDocument();
  });

  it('does not render a registration link (closed platform)', () => {
    renderLogin();
    expect(screen.queryByRole('link')).toBeNull();
  });
});
