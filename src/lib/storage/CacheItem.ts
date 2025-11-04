export interface CacheItem<T> {
  data: T;
  expirationDateUtc: string;
  lastAccessedUtc: string;
}
