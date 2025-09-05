import { EnrichedTrack } from "./EnrichedTrack";
import { _createMockEnrichedTracks } from "./EnrichedTrack.test-data";

describe(EnrichedTrack.name, () => {
  describe(EnrichedTrack.prototype.getHumanReadableString.name, () => {
    it("returns a human readable formatted string", () => {
      const track = _createMockEnrichedTracks()[0];
      expect(track.getHumanReadableString()).toBe(
        "Black Milk by Massive Attack (168.081 Dbm 12A)",
      );
    });
  });
  describe(EnrichedTrack.prototype.getStatsString.name, () => {
    it("returns a formatted stats string with rounded tempo", () => {
      const track = _createMockEnrichedTracks()[0];
      expect(track.getStatsString()).toBe("168 | Dbm | 12A");
    });
  });
});
