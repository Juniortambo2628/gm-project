import { describe, it, expect } from 'vitest';
import { extractList, getErrorMessage } from '@/lib/api';
import type { AxiosResponse } from 'axios';

function makeResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as never,
  };
}

describe('extractList', () => {
  it('returns a plain array directly', () => {
    const items = [{ id: 1 }, { id: 2 }];
    expect(extractList(makeResponse(items))).toEqual(items);
  });

  it('unwraps a paginated { data: [...] } response', () => {
    const items = [{ id: 1 }];
    expect(extractList(makeResponse({ data: items }))).toEqual(items);
  });

  it('returns empty array for null/undefined', () => {
    expect(extractList(makeResponse(null))).toEqual([]);
    expect(extractList(makeResponse(undefined))).toEqual([]);
  });

  it('returns empty array when data is not an array', () => {
    expect(extractList(makeResponse({ foo: 'bar' }))).toEqual([]);
  });

  it('returns empty array when paginated data is not an array', () => {
    expect(extractList(makeResponse({ data: 'not-an-array' }))).toEqual([]);
  });
});

describe('getErrorMessage', () => {
  it('extracts message from axios-like error', () => {
    const error = { response: { data: { message: 'Not found' } } };
    expect(getErrorMessage(error)).toBe('Not found');
  });

  it('extracts message from native Error', () => {
    expect(getErrorMessage(new Error('Something broke'))).toBe('Something broke');
  });

  it('returns fallback for plain objects without response', () => {
    expect(getErrorMessage({ message: 'Network Error' })).toBe('An unexpected error occurred');
  });

  it('returns fallback for unknown values', () => {
    expect(getErrorMessage('string error')).toBe('An unexpected error occurred');
    expect(getErrorMessage(null)).toBe('An unexpected error occurred');
    expect(getErrorMessage(42)).toBe('An unexpected error occurred');
  });
});
