/**
 * @jest-environment jsdom
 */

import { TextDecoder, TextEncoder } from "util";
Object.assign(global, { TextDecoder, TextEncoder });

import { randomInt } from "crypto";
import { config } from "../config";
import { Cache } from "./Cache";
import { CacheTestManager } from "./Cache.test-data";
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

      await createTestData(storage, 80);

      const cacheStats = new CacheStats(storage);
      console.debug(await cacheStats.getAllUsageInBytes());
    });

    it(Cache.prototype.prune.name, async () => {
      jest.spyOn(console, "debug").mockImplementation();

      const startMem = process.memoryUsage();
      const startTime = performance.now();
      await cache.prune();
      const endTime = performance.now();
      const endMem = process.memoryUsage();

      const duration = endTime - startTime;
      const memory = endMem.heapUsed - startMem.heapUsed;
      console.log("duration:", duration, "ms");
      console.log("memory:", memory / 1024 / 1024, "MB");
    });

    it(Cache.prototype.enforceQuota.name, async () => {
      jest.spyOn(console, "debug").mockImplementation();

      const startMem = process.memoryUsage();
      const startTime = performance.now();
      await cache.enforceQuota();
      const endTime = performance.now();
      const endMem = process.memoryUsage();

      const duration = endTime - startTime;
      const memory = endMem.heapUsed - startMem.heapUsed;
      console.log("duration:", duration, "ms");
      console.log("memory:", memory / 1024 / 1024, "MB");
    });
  });
});

async function createTestData(
  storage: LocalStorageAdapter,
  percentExpired = 100,
): Promise<void> {
  const t = new CacheTestManager(storage, config);

  for (let n = 0; n < 5000; n++) {
    if (randomInt(100) <= percentExpired) {
      t.givenExpiredItem(n.toString(), "a".repeat(750));
    } else {
      t.givenValidItem(n.toString(), "a".repeat(750));
    }
  }

  storage.refresh();
}
