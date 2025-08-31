import { AudioAnalysis } from ".";
import { TrackDetails } from "./track-details";

describe(AudioAnalysis.name, () => {
  describe(AudioAnalysis.prototype.getTrackDetails.name, () => {
    it("can get details on a known track", async () => {
      const mockTrackDetails: TrackDetails = {
        id: "mock-id",
        trackTitle: "Mock Track",
        artists: [
          {
            id: "mock-artist-id",
            name: "Mock Artist",
            href: "https://example.com/mock-artist",
          },
        ],
        durationMs: 240000,
        isrc: "US-MOCK-00001",
        ean: "1234567890123",
        upc: "123456789012",
        href: "https://example.com/mock-track",
        popularity: 85,
      };

      const mockHttpClient = jest
        .fn()
        .mockResolvedValue(Response.json({ content: [mockTrackDetails] }));

      const audioAnalysis = new AudioAnalysis(mockHttpClient);
      const trackDetails = await audioAnalysis.getTrackDetails("spotifyId");

      expect(mockHttpClient).toHaveBeenCalledTimes(1);
      expect(mockHttpClient).toHaveBeenCalledWith(
        "https://api.reccobeats.com/v1/track?ids=spotifyId",
      );
      expect(trackDetails).toEqual(mockTrackDetails);
    });
  });
});
