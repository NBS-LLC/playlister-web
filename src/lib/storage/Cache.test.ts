import { AsyncObjectStorage } from "./AsyncObjectStorage";
import { Cache } from "./Cache";
import { CacheItem } from "./CacheItem";

class MockAsyncObjectStorage implements AsyncObjectStorage {
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

describe(Cache.name, () => {
  let cache: Cache;
  let storage: MockAsyncObjectStorage;

  beforeEach(() => {
    storage = new MockAsyncObjectStorage();
    cache = new Cache(storage);
  });

  describe(Cache.prototype.find.name, () => {
    it("returns null if item is not in cache", async () => {
      const result = await cache.find("non-existent-id");
      expect(result).toBeNull();
    });

    it("returns null if item is expired", async () => {
      const id = "expired-id";
      const data = { value: "some-data" };
      const expirationDateUtc = new Date(Date.now() - 1000).toISOString();
      const cacheItem: CacheItem<typeof data> = {
        data,
        expirationDateUtc,
      };

      await storage.setItem(id, cacheItem);
      const result = await cache.find(id);
      expect(result).toBeNull();
    });

    it("returns the item if it is not expired", async () => {
      const id = "valid-id";
      const data = { value: "some-data" };
      const expirationDateUtc = new Date(Date.now() + 100000).toISOString();
      const cacheItem: CacheItem<typeof data> = {
        data,
        expirationDateUtc,
      };

      await storage.setItem(id, cacheItem);
      const result = await cache.find(id);
      expect(result).toEqual(cacheItem);
    });
  });

  describe("store", () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it("stores item with long expiration for non-null data", async () => {
      const id = "some-id";
      const data = { value: "some-data" };
      await cache.store(id, data);

      const storedItem = await storage.getItem<{
        data: unknown;
        expirationDateUtc: string;
      }>(id);

      expect(storedItem).toBeDefined();
      expect(storedItem?.data).toEqual(data);
      expect(storedItem?.expirationDateUtc).toEqual(
        // 90 days
        new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      );
    });

    it("stores item with short expiration for null data", async () => {
      const id = "some-id-null";
      const data = null;
      await cache.store(id, data);

      const storedItem = await storage.getItem<{
        data: unknown;
        expirationDateUtc: string;
      }>(id);

      expect(storedItem).toBeDefined();
      expect(storedItem?.data).toBeNull();
      expect(storedItem?.expirationDateUtc).toEqual(
        // 1 day
        new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      );
    });
  });

  describe(Cache.prototype.prune.name, () => {
    it("removes all expired items and keeps valid ones", async () => {
      const expiredId1 = "expired-id-1";
      const expiredId2 = "expired-id-2";
      const validId1 = "valid-id-1";
      const validId2 = "valid-id-2";

      const expiredItem1: CacheItem<string> = {
        data: "expired-data-1",
        expirationDateUtc: "2024-01-01T00:00:00.000Z",
      };
      const expiredItem2: CacheItem<string> = {
        data: "expired-data-2",
        expirationDateUtc: "2024-01-02T00:00:00.000Z",
      };
      const validItem1: CacheItem<string> = {
        data: "valid-data-1",
        expirationDateUtc: new Date(Date.now() + 100000).toISOString(),
      };
      const validItem2: CacheItem<string> = {
        data: "valid-data-2",
        expirationDateUtc: new Date(Date.now() + 200000).toISOString(),
      };

      await storage.setItem(expiredId1, expiredItem1);
      await storage.setItem(expiredId2, expiredItem2);
      await storage.setItem(validId1, validItem1);
      await storage.setItem(validId2, validItem2);

      expect(await storage.keys()).toEqual([
        expiredId1,
        expiredId2,
        validId1,
        validId2,
      ]);

      await cache.prune();

      expect(await storage.keys()).toEqual([validId1, validId2]);
      expect(await storage.getItem(expiredId1)).toBeNull();
      expect(await storage.getItem(expiredId2)).toBeNull();
      expect(await storage.getItem(validId1)).toEqual(validItem1);
      expect(await storage.getItem(validId2)).toEqual(validItem2);
    });

    it("does nothing if there are no expired items", async () => {
      const validId1 = "valid-id-1";
      const validId2 = "valid-id-2";

      const validItem1: CacheItem<string> = {
        data: "valid-data-1",
        expirationDateUtc: new Date(Date.now() + 100000).toISOString(),
      };
      const validItem2: CacheItem<string> = {
        data: "valid-data-2",
        expirationDateUtc: new Date(Date.now() + 200000).toISOString(),
      };

      await storage.setItem(validId1, validItem1);
      await storage.setItem(validId2, validItem2);

      expect(await storage.keys()).toEqual([validId1, validId2]);

      await cache.prune();

      expect(await storage.keys()).toEqual([validId1, validId2]);
      expect(await storage.getItem(validId1)).toEqual(validItem1);
      expect(await storage.getItem(validId2)).toEqual(validItem2);
    });

    it("removes all items if all are expired", async () => {
      const expiredId1 = "expired-id-1";
      const expiredId2 = "expired-id-2";

      const expiredItem1: CacheItem<string> = {
        data: "expired-data-1",
        expirationDateUtc: "2024-01-01T00:00:00.000Z",
      };
      const expiredItem2: CacheItem<string> = {
        data: "expired-data-2",
        expirationDateUtc: "2024-01-02T00:00:00.000Z",
      };

      await storage.setItem(expiredId1, expiredItem1);
      await storage.setItem(expiredId2, expiredItem2);

      expect(await storage.keys()).toEqual([expiredId1, expiredId2]);

      await cache.prune();

      expect(await storage.keys()).toEqual([]);
      expect(await storage.getItem(expiredId1)).toBeNull();
      expect(await storage.getItem(expiredId2)).toBeNull();
    });

    it("does nothing if cache is empty", async () => {
      expect(await storage.keys()).toEqual([]);
      await cache.prune();
      expect(await storage.keys()).toEqual([]);
    });
  });
});
