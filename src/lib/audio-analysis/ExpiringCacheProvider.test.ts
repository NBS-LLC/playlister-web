/**
 * @jest-environment jsdom
 */

import { ExpiringCacheProvider } from "./ExpiringCacheProvider";

describe(ExpiringCacheProvider.name, () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe(ExpiringCacheProvider.prototype.hasTrackDetails.name, () => {
    it("returns true if track details have been cached", async () => {
      localStorage.setItem("trackDetails_abcd1234", "{}");
      const cacheProvider = new ExpiringCacheProvider(localStorage);
      const result = await cacheProvider.hasTrackDetails("abcd1234");
      expect(result).toBeTruthy();
    });

    it("returns false if the track details have not been cached", async () => {
      const cacheProvider = new ExpiringCacheProvider(localStorage);
      const result = await cacheProvider.hasTrackDetails("abcd1234");
      expect(result).toBeFalsy();
    });
  });
});
