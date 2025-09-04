import { AudioAnalyzer, GetTrackDetailsError, GetTrackFeaturesError } from ".";
import { _createMockEnrichedTracks } from "./EnrichedTrack.test-data";

describe(AudioAnalyzer.name, () => {
  describe(AudioAnalyzer.prototype.getTrackDetails.name, () => {
    it("can get details of a known track", async () => {
      const mockEnrichedTrack = _createMockEnrichedTracks()[0];
      const mockId = mockEnrichedTrack.id;
      const mockDetails = mockEnrichedTrack.details;

      const mockHttpClient = jest
        .fn()
        .mockResolvedValue(Response.json({ content: [mockDetails] }));

      const audioAnalysis = new AudioAnalyzer(mockHttpClient);
      const trackDetails = await audioAnalysis.getTrackDetails(mockId);

      expect(mockHttpClient).toHaveBeenCalledTimes(1);
      expect(mockHttpClient).toHaveBeenCalledWith(
        `https://api.reccobeats.com/v1/track?ids=${mockId}`,
      );
      expect(trackDetails).toEqual(mockDetails);
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
      const mockEnrichedTrack = _createMockEnrichedTracks()[0];
      const mockId = mockEnrichedTrack.id;
      const mockFeatures = mockEnrichedTrack.features;

      const mockHttpClient = jest
        .fn()
        .mockResolvedValue(Response.json({ content: [mockFeatures] }));

      const audioAnalysis = new AudioAnalyzer(mockHttpClient);
      const trackFeatures = await audioAnalysis.getTrackFeatures(mockId);

      expect(mockHttpClient).toHaveBeenCalledTimes(1);
      expect(mockHttpClient).toHaveBeenCalledWith(
        `https://api.reccobeats.com/v1/audio-features?ids=${mockId}`,
      );
      expect(trackFeatures).toEqual(mockFeatures);
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

  describe(AudioAnalyzer.prototype.getEnrichedTrack.name, () => {
    it("can get an enriched track for a known track", async () => {
      const mockEnrichedTrack = _createMockEnrichedTracks()[0];
      const mockId = mockEnrichedTrack.id;
      const mockDetails = mockEnrichedTrack.details;
      const mockFeatures = mockEnrichedTrack.features;

      const mockHttpClient = jest
        .fn()
        .mockResolvedValueOnce(Response.json({ content: [mockDetails] }))
        .mockResolvedValueOnce(Response.json({ content: [mockFeatures] }));

      const audioAnalysis = new AudioAnalyzer(mockHttpClient);
      const enrichedTrack = await audioAnalysis.getEnrichedTrack(mockId);

      expect(mockHttpClient).toHaveBeenCalledTimes(2);
      expect(mockHttpClient).toHaveBeenCalledWith(
        `https://api.reccobeats.com/v1/track?ids=${mockId}`,
      );
      expect(mockHttpClient).toHaveBeenCalledWith(
        `https://api.reccobeats.com/v1/audio-features?ids=${mockId}`,
      );

      expect(enrichedTrack).toEqual(mockEnrichedTrack);
    });
  });
});
