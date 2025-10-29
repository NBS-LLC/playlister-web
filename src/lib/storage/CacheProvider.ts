import { CacheItem } from "./CacheItem";

export interface CacheProvider {
  find<T>(id: string): Promise<CacheItem<T> | null>;
  store<T>(id: string, data: T): Promise<void>;
}
