import { AsyncObjectStorage } from "./AsyncObjectStorage";
import { CacheItem } from "./CacheItem";
import { CacheProvider } from "./CacheProvider";

const SHORT_EXPIRATION_MS = 1 * 24 * 60 * 60 * 1000;
const LONG_EXPIRATION_MS = 90 * 24 * 60 * 60 * 1000;

export class Cache implements CacheProvider {
  constructor(private readonly storage: AsyncObjectStorage) {}

  async find<T>(id: string): Promise<CacheItem<T> | null> {
    const result: CacheItem<T> | null = await this.storage.getItem(id);

    if (!result) {
      return null;
    }

    if (new Date() >= new Date(result.expirationDateUtc)) {
      this.storage.removeItem(id);
      return null;
    }

    return result;
  }

  async store<T>(id: string, data: T): Promise<void> {
    let expirationDateUtc: string;

    if (data == null) {
      expirationDateUtc = this.getExpirationDateUtc(SHORT_EXPIRATION_MS);
    } else {
      expirationDateUtc = this.getExpirationDateUtc(LONG_EXPIRATION_MS);
    }

    const cacheItem: CacheItem<T> = {
      data,
      expirationDateUtc,
    };

    await this.storage.setItem(id, cacheItem);
  }

  async prune(): Promise<void> {
    const keys = await this.storage.keys();

    const promises = keys.map(async (key) => {
      const cacheItem = await this.storage.getItem<CacheItem<unknown>>(key);
      if (cacheItem && new Date() >= new Date(cacheItem.expirationDateUtc)) {
        await this.storage.removeItem(key);
      }
    });

    await Promise.all(promises);
  }

  private getExpirationDateUtc(offsetInMs: number): string {
    return new Date(Date.now() + offsetInMs).toISOString();
  }
}
