import { config } from "../config";
import { Cache } from "./Cache";
import { MockAsyncObjectStorage } from "./Cache.test-data";
import { CacheStats } from "./CacheStats";

describe(CacheStats.name, () => {
  let cache: Cache;
  let cacheStats: CacheStats;
  let storage: MockAsyncObjectStorage;

  beforeEach(() => {
    config.appId = "test-app";
    storage = new MockAsyncObjectStorage();
    cache = new Cache(storage);
    cacheStats = new CacheStats(storage);
  });

  describe(CacheStats.prototype.getNamespaceUsageInBytes.name, () => {
    it("returns 0 for an empty namespace", async () => {
      config.appId = "app1";
      const usage = await cacheStats.getNamespaceUsageInBytes();
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

      const usage = await cacheStats.getNamespaceUsageInBytes();
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

      const usage = await cacheStats.getNamespaceUsageInBytes();
      expect(usage).toBe(expectedUsage);
    });
  });

  describe(CacheStats.prototype.getAllUsageInBytes.name, () => {
    it("returns 0 for an empty cache", async () => {
      const usage = await cacheStats.getAllUsageInBytes();
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

      const usage = await cacheStats.getAllUsageInBytes();
      expect(usage).toBe(size1 + size2);
    });
  });

  describe(CacheStats.prototype.getNamespaceItemCount.name, () => {
    it("returns 0 for an empty namespace", async () => {
      config.appId = "app1";
      const count = await cacheStats.getNamespaceItemCount();
      expect(count).toBe(0);
    });

    it("returns the correct count for a namespace with items", async () => {
      config.appId = "app1";
      await cache.store("item1", { msg: "a" });
      await cache.store("item2", { msg: "b" });

      const count = await cacheStats.getNamespaceItemCount();
      expect(count).toBe(2);
    });

    it("does not include items from other namespaces", async () => {
      config.appId = "app1";
      await cache.store("item1", { msg: "a" });

      config.appId = "app2";
      await cache.store("item2", { msg: "b" });

      config.appId = "app1";
      const count = await cacheStats.getNamespaceItemCount();
      expect(count).toBe(1);
    });
  });

  describe(CacheStats.prototype.getAllItemCount.name, () => {
    it("returns 0 for an empty cache", async () => {
      const count = await cacheStats.getAllItemCount();
      expect(count).toBe(0);
    });

    it("returns the correct total count for the entire cache", async () => {
      config.appId = "app1";
      await cache.store("item1", { msg: "a" });

      config.appId = "app2";
      await cache.store("item2", { msg: "b" });

      const count = await cacheStats.getAllItemCount();
      expect(count).toBe(2);
    });
  });
});
