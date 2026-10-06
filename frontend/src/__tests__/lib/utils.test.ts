import { describe, it, expect } from 'vitest';
import { cn, getApiErrorMessage, formatCurrency } from '@/lib/utils';
import { AxiosError } from 'axios';

describe('formatCurrency', () => {
  it('renders the GBP sterling sign, not a literal escape sequence', () => {
    const result = formatCurrency(1500, 'GBP');
    expect(result).toBe('£1,500');
    expect(result.startsWith('£')).toBe(true);
    // Guards against the £ escape being emitted verbatim.
    expect(result).not.toContain('\\u00a3');
    expect(result).not.toContain('u00a3');
  });

  it('renders known currency symbols', () => {
    expect(formatCurrency(100, 'USD')).toBe('$100');
    expect(formatCurrency(100, 'KES')).toBe('KSh100');
    expect(formatCurrency(100, 'EUR')).toBe('€100');
  });

  it('defaults to GBP when no currency is given', () => {
    expect(formatCurrency(2500)).toBe('£2,500');
  });

  it('is case-insensitive about the currency code', () => {
    expect(formatCurrency(100, 'gbp')).toBe('£100');
  });

  it('falls back to the raw code for unknown currencies', () => {
    expect(formatCurrency(100, 'JPY')).toBe('JPY100');
  });

  it('formats thousands separators and accepts string amounts', () => {
    expect(formatCurrency(1234567, 'USD')).toBe('$1,234,567');
    expect(formatCurrency('5000', 'GBP')).toBe('£5,000');
  });
});

describe('cn', () => {
  it('merges class names', () => {
    const result = cn('class1', 'class2');
    expect(result).toContain('class1');
    expect(result).toContain('class2');
  });

  it('handles conditional classes', () => {
    const result = cn('base', true && 'active', false && 'inactive');
    expect(result).toContain('base');
    expect(result).toContain('active');
    expect(result).not.toContain('inactive');
  });

  it('deduplicates tailwind classes', () => {
    const result = cn('p-4', 'p-8');
    expect(result).toBe('p-8');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });
});

describe('getApiErrorMessage', () => {
  it('extracts message from real AxiosError', () => {
    const error = new AxiosError('Request failed', '404', undefined, undefined, {
      data: { message: 'Not found' },
    } as import('axios').AxiosResponse);
    expect(getApiErrorMessage(error, 'Fallback')).toBe('Not found');
  });

  it('returns fallback for AxiosError without response data', () => {
    const error = new AxiosError('Network Error');
    expect(getApiErrorMessage(error, 'Fallback')).toBe('Fallback');
  });

  it('extracts message from standard Error', () => {
    const error = new Error('Standard error');
    expect(getApiErrorMessage(error, 'Fallback')).toBe('Standard error');
  });

  it('returns fallback for unknown error types', () => {
    expect(getApiErrorMessage('string error', 'Fallback')).toBe('Fallback');
  });

  it('returns fallback for null', () => {
    expect(getApiErrorMessage(null, 'Fallback')).toBe('Fallback');
  });
});
