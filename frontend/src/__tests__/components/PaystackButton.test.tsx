import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaystackButton from '@/components/PaystackButton';

vi.mock('@/context/SiteSettingsContext', () => ({
  useSiteSettings: () => ({
    getSetting: (key: string) => (key === 'paystack_public_key' ? 'pk_test_from_settings' : ''),
    settings: {},
  }),
}));

const mockInitializePayment = vi.fn();

vi.mock('react-paystack', () => ({
  usePaystackPayment: () => mockInitializePayment,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

describe('PaystackButton', () => {
  const defaultProps = {
    email: 'test@example.com',
    amountInCents: 50000,
    serviceName: 'MBA Consulting',
    isRecording: false,
    onSuccess: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with service name', () => {
    render(<PaystackButton {...defaultProps} />);
    expect(screen.getByText(/MBA Consulting/)).toBeInTheDocument();
  });

  it('renders "Confirm & Pay Session" when no service name', () => {
    render(<PaystackButton {...defaultProps} serviceName="" />);
    expect(screen.getByText(/Confirm & Pay Session/)).toBeInTheDocument();
  });

  it('shows loading state when isRecording is true', () => {
    render(<PaystackButton {...defaultProps} isRecording={true} />);
    expect(screen.getByText('Confirming...')).toBeInTheDocument();
    expect(screen.queryByText(/Confirm & Pay/)).not.toBeInTheDocument();
  });

  it('is disabled when isRecording is true', () => {
    render(<PaystackButton {...defaultProps} isRecording={true} />);
    expect(screen.getByRole('button', { name: /confirming/i })).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<PaystackButton {...defaultProps} disabled={true} />);
    expect(screen.getByRole('button', { name: /confirm & pay/i })).toBeDisabled();
  });

  it('calls initializePayment on click', async () => {
    const user = userEvent.setup();
    render(<PaystackButton {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /confirm & pay mba consulting/i }));
    expect(mockInitializePayment).toHaveBeenCalledWith({
      onSuccess: defaultProps.onSuccess,
      onClose: defaultProps.onClose,
    });
  });

  it('uses env var for public key over settings fallback', () => {
    vi.stubEnv('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY', 'pk_test_env_key');
    render(<PaystackButton {...defaultProps} />);
    expect(screen.getByRole('button', { name: /confirm & pay/i })).toBeInTheDocument();
    vi.unstubAllEnvs();
  });
});
