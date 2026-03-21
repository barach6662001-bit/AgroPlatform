import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

describe('Dashboard page', () => {
  it('renders dashboard without crashing', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await new Promise(resolve => setTimeout(resolve, 0));
  });
});
