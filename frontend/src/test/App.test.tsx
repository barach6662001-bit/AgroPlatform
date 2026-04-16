import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAuthStore } from '../stores/authStore';
import App from '../App';

// Leaflet uses browser APIs not available in jsdom
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TileLayer: () => null,
  Polygon: () => null,
  useMap: () => ({}),
}));

vi.mock('leaflet', () => ({
  default: { icon: vi.fn(), divIcon: vi.fn() },
  icon: vi.fn(),
}));

vi.mock('leaflet-draw', () => ({}));
vi.mock('leaflet.vectorgrid', () => ({}));

// Mock all API modules to avoid network calls
vi.mock('../api/analytics', () => ({ getDashboard: vi.fn(() => Promise.reject(new Error('no network'))) }));
vi.mock('../api/fields', () => ({ getFields: vi.fn(() => Promise.reject(new Error('no network'))) }));

describe('App', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      email: null,
      role: null,
      tenantId: null,
      requirePasswordChange: false,
      firstName: null,
      lastName: null,
      isAuthenticated: false,
    });
  });

  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('shows the landing page when the user is not authenticated', async () => {
    render(<App />);
    // RootRoute renders LandingPage (with AgroHero) for unauthenticated users
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
