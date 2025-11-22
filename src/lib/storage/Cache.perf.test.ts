/**
 * @jest-environment jsdom
 */

import { TextDecoder, TextEncoder } from "util";
Object.assign(global, { TextDecoder, TextEncoder });

import { config } from "../config";
import { Cache } from "./Cache";
import { CacheStats } from "./CacheStats";
import { LocalStorageAdapter } from "./LocalStorageAdapter";

config.appId = "perf-test";

describe(Cache.name, () => {
  let storage: LocalStorageAdapter;
  let cache: Cache;

  describe.skip("performance", () => {
    beforeEach(async () => {
      localStorage.clear();
      storage = await LocalStorageAdapter.create();
      cache = new Cache(storage);
      await createTestData(cache, storage);
      storage.refresh();
    });

    it(Cache.prototype.prune.name, async () => {
      const startTime = performance.now();
      await cache.prune();
      const endTime = performance.now();

      const duration = endTime - startTime;
      console.log(duration);
    });

    it(Cache.prototype.enforceQuota.name, async () => {
      jest.spyOn(console, "debug").mockImplementation();

      const startTime = performance.now();
      await cache.enforceQuota();
      const endTime = performance.now();

      const duration = endTime - startTime;
      console.log(duration);
    });
  });
});

async function createTestData(
  cache: Cache,
  storage: LocalStorageAdapter,
): Promise<void> {
  for (let n = 0; n < 5000; n++) {
    cache.store(n.toString(), "a".repeat(750));
  }

  const cacheStats = new CacheStats(storage);
  console.debug(await cacheStats.getAllUsageInBytes());
}
