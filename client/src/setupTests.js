import "@testing-library/jest-dom";

function createMockStorage() {
  const store = new Map();

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

const testStorage = createMockStorage();

Object.defineProperty(window, "localStorage", {
  value: testStorage,
  configurable: true,
});

Object.defineProperty(globalThis, "localStorage", {
  value: testStorage,
  configurable: true,
});

beforeEach(() => {
  window.localStorage.clear();
});
