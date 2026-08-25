export class StorageManager {
  constructor(key) {
    this.key = key;
  }

  load(fallback) {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return structuredClone(fallback);
      return { ...structuredClone(fallback), ...JSON.parse(raw) };
    } catch {
      return structuredClone(fallback);
    }
  }

  save(state) {
    try {
      const safeState = { ...state };
      delete safeState.uploads;
      localStorage.setItem(this.key, JSON.stringify(safeState));
      return true;
    } catch {
      return false;
    }
  }

  clear() {
    try {
      localStorage.removeItem(this.key);
    } catch {
      // Storage can be unavailable in private or restricted browser contexts.
    }
  }
}
