import { AudioAnalyzer, GetTrackDetailsError, GetTrackFeaturesError } from ".";
import { TrackDetails } from "./TrackDetails";
import { TrackFeatures } from "./TrackFeatures";

describe(AudioAnalyzer.name, () => {
  describe(AudioAnalyzer.prototype.getTrackDetails.name, () => {
    it("can get details of a known track", async () => {
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

      const audioAnalysis = new AudioAnalyzer(mockHttpClient);
      const trackDetails = await audioAnalysis.getTrackDetails("spotifyId");

      expect(mockHttpClient).toHaveBeenCalledTimes(1);
      expect(mockHttpClient).toHaveBeenCalledWith(
        "https://api.reccobeats.com/v1/track?ids=spotifyId",
      );
      expect(trackDetails).toEqual(mockTrackDetails);
    });

    it("throws an error when the track is not found", async () => {
      const mockHttpClient = jest
        .fn()
        .mockResolvedValue(Response.json({ content: [] }));

      const audioAnalysis = new AudioAnalyzer(mockHttpClient);
      await expect(async () => {
        await audioAnalysis.getTrackDetails("abcd1234");
      }).rejects.toThrow(GetTrackDetailsError);
    });
  });

  describe(AudioAnalyzer.prototype.getTrackFeatures.name, () => {
    it("can get features of a known track", async () => {
      const mockTrackFeatures: TrackFeatures = {
        id: "mock-id",
        href: "https://example.com/mock-track",
        acousticness: 0.5,
        danceability: 0.7,
        energy: 0.6,
        instrumentalness: 0.0,
        key: 5,
        liveness: 0.1,
        loudness: -5.0,
        mode: 1,
        speechiness: 0.05,
        tempo: 120.0,
        valence: 0.8,
      };

      const mockHttpClient = jest
        .fn()
        .mockResolvedValue(Response.json({ content: [mockTrackFeatures] }));

      const audioAnalysis = new AudioAnalyzer(mockHttpClient);
      const trackFeatures = await audioAnalysis.getTrackFeatures("spotifyId");

      expect(mockHttpClient).toHaveBeenCalledTimes(1);
      expect(mockHttpClient).toHaveBeenCalledWith(
        "https://api.reccobeats.com/v1/audio-features?ids=spotifyId",
      );
      expect(trackFeatures).toEqual(mockTrackFeatures);
    });

    it("throws an error when the track is not found", async () => {
      const mockHttpClient = jest
        .fn()
        .mockResolvedValue(Response.json({ content: [] }));

      const audioAnalysis = new AudioAnalyzer(mockHttpClient);
      await expect(async () => {
        await audioAnalysis.getTrackFeatures("abcd1234");
      }).rejects.toThrow(GetTrackFeaturesError);
    });
  });
});
