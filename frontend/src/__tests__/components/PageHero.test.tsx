import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHero } from '@/components/PageHero';

describe('PageHero', () => {
  const defaultProps = {
    title: 'My Page Title',
    subtitle: 'This is a test subtitle for the page hero.',
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Details' }],
  };

  it('renders the title words', () => {
    render(<PageHero {...defaultProps} />);
    expect(screen.getByText('My')).toBeInTheDocument();
    expect(screen.getByText('Page')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<PageHero {...defaultProps} />);
    expect(screen.getByText(/This is a test subtitle/)).toBeInTheDocument();
  });

  it('renders breadcrumbs', () => {
    render(<PageHero {...defaultProps} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('renders badge when provided', () => {
    render(<PageHero {...defaultProps} badge="New Badge" />);
    expect(screen.getByText('New Badge')).toBeInTheDocument();
  });

  it('does not render badge when not provided', () => {
    const { container } = render(<PageHero {...defaultProps} />);
    const badgeEl = container.querySelector('.bg-primary\\/20');
    expect(badgeEl).not.toBeInTheDocument();
  });

  it('uses default videoSrc when not provided', () => {
    render(<PageHero {...defaultProps} />);
    const sources = document.querySelectorAll('source');
    const hasDefault = Array.from(sources).some(s => s.getAttribute('src') === '/hero-bg.mp4');
    expect(hasDefault).toBe(true);
  });

  it('uses custom videoSrc when provided', () => {
    render(<PageHero {...defaultProps} videoSrc="/custom-hero.mp4" />);
    const sources = document.querySelectorAll('source');
    const hasCustom = Array.from(sources).some(s => s.getAttribute('src') === '/custom-hero.mp4');
    expect(hasCustom).toBe(true);
  });
});
