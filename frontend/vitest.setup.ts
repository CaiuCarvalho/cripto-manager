import '@testing-library/jest-dom';

// jsdom does not implement ResizeObserver (used by recharts ResponsiveContainer)
if (typeof global.ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
