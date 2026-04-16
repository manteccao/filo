const TTL = 5 * 60 * 1000;

type Entry<T> = { data: T; ts: number };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const store = new Map<string, Entry<any>>();

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function cacheSet<T>(key: string, data: T): void {
  store.set(key, { data, ts: Date.now() });
}

export function cacheInvalidate(key: string): void {
  store.delete(key);
}
