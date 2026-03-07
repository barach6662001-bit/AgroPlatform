import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';

vi.mock('../../api/auth', () => ({
  login: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

describe('Login page', () => {
  it('renders the login form', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password|пароль/i)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /увійти|login|sign in/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('renders a link to the register page', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const registerLink = screen.getByRole('link');
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});
