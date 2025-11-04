export interface CacheItem<T> {
  data: T;
  expirationDateUtc: string;
  lastAccessedDateUtc: string;
}
