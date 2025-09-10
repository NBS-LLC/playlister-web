import { AudioAnalysisProvider } from "./AudioAnalysisProvider";
import { AudioAnalyzer } from "./AudioAnalyzer";

describe(AudioAnalyzer.name, () => {
  let primaryProvider: jest.Mocked<AudioAnalysisProvider>;
  let audioAnalyzer: AudioAnalyzer;

  beforeEach(() => {
    primaryProvider = {
      getTrackDetails: jest.fn(),
      getTrackFeatures: jest.fn(),
      getEnrichedTrack: jest.fn(),
    };
    audioAnalyzer = new AudioAnalyzer(primaryProvider);
  });

  describe(AudioAnalyzer.prototype.getTrackDetails.name, () => {
    it("should delegate to the primary provider", async () => {
      await audioAnalyzer.getTrackDetails("spotifyId");
      expect(primaryProvider.getTrackDetails).toHaveBeenCalledTimes(1);
      expect(primaryProvider.getTrackDetails).toHaveBeenCalledWith("spotifyId");
    });
  });
});
