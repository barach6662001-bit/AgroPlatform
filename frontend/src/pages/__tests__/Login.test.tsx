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
    expect(screen.getByRole('button', { name: /login|увійти/i })).toBeInTheDocument();
  });

  it('renders a link to the registration page', () => {
    renderLogin();
    expect(screen.getByRole('link')).toBeInTheDocument();
  });
});
