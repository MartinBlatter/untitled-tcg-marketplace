// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/tests/*.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom does not provide TextEncoder/TextDecoder, which @mui/x-internals needs.
// Without these, importing @mui/x-data-grid in any test throws
// "ReferenceError: TextEncoder is not defined".
import { TextDecoder, TextEncoder } from 'node:util';

if (typeof globalThis.TextEncoder === 'undefined') {
    globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
    globalThis.TextDecoder = TextDecoder;
}

// Likewise structuredClone, which @mui/x-charts needs.
if (typeof globalThis.structuredClone === 'undefined') {
    globalThis.structuredClone = (value) => JSON.parse(JSON.stringify(value));
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(),
}));