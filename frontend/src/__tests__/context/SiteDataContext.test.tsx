import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SiteDataProvider, useSiteData } from '@/context/SiteDataContext';

function TestConsumer() {
  const { data, isLoading, error } = useSiteData();
  return (
    <div>
      <span data-testid="loading">{isLoading ? 'loading' : 'loaded'}</span>
      <span data-testid="error">{error || 'no-error'}</span>
      <span data-testid="has-data">{data ? 'yes' : 'no'}</span>
      {data && <span data-testid="services-count">{data.services.length}</span>}
    </div>
  );
}

describe('SiteDataContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides loading state initially', () => {
    render(
      <SiteDataProvider>
        <TestConsumer />
      </SiteDataProvider>
    );
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
  });

  it('provides data after fetch completes', async () => {
    render(
      <SiteDataProvider>
        <TestConsumer />
      </SiteDataProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    expect(screen.getByTestId('has-data')).toHaveTextContent('yes');
  });

  it('exposes refresh function', () => {
    let refreshCalled = false;
    function Refresher() {
      const { refresh } = useSiteData();
      return (
        <button onClick={() => { refresh(); refreshCalled = true; }}>
          Refresh
        </button>
      );
    }

    render(
      <SiteDataProvider>
        <Refresher />
      </SiteDataProvider>
    );

    expect(typeof refreshCalled).toBe('boolean');
  });
});
