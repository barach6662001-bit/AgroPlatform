import '@testing-library/jest-dom';

// JSDOM does not implement getComputedStyle with pseudo-elements; stub it so
// Ant Design / Recharts do not throw during render.
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: (elt: Element) => ({
    getPropertyValue: () => '',
    display: 'block',
    appearance: 'none',
  }),
});

// Ant Design requires window.matchMedia which is not available in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
