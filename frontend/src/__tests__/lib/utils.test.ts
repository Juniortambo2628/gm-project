import { describe, it, expect } from 'vitest';
import { cn, getApiErrorMessage } from '@/lib/utils';
import { AxiosError } from 'axios';

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
    } as any);
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
