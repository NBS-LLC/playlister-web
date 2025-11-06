import { config } from "../config";
import { Cache } from "./Cache";
import {
  CacheTestManager,
  MockAsyncObjectStorage,
  TestCacheItem,
} from "./Cache.test-data";
import { CacheStats } from "./CacheStats";

describe(Cache.name, () => {
  let cache: Cache;
  let storage: MockAsyncObjectStorage;
  let t: CacheTestManager;

  const getKey = (id: string) => `${config.namespace}${id}`;

  beforeEach(() => {
    config.appId = "test-app";
    storage = new MockAsyncObjectStorage();
    cache = new Cache(storage);
    t = new CacheTestManager(storage, config);
  });

  describe(Cache.prototype.find.name, () => {
    it("stores and retrieves a complex object", async () => {
      const id = "complex-object-id";
      const data = {
        a: 1,
        b: "hello",
        c: {
          d: true,
          e: [1, 2, 3],
        },
      };
      await cache.store(id, data);
      const result = await cache.find(id);
      expect(result?.data).toEqual(data);
    });

    it("returns null if item is not in cache", async () => {
      const result = await cache.find("non-existent-id");
      expect(result).toBeNull();
    });

    it("returns null if item is expired", async () => {
      const id = "expired-id";
      await t.givenExpiredItem(id, "");

      const result = await cache.find(id);
      expect(result).toBeNull();
    });

    it("removes the item if it is expired", async () => {
      const id = "expired-id";
      await t.givenExpiredItem(id, "");

      expect(await storage.getItem(getKey(id))).not.toBeNull();

      const result = await cache.find(id);
      expect(result).toBeNull();
      expect(await storage.getItem(getKey(id))).toBeNull();
    });

    it("returns the item if it is not expired", async () => {
      const id = "valid-id";
      const cacheItem = await t.givenValidItem(id, "");

      const result = await cache.find(id);
      expect(result).toEqual(cacheItem);
    });

    it("updates the last accessed date", async () => {
      const id = "valid-id";
      const lastAccessedDate = new Date(Date.now() - 50000);

      await t.givenValidItem(id, "", lastAccessedDate);
      const result = await cache.find(id);
      const updatedItem = await storage.getItem<TestCacheItem>(getKey(id));

      expect(
        new Date(updatedItem?.lastAccessedDateUtc ?? "").getTime(),
      ).toBeGreaterThan(lastAccessedDate.getTime());

      expect(result).toEqual(updatedItem);
    });
  });

  describe(Cache.prototype.store.name, () => {
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

      const storedItem = await storage.getItem<TestCacheItem>(getKey(id));

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

      const storedItem = await storage.getItem<TestCacheItem>(getKey(id));

      expect(storedItem).toBeDefined();
      expect(storedItem?.data).toBeNull();
      expect(storedItem?.expirationDateUtc).toEqual(
        // 1 day
        new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      );
    });

    it("sets an initial last accessed date", async () => {
      const id = "some-id";
      const data = { value: "some-data" };
      await cache.store(id, data);

      const storedItem = await storage.getItem<TestCacheItem>(getKey(id));

      expect(storedItem).toBeDefined();
      expect(storedItem?.lastAccessedDateUtc).toEqual(new Date().toISOString());
    });
  });

  describe(Cache.prototype.prune.name, () => {
    it("removes all expired items and keeps valid ones", async () => {
      const validId1 = "valid-id-1";
      const validId2 = "valid-id-2";

      await t.givenExpiredItem("expired-id-1", "expired-data-1");
      await t.givenExpiredItem("expired-id-2", "expired-data-2");
      const validItem1 = await t.givenValidItem(validId1, "valid-data-1");
      const validItem2 = await t.givenValidItem(validId2, "valid-data-2");

      await cache.prune();

      expect(await storage.keys()).toEqual([
        getKey(validId1),
        getKey(validId2),
      ]);

      expect(await storage.getItem(getKey(validId1))).toEqual(validItem1);
      expect(await storage.getItem(getKey(validId2))).toEqual(validItem2);
    });

    it("does nothing if there are no expired items", async () => {
      const validId1 = "valid-id-1";
      const validId2 = "valid-id-2";

      const validItem1 = await t.givenValidItem(validId1, "valid-data-1");
      const validItem2 = await t.givenValidItem(validId2, "valid-data-2");

      await cache.prune();

      expect(await storage.keys()).toEqual([
        getKey(validId1),
        getKey(validId2),
      ]);

      expect(await storage.getItem(getKey(validId1))).toEqual(validItem1);
      expect(await storage.getItem(getKey(validId2))).toEqual(validItem2);
    });

    it("removes all items if all are expired", async () => {
      await t.givenExpiredItem("expired-id-1", "expired-data-1");
      await t.givenExpiredItem("expired-id-2", "expired-data-2");

      await cache.prune();

      expect(await storage.keys()).toEqual([]);
    });

    it("does nothing if cache is empty", async () => {
      await cache.prune();
      expect(await storage.keys()).toEqual([]);
    });

    it("does not remove items that are not valid CacheItem objects", async () => {
      const malformedId = "malformed-id";
      const malformedItem = { some: "data" }; // Not a CacheItem

      await storage.setItem(malformedId, malformedItem);

      await cache.prune();

      expect(await storage.keys()).toEqual([malformedId]);
      expect(await storage.getItem(malformedId)).toEqual(malformedItem);
    });
  });

  describe("isolation", () => {
    it("finds and stores by namespace", async () => {
      const id = "some-id";
      const data1 = { value: "some-data-1" };
      const data2 = { value: "some-data-2" };

      config.appId = "app1";
      await cache.store(id, data1);

      config.appId = "app2";
      await cache.store(id, data2);

      config.appId = "app1";
      const result1 = await cache.find(id);
      expect(result1?.data).toEqual(data1);

      config.appId = "app2";
      const result2 = await cache.find(id);
      expect(result2?.data).toEqual(data2);
    });

    it("prunes by namespace", async () => {
      config.appId = "app1";
      const exItemApp1 = await t.givenExpiredItem("expired-app1", "");

      config.appId = "app2";
      await t.givenExpiredItem("expired-app2", "");
      const validItemApp2 = await t.givenValidItem("valid-app2", "");

      // appId = "app2"
      await cache.prune();

      expect(await storage.getItem("app1:expired-app1")).toEqual(exItemApp1);
      expect(await storage.getItem("app2:expired-app2")).toBeNull();
      expect(await storage.getItem("app2:valid-app2")).toEqual(validItemApp2);

      config.appId = "app1";
      await cache.prune();

      expect(await storage.getItem("app1:expired-app1")).toBeNull();
      expect(await storage.getItem("app2:valid-app2")).toEqual(validItemApp2);
    });
  });

  describe("quota", () => {
    beforeEach(() => {
      config.cacheQuotaMaxBytes = 1024;
      config.cacheQuotaTargetBytes = 500;
    });

    it.todo("prunes to recover storage space");
    it("prunes then removes least accessed items", async () => {
      const id1 = "valid-recent-1";
      const validRecent1 = await t.givenValidItem(
        id1,
        "data-1",
        new Date(Date.now()),
      );

      const id2 = "valid-old-2";
      const validOld2 = await t.givenValidItem(
        id2,
        "data-2",
        new Date(Date.now() - 100000),
      );

      const id3 = "valid-recent-3";
      const validRecent3 = await t.givenValidItem(
        id3,
        "data-3",
        new Date(Date.now() - 50000),
      );

      const id4 = "expired-recent-4";
      const expiredRecent4 = await t.givenExpiredItem(
        id4,
        "data-4",
        new Date(Date.now()),
      );

      const id5 = "expired-old-5";
      const expiredOld5 = await t.givenExpiredItem(
        id5,
        "data-5",
        new Date(Date.now() - 80000),
      );

      const id6 = "valid-recent-6";
      const validRecent6 = await t.givenValidItem(
        id6,
        "data-6",
        new Date(Date.now() - 2000),
      );

      const id7 = "valid-old-7";
      const validOld7 = await t.givenValidItem(
        id7,
        "data-7",
        new Date(Date.now() - 75000),
      );

      const id8 = "valid-recent-8";
      const validRecent8 = await t.givenValidItem(
        id8,
        "data-8",
        new Date(Date.now()),
      );

      config.cacheQuotaMaxBytes =
        CacheStats.getItemSizeInBytes(id1, validRecent1) +
        CacheStats.getItemSizeInBytes(id2, validOld2) +
        CacheStats.getItemSizeInBytes(id3, validRecent3) +
        CacheStats.getItemSizeInBytes(id4, expiredRecent4) +
        CacheStats.getItemSizeInBytes(id5, expiredOld5) +
        CacheStats.getItemSizeInBytes(id6, validRecent6) +
        CacheStats.getItemSizeInBytes(id7, validOld7) +
        CacheStats.getItemSizeInBytes(id8, validRecent8);

      config.cacheQuotaTargetBytes =
        config.cacheQuotaMaxBytes -
        (CacheStats.getItemSizeInBytes(id2, validOld2) +
          CacheStats.getItemSizeInBytes(id4, expiredRecent4) +
          CacheStats.getItemSizeInBytes(id5, expiredOld5) +
          CacheStats.getItemSizeInBytes(id7, validOld7));

      console.log(config.cacheQuotaMaxBytes);
      console.log(config.cacheQuotaTargetBytes);

      const additionalItemId = "additional-item";
      await cache.store(additionalItemId, "additional-data");
      const additionalItem = await cache.find(additionalItemId);
      console.log(
        CacheStats.getItemSizeInBytes(additionalItemId, additionalItem),
      );

      expect((await cache.find(additionalItemId))?.data).toEqual(
        "additional-data",
      );

      expect(await storage.keys()).toHaveLength(5);

      expect(await cache.find(id1)).toEqual(validRecent1);
      expect(await cache.find(id3)).toEqual(validRecent3);
      expect(await cache.find(id6)).toEqual(validRecent6);
      expect(await cache.find(id8)).toEqual(validRecent8);

      expect(await cache.find(id2)).toBeNull();
      expect(await cache.find(id4)).toBeNull();
      expect(await cache.find(id5)).toBeNull();
      expect(await cache.find(id7)).toBeNull();

      const cacheStats = new CacheStats(storage);
      expect(await cacheStats.getNamespaceUsageInBytes()).toBeLessThanOrEqual(
        config.cacheQuotaTargetBytes,
      );
    });
    it.todo("does nothing if quota is not reached");
  });
});
