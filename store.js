import { CACHE_TTL_MS } from "./constants.js";

export function createStore() {
  return {
    bootstrap: null,
    route: { name: "home" },
    selectedUnit: "",
    selectedFiscalYear: null,
    activeModal: null,
    isBusy: false,
    cache: new Map(),
    ui: {
      activityPage: 1,
      activitySearch: "",
      activity12Search: "",
      activity12Filter: "all",
    },
    drafts: new Map(),
  };
}

export function getCache(store, key) {
  const entry = store.cache.get(key);
  if (!entry) {
    return null;
  }
  if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
    store.cache.delete(key);
    return null;
  }
  return entry.value;
}

export function setCache(store, key, value) {
  store.cache.set(key, { value, createdAt: Date.now() });
  return value;
}

export function clearCacheByPrefix(store, prefix) {
  Array.from(store.cache.keys()).forEach((key) => {
    if (key.startsWith(prefix)) {
      store.cache.delete(key);
    }
  });
}
