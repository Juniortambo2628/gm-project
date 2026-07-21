import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SafeImage } from '@/components/SafeImage';

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean; fill?: boolean; sizes?: string }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

describe('SafeImage', () => {
  it('renders with provided src', () => {
    render(<SafeImage src="/test-image.jpg" fallback="/fallback.jpg" alt="Test" />);
    const img = screen.getByAltText('Test');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toBe('/test-image.jpg');
  });

  it('uses fallback when src is empty', () => {
    render(<SafeImage src="" fallback="/fallback.jpg" alt="Test" />);
    const img = screen.getByAltText('Test');
    expect(img.getAttribute('src')).toBe('/fallback.jpg');
  });

  it('uses fallback when src is undefined', () => {
    render(<SafeImage fallback="/fallback.jpg" alt="Test" />);
    const img = screen.getByAltText('Test');
    expect(img.getAttribute('src')).toBe('/fallback.jpg');
  });

  it('applies alt text correctly', () => {
    render(<SafeImage src="/img.jpg" fallback="/fb.jpg" alt="My Alt Text" />);
    expect(screen.getByAltText('My Alt Text')).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<SafeImage src="/img.jpg" fallback="/fb.jpg" alt="Test" className="custom-img" />);
    expect(screen.getByAltText('Test').className).toContain('custom-img');
  });
});
