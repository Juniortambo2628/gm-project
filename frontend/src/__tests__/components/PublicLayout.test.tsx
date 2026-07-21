import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicLayout } from '@/components/layout/PublicLayout';

vi.mock('@/components/SiteHeader', () => ({
  SiteHeader: () => <header data-testid="site-header">Header</header>,
}));

vi.mock('@/components/SiteFooter', () => ({
  SiteFooter: () => <footer data-testid="site-footer">Footer</footer>,
}));

describe('PublicLayout', () => {
  it('renders children', () => {
    render(
      <PublicLayout>
        <div>Page Content</div>
      </PublicLayout>
    );
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('renders SiteHeader', () => {
    render(
      <PublicLayout>
        <div>Content</div>
      </PublicLayout>
    );
    expect(screen.getByTestId('site-header')).toBeInTheDocument();
  });

  it('renders SiteFooter', () => {
    render(
      <PublicLayout>
        <div>Content</div>
      </PublicLayout>
    );
    expect(screen.getByTestId('site-footer')).toBeInTheDocument();
  });

  it('renders hero section when hero prop is provided', () => {
    render(
      <PublicLayout hero={{ title: 'Hero Title', subtitle: 'Hero Sub', breadcrumbs: [] }}>
        <div>Content</div>
      </PublicLayout>
    );
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Hero Sub')).toBeInTheDocument();
  });

  it('does not render hero section when hero prop is not provided', () => {
    const { container } = render(
      <PublicLayout>
        <div>Content</div>
      </PublicLayout>
    );
    expect(container.querySelector('section')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <PublicLayout className="custom-layout">
        <div>Content</div>
      </PublicLayout>
    );
    expect(container.firstChild).toHaveClass('custom-layout');
  });
});
