import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';

describe('Badge', () => {
  it('renders with text', () => {
    render(<Badge>New Badge</Badge>);
    expect(screen.getByText('New Badge')).toBeInTheDocument();
  });

  it('applies default variant', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge.className).toContain('bg-primary/10');
  });

  it('applies secondary variant', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText('Secondary');
    expect(badge.className).toContain('bg-secondary');
  });

  it('applies outline variant', () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText('Outline');
    expect(badge.className).toContain('border');
  });

  it('applies glass variant', () => {
    render(<Badge variant="glass">Glass</Badge>);
    const badge = screen.getByText('Glass');
    expect(badge.className).toContain('backdrop-blur-md');
  });

  it('accepts custom className', () => {
    render(<Badge className="my-custom">Custom</Badge>);
    expect(screen.getByText('Custom').className).toContain('my-custom');
  });

  it('renders as inline-flex', () => {
    render(<Badge>Inline</Badge>);
    expect(screen.getByText('Inline').tagName).toBe('DIV');
  });
});
