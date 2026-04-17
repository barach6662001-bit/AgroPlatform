import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';

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
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders a submit button', () => {
    renderLogin();
    const buttons = screen.getAllByRole('button', { name: /sign in/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    expect(buttons[0]).toBeInTheDocument();
  });

  it('does not render a registration link (closed platform)', () => {
    renderLogin();
    const links = screen.queryAllByRole('link');
    const registrationLink = links.find(
      (l) => /register|sign up|create account/i.test(l.textContent ?? ''),
    );
    expect(registrationLink).toBeUndefined();
  });
});
