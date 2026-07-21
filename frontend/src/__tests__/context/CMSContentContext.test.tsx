import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CMSContentProvider, useCMSContent } from '@/context/CMSContentContext';
import { SiteDataProvider } from '@/context/SiteDataContext';

function TestConsumer() {
  const { services, testimonials, faqs, blog_posts, isLoading } = useCMSContent();
  return (
    <div>
      <span data-testid="loading">{isLoading ? 'loading' : 'loaded'}</span>
      <span data-testid="services">{services.length}</span>
      <span data-testid="testimonials">{testimonials.length}</span>
      <span data-testid="faqs">{faqs.length}</span>
      <span data-testid="blog-posts">{blog_posts.length}</span>
    </div>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SiteDataProvider>
      <CMSContentProvider>
        {children}
      </CMSContentProvider>
    </SiteDataProvider>
  );
}

describe('CMSContentContext', () => {
  it('provides empty arrays initially', async () => {
    render(
      <Wrapper>
        <TestConsumer />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    expect(screen.getByTestId('services')).toHaveTextContent('1');
    expect(screen.getByTestId('faqs')).toHaveTextContent('1');
  });

  it('throws when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    function BadConsumer() {
      useCMSContent();
      return null;
    }

    expect(() => {
      render(<BadConsumer />);
    }).toThrow('useCMSContent must be used within a CMSContentProvider');
    
    consoleSpy.mockRestore();
  });
});
