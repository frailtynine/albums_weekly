import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';

class ClipboardItemMock {
  items: Record<string, Blob>;

  constructor(items: Record<string, Blob>) {
    this.items = items;
  }
}

Object.assign(globalThis, {
  ClipboardItem: ClipboardItemMock,
});

const localStorageState = new Map<string, string>();

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: vi.fn((key: string) => localStorageState.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      localStorageState.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      localStorageState.delete(key);
    }),
    clear: vi.fn(() => {
      localStorageState.clear();
    }),
  },
  configurable: true,
});

Object.defineProperty(globalThis.navigator, 'clipboard', {
  value: {
    write: vi.fn(),
  },
  configurable: true,
});

beforeEach(() => {
  localStorageState.clear();
});
