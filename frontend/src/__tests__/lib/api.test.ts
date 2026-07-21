import { describe, it, expect } from 'vitest';
import { extractList, getErrorMessage } from '@/lib/api';
import { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';

function makeResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as AxiosResponse['config'],
  };
}

describe('extractList', () => {
  it('returns array when data is an array', () => {
    const items = [{ id: 1 }, { id: 2 }];
    expect(extractList(makeResponse(items))).toEqual(items);
  });

  it('extracts from wrapped { data: [...] } response', () => {
    const items = [{ id: 1 }];
    expect(extractList(makeResponse({ data: items }))).toEqual(items);
  });

  it('returns empty array for null data', () => {
    expect(extractList(makeResponse(null))).toEqual([]);
  });

  it('returns empty array for undefined data', () => {
    expect(extractList(makeResponse(undefined))).toEqual([]);
  });

  it('returns empty array for non-array non-wrapped data', () => {
    expect(extractList(makeResponse({ foo: 'bar' }))).toEqual([]);
  });
});

describe('getErrorMessage', () => {
  it('extracts message from real AxiosError', () => {
    const error = new AxiosError('Request failed', '404', undefined, undefined, {
      data: { message: 'Not found' },
    } as Partial<import('axios').AxiosResponse>);
    expect(getErrorMessage(error)).toBe('Not found');
  });

  it('falls back to message property for AxiosError without response', () => {
    const error = new AxiosError('Network error');
    expect(getErrorMessage(error)).toBe('Network error');
  });

  it('extracts from standard Error', () => {
    expect(getErrorMessage(new Error('Standard'))).toBe('Standard');
  });

  it('returns default for unknown types', () => {
    expect(getErrorMessage('string')).toBe('An unexpected error occurred');
  });

  it('returns default for null', () => {
    expect(getErrorMessage(null)).toBe('An unexpected error occurred');
  });
});
