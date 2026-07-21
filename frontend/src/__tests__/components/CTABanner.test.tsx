import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CTABanner } from '@/components/CTABanner';

describe('CTABanner', () => {
  it('renders title text', () => {
    render(<CTABanner title="Ready to start?" />);
    expect(screen.getByText('Ready to start?')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<CTABanner title="Title" description="This is a description" />);
    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  it('renders default button text', () => {
    render(<CTABanner title="Title" />);
    expect(screen.getByRole('link', { name: /book a session/i })).toBeInTheDocument();
  });

  it('renders custom button text', () => {
    render(<CTABanner title="Title" buttonText="Get Started" />);
    expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument();
  });

  it('calls onButtonClick when provided instead of link', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<CTABanner title="Title" onButtonClick={handleClick} />);
    await user.click(screen.getByRole('button', { name: /book a session/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies maroon variant styling', () => {
    render(<CTABanner title="Title" variant="maroon" />);
    const section = screen.getByText('Title').closest('div');
    expect(section?.className).toContain('bg-primary');
  });

  it('applies card variant styling', () => {
    render(<CTABanner title="Title" variant="card" />);
    const section = screen.getByText('Title').closest('div');
    expect(section?.className).toContain('bg-card');
  });
});
