import { config } from '@vue/test-utils';
import { NInputNumber, NSelect } from "naive-ui";
import { vi } from 'vitest';

config.global.components = {
  'n-select': NSelect,
  'n-input-number': NInputNumber,
};
config.global.renderStubDefaultSlot = true;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Element.prototype.scrollTo = () => { }; 