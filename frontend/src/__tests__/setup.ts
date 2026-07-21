import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';

// Polyfill TransformStream and ReadableStream for MSW v2 in jsdom
if (typeof globalThis.TransformStream === 'undefined') {
  globalThis.TransformStream = class TransformStream {
    constructor() {
      this.readable = new ReadableStream();
      this.writable = new WritableStream();
    }
  } as unknown as typeof TransformStream;
}

if (typeof globalThis.ReadableStream === 'undefined') {
  globalThis.ReadableStream = class ReadableStream {
    constructor() {}
    getReader() {
      return {
        read: async () => ({ done: true, value: undefined }),
        releaseLock: () => {},
      };
    }
  } as unknown as typeof ReadableStream;
}

if (typeof globalThis.WritableStream === 'undefined') {
  globalThis.WritableStream = class WritableStream {
    constructor() {}
  } as unknown as typeof WritableStream;
}

let server: { listen: (opts: { onUnhandledRequest: string }) => void; resetHandlers: () => void; close: () => void };

beforeAll(async () => {
  const { server: mswServer } = await import('../__test-utils__/server');
  server = mswServer;
  server.listen({ onUnhandledRequest: 'bypass' });
});

afterEach(() => {
  cleanup();
  server?.resetHandlers();
});

afterAll(() => {
  server?.close();
});
