const createMemoryStorage = () => {
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
};

const memoryStorage = createMemoryStorage();

export function getStorage() {
  if (
    typeof window !== "undefined" &&
    window.localStorage &&
    typeof window.localStorage.getItem === "function"
  ) {
    return window.localStorage;
  }

  return memoryStorage;
}

export function loadStoredJson(key, fallbackValue) {
  try {
    const value = getStorage().getItem(key);
    return value ? JSON.parse(value) : fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
}

export function saveStoredJson(key, value) {
  try {
    getStorage().setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

export function removeStoredValue(key) {
  try {
    getStorage().removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
}
