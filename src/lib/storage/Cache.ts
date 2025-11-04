import { config } from "../config";
import { log } from "../log";
import { AsyncObjectStorage } from "./AsyncObjectStorage";
import { CacheItem } from "./CacheItem";
import { CacheProvider } from "./CacheProvider";

const SHORT_EXPIRATION_MS = 1 * 24 * 60 * 60 * 1000;
const LONG_EXPIRATION_MS = 90 * 24 * 60 * 60 * 1000;

export class Cache implements CacheProvider {
  constructor(private readonly storage: AsyncObjectStorage) {}

  async find<T>(id: string): Promise<CacheItem<T> | null> {
    const result: CacheItem<T> | null = await this.storage.getItem(
      this.getKey(id),
    );

    if (!result) {
      return null;
    }

    if (new Date() >= new Date(result.expirationDateUtc)) {
      this.storage.removeItem(this.getKey(id));
      return null;
    }

    result.lastAccessedDateUtc = new Date().toISOString();
    await this.storage.setItem(this.getKey(id), result);
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
      lastAccessedDateUtc: new Date().toISOString(),
    };

    await this.storage.setItem(this.getKey(id), cacheItem);
  }

  async prune(): Promise<void> {
    const keys = await this.storage.keys();

    const promises = keys.map(async (key) => {
      if (!key.startsWith(config.namespace)) {
        return;
      }

      const cacheItem = await this.storage.getItem<CacheItem<unknown>>(key);
      if (cacheItem && new Date() >= new Date(cacheItem.expirationDateUtc)) {
        console.debug(log.namespace, `Pruned: ${key} from cache.`);
        await this.storage.removeItem(key);
      }
    });

    await Promise.all(promises);
  }

  async getNamespaceUsageInBytes(): Promise<number> {
    const keys = await this.storage.keys();
    const namespace = config.namespace;
    const namespaceKeys = keys.filter((key) => key.startsWith(namespace));

    let usage = 0;
    for (const key of namespaceKeys) {
      const item = await this.storage.getItem(key);
      usage += this.getItemSizeInBytes(key, item);
    }

    return usage;
  }

  async getAllUsageInBytes(): Promise<number> {
    const keys = await this.storage.keys();

    let usage = 0;
    for (const key of keys) {
      const item = await this.storage.getItem(key);
      usage += this.getItemSizeInBytes(key, item);
    }

    return usage;
  }

  async getNamespaceItemCount(): Promise<number> {
    const keys = await this.storage.keys();
    const namespace = config.namespace;
    const namespaceKeys = keys.filter((key) => key.startsWith(namespace));

    return namespaceKeys.length;
  }

  async getAllItemCount(): Promise<number> {
    const keys = await this.storage.keys();
    return keys.length;
  }

  private getItemSizeInBytes(key: string, value: unknown): number {
    const jsonString = JSON.stringify(value);
    return (
      new TextEncoder().encode(key).length +
      new TextEncoder().encode(jsonString).length
    );
  }

  private getExpirationDateUtc(offsetInMs: number): string {
    return new Date(Date.now() + offsetInMs).toISOString();
  }

  private getKey(id: string): string {
    return `${config.namespace}${id}`;
  }
}
