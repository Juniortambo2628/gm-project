import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useRef } from 'react';

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

  it('provides login function', () => {
    let loginRef: ReturnType<typeof useRef<((token: string, user: { id: number; name: string; email: string; role: string }) => void) | undefined>>;

    function LoginChecker() {
      const auth = useAuth();
      loginRef = useRef(auth.login);
      loginRef.current = auth.login;
      return <div>{auth.isAuthenticated ? 'auth' : 'no-auth'}</div>;
    }

    render(
      <AuthProvider>
        <LoginChecker />
      </AuthProvider>
    );

    expect(typeof loginRef?.current).toBe('function');
  });

  it('provides logout function', () => {
    let logoutRef: ReturnType<typeof useRef<(() => Promise<void>) | undefined>>;

    function LogoutChecker() {
      const auth = useAuth();
      logoutRef = useRef(auth.logout);
      logoutRef.current = auth.logout;
      return <div>{auth.isAuthenticated ? 'auth' : 'no-auth'}</div>;
    }

    render(
      <AuthProvider>
        <LogoutChecker />
      </AuthProvider>
    );

    expect(typeof logoutRef?.current).toBe('function');
  });
});
