export interface CacheItem<T> {
  data: T;
  expirationDateUtc: string;
  lastAccessedDateUtc: string;
}

export interface CachedItem<T> extends CacheItem<T> {
  key: string;
}
