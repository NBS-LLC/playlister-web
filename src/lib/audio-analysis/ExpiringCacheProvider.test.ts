/**
 * @jest-environment jsdom
 */

import { AsyncObjectStorage } from "../storage/AsyncObjectStorage";
import { LocalStorageAdapter } from "../storage/LocalStorageAdapter";
import {
  GetTrackDetailsError,
  GetTrackFeaturesError,
} from "./AudioAnalysisProvider";
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

    it("doesn't confuse track features for track details", async () => {
      // Purposely create track features but NOT track details
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const trackFeatures = _createMockEnrichedTracks()[0].features;
      const cacheItem: CacheItem = {
        status: "AUDIO_ANALYSIS_KNOWN",
        data: trackFeatures,
        expirationDateUtc: tomorrow.toISOString(),
      };
      localStorage.setItem("trackFeatures_abcd1234", JSON.stringify(cacheItem));

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

  describe(ExpiringCacheProvider.prototype.getTrackFeatures.name, () => {
    it("returns known cached track features", async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const trackFeatures = _createMockEnrichedTracks()[0].features;
      const cacheItem: CacheItem = {
        status: "AUDIO_ANALYSIS_KNOWN",
        data: trackFeatures,
        expirationDateUtc: tomorrow.toISOString(),
      };
      localStorage.setItem("trackFeatures_abcd1234", JSON.stringify(cacheItem));

      const cacheProvider = new ExpiringCacheProvider(storage);
      const result = await cacheProvider.getTrackFeatures("abcd1234");
      expect(result).toEqual(trackFeatures);
    });

    it("throws an error when the track features are not cached", async () => {
      const cacheProvider = new ExpiringCacheProvider(storage);
      await expect(async () => {
        await cacheProvider.getTrackFeatures("abcd1234");
      }).rejects.toThrow(NotCachedError);
    });

    it("doesn't confuse track details for track features", async () => {
      // Purposely create track details but NOT track features
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const trackDetails = _createMockEnrichedTracks()[0].details;
      const cacheItem: CacheItem = {
        status: "AUDIO_ANALYSIS_KNOWN",
        data: trackDetails,
        expirationDateUtc: tomorrow.toISOString(),
      };
      localStorage.setItem("trackDetails_abcd1234", JSON.stringify(cacheItem));

      const cacheProvider = new ExpiringCacheProvider(storage);
      await expect(async () => {
        await cacheProvider.getTrackFeatures("abcd1234");
      }).rejects.toThrow(NotCachedError);
    });

    it("throws an error when the cached data has expired", async () => {
      const oneSecondAgo = new Date(Date.now() - 1000);
      const trackFeatures = _createMockEnrichedTracks()[0].features;
      const cacheItem: CacheItem = {
        status: "AUDIO_ANALYSIS_KNOWN",
        data: trackFeatures,
        expirationDateUtc: oneSecondAgo.toISOString(),
      };
      localStorage.setItem("trackFeatures_abcd1234", JSON.stringify(cacheItem));

      const cacheProvider = new ExpiringCacheProvider(storage);
      await expect(async () => {
        await cacheProvider.getTrackFeatures("abcd1234");
      }).rejects.toThrow(CacheExpiredError);
    });

    it("throws an error when the cached data contains unknown audio analysis", async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const cacheItem: CacheItem = {
        status: "AUDIO_ANALYSIS_UNKNOWN",
        data: null,
        expirationDateUtc: tomorrow.toISOString(),
      };
      localStorage.setItem("trackFeatures_abcd1234", JSON.stringify(cacheItem));

      const cacheProvider = new ExpiringCacheProvider(storage);
      await expect(async () => {
        await cacheProvider.getTrackFeatures("abcd1234");
      }).rejects.toThrow(GetTrackFeaturesError);
    });

    it("removes expired cached track features", async () => {
      const oneSecondAgo = new Date(Date.now() - 1000);
      const trackFeatures = _createMockEnrichedTracks()[0].features;
      const cacheItem: CacheItem = {
        status: "AUDIO_ANALYSIS_KNOWN",
        data: trackFeatures,
        expirationDateUtc: oneSecondAgo.toISOString(),
      };
      localStorage.setItem("trackFeatures_abcd1234", JSON.stringify(cacheItem));

      const cacheProvider = new ExpiringCacheProvider(storage);
      try {
        await cacheProvider.getTrackFeatures("abcd1234");
      } catch {
        /* Do Nothing */
      }

      expect(localStorage.getItem("trackFeatures_abcd1234")).toBeNull();
    });
  });

  describe(ExpiringCacheProvider.prototype.storeTrackFeatures.name, () => {
    it("stores known track features for a long duration", async () => {
      const trackFeatures = _createMockEnrichedTracks()[0].features;

      const cacheProvider = new ExpiringCacheProvider(storage);
      await cacheProvider.storeTrackFeatures("abcd1234", trackFeatures);

      const result = localStorage.getItem("trackFeatures_abcd1234");
      expect(result).not.toBeNull();

      const cacheItem: CacheItem = JSON.parse(result!);
      expect(cacheItem.data).toEqual(trackFeatures);

      const aDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(new Date(cacheItem.expirationDateUtc).getTime()).toBeGreaterThan(
        aDayFromNow.getTime(),
      );
    });

    it("stores unknown track features for a short duration", async () => {
      const cacheProvider = new ExpiringCacheProvider(storage);
      await cacheProvider.storeTrackFeatures(
        "abcd1234",
        "AUDIO_ANALYSIS_UNKNOWN",
      );

      const result = localStorage.getItem("trackFeatures_abcd1234");
      expect(result).not.toBeNull();

      const cacheItem: CacheItem = JSON.parse(result!);
      expect(cacheItem.data).toEqual(null);

      const aDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(
        new Date(cacheItem.expirationDateUtc).getTime(),
      ).toBeLessThanOrEqual(aDayFromNow.getTime());
    });
  });

  describe(ExpiringCacheProvider.prototype.prune.name, () => {
    it("removes expired items from the cache", async () => {
      const oneSecondAgo = new Date(Date.now() - 1000);
      const trackDetails = _createMockEnrichedTracks()[0].details;
      const expiredCacheItem: CacheItem = {
        status: "AUDIO_ANALYSIS_KNOWN",
        data: trackDetails,
        expirationDateUtc: oneSecondAgo.toISOString(),
      };
      localStorage.setItem(
        "trackDetails_expired",
        JSON.stringify(expiredCacheItem),
      );

      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const trackFeatures = _createMockEnrichedTracks()[0].features;
      const validCacheItem: CacheItem = {
        status: "AUDIO_ANALYSIS_KNOWN",
        data: trackFeatures,
        expirationDateUtc: tomorrow.toISOString(),
      };
      localStorage.setItem(
        "trackFeatures_valid",
        JSON.stringify(validCacheItem),
      );

      const cacheProvider = new ExpiringCacheProvider(storage);
      await cacheProvider.prune();

      expect(localStorage.getItem("trackDetails_expired")).toBeNull();
      expect(localStorage.getItem("trackFeatures_valid")).not.toBeNull();
    });

    it("does not remove items that are not cache items", async () => {
      localStorage.setItem("not-a-cache-item", "some-value");

      const cacheProvider = new ExpiringCacheProvider(storage);
      await cacheProvider.prune();

      expect(localStorage.getItem("not-a-cache-item")).toEqual("some-value");
    });

    it("handles malformed cache items", async () => {
      localStorage.setItem("trackDetails_malformed", "{ not a json");

      const cacheProvider = new ExpiringCacheProvider(storage);
      // We just expect that this doesn't throw an error.
      await cacheProvider.prune();
    });
  });
});
