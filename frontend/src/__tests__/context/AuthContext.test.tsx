import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function TestConsumer() {
  const { user, isAuthenticated, isLoading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{isLoading ? 'loading' : 'loaded'}</span>
      <span data-testid="authenticated">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="user">{user?.name || 'none'}</span>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('provides initial unauthenticated state', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('no');
  });

  it('provides login function', async () => {
    function LoginChecker() {
      const auth = useAuth();
      return (
        <div>
          <span data-testid="login-type">{typeof auth.login}</span>
          <span>{auth.isAuthenticated ? 'auth' : 'no-auth'}</span>
        </div>
      );
    }

    render(
      <AuthProvider>
        <LoginChecker />
      </AuthProvider>
    );

    expect(screen.getByTestId('login-type')).toHaveTextContent('function');
  });

  it('provides logout function', async () => {
    function LogoutChecker() {
      const auth = useAuth();
      return (
        <div>
          <span data-testid="logout-type">{typeof auth.logout}</span>
          <span>{auth.isAuthenticated ? 'auth' : 'no-auth'}</span>
        </div>
      );
    }

    render(
      <AuthProvider>
        <LogoutChecker />
      </AuthProvider>
    );

    expect(screen.getByTestId('logout-type')).toHaveTextContent('function');
  });
});
