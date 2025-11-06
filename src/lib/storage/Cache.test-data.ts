import { CacheItem } from "./CacheItem";

export type TestCacheItem = CacheItem<unknown>;

export class MockAsyncObjectStorage {
  private readonly storage = new Map<string, unknown>();

  async getItem<T>(key: string): Promise<T | null> {
    return (this.storage.get(key) as T) ?? null;
  }

  async setItem<T>(key: string, value: T): Promise<T> {
    this.storage.set(key, value);
    return value;
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async keys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }
}

export class CacheItemBuilder<T> {
  private _data: T | null = null;
  private _expirationDateUtc: string = new Date(
    Date.now() + 100000,
  ).toISOString();
  private _lastAccessedDateUtc: string = new Date().toISOString();

  withData(data: T): this {
    this._data = data;
    return this;
  }

  withExpirationDate(date: Date): this {
    this._expirationDateUtc = date.toISOString();
    return this;
  }

  expired(offset: number = 1000): this {
    this._expirationDateUtc = new Date(Date.now() - offset).toISOString();
    return this;
  }

  valid(offset: number = 100000): this {
    this._expirationDateUtc = new Date(Date.now() + offset).toISOString();
    return this;
  }

  withLastAccessedDate(date: Date): this {
    this._lastAccessedDateUtc = date.toISOString();
    return this;
  }

  build(): CacheItem<T> {
    return {
      data: this._data as T,
      expirationDateUtc: this._expirationDateUtc,
      lastAccessedDateUtc: this._lastAccessedDateUtc,
    };
  }
}

export class CacheTestManager {
  constructor(
    private readonly storage: MockAsyncObjectStorage,
    private readonly config: { appId: string },
  ) {}

  async givenExpiredItem<T>(
    id: string,
    data: T,
    lastAccessedDate?: Date,
  ): Promise<CacheItem<T>> {
    const builder = new CacheItemBuilder<T>().withData(data).expired();
    if (lastAccessedDate) {
      builder.withLastAccessedDate(lastAccessedDate);
    }

    const cacheItem = builder.build();
    const key = this.config.appId ? `${this.config.appId}:${id}` : id;
    await this.storage.setItem(key, cacheItem);
    return cacheItem;
  }

  async givenValidItem<T>(
    id: string,
    data: T,
    lastAccessedDate?: Date,
  ): Promise<CacheItem<T>> {
    const builder = new CacheItemBuilder<T>().withData(data).valid();
    if (lastAccessedDate) {
      builder.withLastAccessedDate(lastAccessedDate);
    }

    const cacheItem = builder.build();
    const key = this.config.appId ? `${this.config.appId}:${id}` : id;
    await this.storage.setItem(key, cacheItem);
    return cacheItem;
  }
}
