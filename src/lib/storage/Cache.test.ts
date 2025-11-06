import { config } from "../config";
import { Cache } from "./Cache";
import {
  CacheTestManager,
  MockAsyncObjectStorage,
  TestCacheItem,
} from "./Cache.test-data";

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

  describe(Cache.prototype.getNamespaceUsageInBytes.name, () => {
    it("returns 0 for an empty namespace", async () => {
      config.appId = "app1";
      const usage = await cache.getNamespaceUsageInBytes();
      expect(usage).toBe(0);
    });

    it("returns the correct usage for a namespace with items", async () => {
      config.appId = "app1";
      await cache.store("item1", { msg: "a" });
      await cache.store("item2", { msg: "b" });

      const key1 = "app1:item1";
      const item1 = await storage.getItem(key1);
      const size1 = key1.length + JSON.stringify(item1).length;

      const key2 = "app1:item2";
      const item2 = await storage.getItem(key2);
      const size2 = key2.length + JSON.stringify(item2).length;

      const usage = await cache.getNamespaceUsageInBytes();
      expect(usage).toBe(size1 + size2);
    });

    it("does not include usage from other namespaces", async () => {
      config.appId = "app1";
      await cache.store("item1", { msg: "a" });

      config.appId = "app2";
      await cache.store("item2", { msg: "b" });

      config.appId = "app1";

      const key1 = "app1:item1";
      const item1 = await storage.getItem(key1);
      const expectedUsage = key1.length + JSON.stringify(item1).length;

      const usage = await cache.getNamespaceUsageInBytes();
      expect(usage).toBe(expectedUsage);
    });
  });

  describe(Cache.prototype.getAllUsageInBytes.name, () => {
    it("returns 0 for an empty cache", async () => {
      const usage = await cache.getAllUsageInBytes();
      expect(usage).toBe(0);
    });

    it("returns the correct total usage for the entire cache", async () => {
      config.appId = "app1";
      await cache.store("item1", { msg: "a" });

      config.appId = "app2";
      await cache.store("item2", { msg: "b" });

      const key1 = "app1:item1";
      const item1 = await storage.getItem(key1);
      const size1 = key1.length + JSON.stringify(item1).length;

      const key2 = "app2:item2";
      const item2 = await storage.getItem(key2);
      const size2 = key2.length + JSON.stringify(item2).length;

      const usage = await cache.getAllUsageInBytes();
      expect(usage).toBe(size1 + size2);
    });
  });

  describe(Cache.prototype.getNamespaceItemCount.name, () => {
    it("returns 0 for an empty namespace", async () => {
      config.appId = "app1";
      const count = await cache.getNamespaceItemCount();
      expect(count).toBe(0);
    });

    it("returns the correct count for a namespace with items", async () => {
      config.appId = "app1";
      await cache.store("item1", { msg: "a" });
      await cache.store("item2", { msg: "b" });

      const count = await cache.getNamespaceItemCount();
      expect(count).toBe(2);
    });

    it("does not include items from other namespaces", async () => {
      config.appId = "app1";
      await cache.store("item1", { msg: "a" });

      config.appId = "app2";
      await cache.store("item2", { msg: "b" });

      config.appId = "app1";
      const count = await cache.getNamespaceItemCount();
      expect(count).toBe(1);
    });
  });

  describe(Cache.prototype.getAllItemCount.name, () => {
    it("returns 0 for an empty cache", async () => {
      const count = await cache.getAllItemCount();
      expect(count).toBe(0);
    });

    it("returns the correct total count for the entire cache", async () => {
      config.appId = "app1";
      await cache.store("item1", { msg: "a" });

      config.appId = "app2";
      await cache.store("item2", { msg: "b" });

      const count = await cache.getAllItemCount();
      expect(count).toBe(2);
    });
  });

  describe("quota", () => {
    it.todo("prunes to recover storage space");
    it.todo("prunes then removes least accessed items");
    it.todo("does nothing if quota is not reached");
  });
});
