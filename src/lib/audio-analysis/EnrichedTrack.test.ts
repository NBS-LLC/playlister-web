import { EnrichedTrack } from "./EnrichedTrack";
import { _createMockEnrichedTracks } from "./EnrichedTrack.test-data";

describe(EnrichedTrack.name, () => {
  describe(EnrichedTrack.prototype.toString.name, () => {
    it("returns a formatted string", () => {
      const track = _createMockEnrichedTracks()[0];
      expect(track.toString()).toBe(
        "Black Milk by Massive Attack (168.081 Dbm 12A)",
      );
    });
  });
});
