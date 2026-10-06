import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminDashboard from '@/app/admin/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => '/admin',
  useSearchParams: () => new URLSearchParams(),
}));

// The dashboard is gated on an authenticated admin; force that state.
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, isLoading: false }),
}));

// Stub the chart so the test doesn't depend on recharts' layout in jsdom.
vi.mock('@/components/admin/RevenueChart', () => ({
  default: () => <div data-testid="revenue-chart" />,
}));

describe('AdminDashboard', () => {
  it('renders KPI totals from the dashboard API', async () => {
    render(<AdminDashboard />);

    // total_revenue 150000 -> £150,000
    expect(await screen.findByText('£150,000')).toBeInTheDocument();
    // total_transactions and total_messages
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('shows the month-over-month revenue delta (current 12,000 vs previous 8,000)', async () => {
    render(<AdminDashboard />);

    const chip = await screen.findByText(/vs last month/);
    // +£4,000, trending up — not the old fake "+£0".
    expect(chip.textContent?.replace(/\s+/g, ' ')).toContain('+£4,000 vs last month');
  });

  it('wires recent bookings to the transaction email field', async () => {
    render(<AdminDashboard />);

    // Regression: the card previously read `customer_email` (undefined).
    expect(await screen.findByText('client@example.com')).toBeInTheDocument();
  });

  it('wires recent messages to the content and subject fields', async () => {
    render(<AdminDashboard />);

    // Regression: previously read `message` / `service_interest` (undefined).
    expect(
      await screen.findByText(/I would like to learn more about your packages\./)
    ).toBeInTheDocument();
    expect(screen.getByText('MBA Coaching')).toBeInTheDocument();
  });
});
