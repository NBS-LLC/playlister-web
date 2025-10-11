/**
 * @jest-environment jsdom
 */

import { AsyncObjectStorage } from "../storage/AsyncObjectStorage";
import { LocalStorageAdapter } from "../storage/LocalStorageAdapter";
import { GetTrackDetailsError } from "./AudioAnalysisProvider";
import { CacheExpiredError, CacheItem, NotCachedError } from "./CacheProvider";
import { _createMockEnrichedTracks } from "./EnrichedTrack.test-data";
import { ExpiringCacheProvider } from "./ExpiringCacheProvider";

describe(ExpiringCacheProvider.name, () => {
  let storage: AsyncObjectStorage;

  beforeEach(() => {
    localStorage.clear();
    storage = new LocalStorageAdapter(localStorage);
  });

  describe(ExpiringCacheProvider.prototype.getTrackDetails.name, () => {
    it("returns known cached track details", async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const trackDetails = _createMockEnrichedTracks()[0].details;
      const cacheItem: CacheItem = {
        status: "AUDIO_ANALYSIS_KNOWN",
        data: trackDetails,
        expirationDateUtc: tomorrow.toISOString(),
      };
      localStorage.setItem("trackDetails_abcd1234", JSON.stringify(cacheItem));

      const cacheProvider = new ExpiringCacheProvider(storage);
      const result = await cacheProvider.getTrackDetails("abcd1234");
      expect(result).toEqual(trackDetails);
    });

    it("throws an error when the track details are not cached", async () => {
      const cacheProvider = new ExpiringCacheProvider(storage);
      await expect(async () => {
        await cacheProvider.getTrackDetails("abcd1234");
      }).rejects.toThrow(NotCachedError);
    });

    it("throws an error when the cached data has expired", async () => {
      const oneSecondAgo = new Date(Date.now() - 1000);
      const trackDetails = _createMockEnrichedTracks()[0].details;
      const cacheItem: CacheItem = {
        status: "AUDIO_ANALYSIS_KNOWN",
        data: trackDetails,
        expirationDateUtc: oneSecondAgo.toISOString(),
      };
      localStorage.setItem("trackDetails_abcd1234", JSON.stringify(cacheItem));

      const cacheProvider = new ExpiringCacheProvider(storage);
      await expect(async () => {
        await cacheProvider.getTrackDetails("abcd1234");
      }).rejects.toThrow(CacheExpiredError);
    });

    it("throws an error when the cached data contains unknown audio analysis", async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const cacheItem: CacheItem = {
        status: "AUDIO_ANALYSIS_UNKNOWN",
        data: null,
        expirationDateUtc: tomorrow.toISOString(),
      };
      localStorage.setItem("trackDetails_abcd1234", JSON.stringify(cacheItem));

      const cacheProvider = new ExpiringCacheProvider(storage);
      await expect(async () => {
        await cacheProvider.getTrackDetails("abcd1234");
      }).rejects.toThrow(GetTrackDetailsError);
    });

    it("removes expired cached track details", async () => {
      const oneSecondAgo = new Date(Date.now() - 1000);
      const trackDetails = _createMockEnrichedTracks()[0].details;
      const cacheItem: CacheItem = {
        status: "AUDIO_ANALYSIS_KNOWN",
        data: trackDetails,
        expirationDateUtc: oneSecondAgo.toISOString(),
      };
      localStorage.setItem("trackDetails_abcd1234", JSON.stringify(cacheItem));

      const cacheProvider = new ExpiringCacheProvider(storage);
      try {
        await cacheProvider.getTrackDetails("abcd1234");
      } catch {
        /* Do Nothing */
      }

      expect(localStorage.getItem("trackDetails_abcd1234")).toBeNull();
    });
  });

  describe(ExpiringCacheProvider.prototype.storeTrackDetails.name, () => {
    it("stores known track details for a long duration", async () => {
      const trackDetails = _createMockEnrichedTracks()[0].details;

      const cacheProvider = new ExpiringCacheProvider(storage);
      await cacheProvider.storeTrackDetails("abcd1234", trackDetails);

      const result = localStorage.getItem("trackDetails_abcd1234");
      expect(result).not.toBeNull();

      const cacheItem: CacheItem = JSON.parse(result!);
      expect(cacheItem.data).toEqual(trackDetails);

      const aDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(new Date(cacheItem.expirationDateUtc).getTime()).toBeGreaterThan(
        aDayFromNow.getTime(),
      );
    });

    it("stores unknown track details for a short duration", async () => {
      const cacheProvider = new ExpiringCacheProvider(storage);
      await cacheProvider.storeTrackDetails(
        "abcd1234",
        "AUDIO_ANALYSIS_UNKNOWN",
      );

      const result = localStorage.getItem("trackDetails_abcd1234");
      expect(result).not.toBeNull();

      const cacheItem: CacheItem = JSON.parse(result!);
      expect(cacheItem.data).toEqual(null);

      const aDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(
        new Date(cacheItem.expirationDateUtc).getTime(),
      ).toBeLessThanOrEqual(aDayFromNow.getTime());
    });
  });
});
