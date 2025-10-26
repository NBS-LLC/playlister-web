import { CacheProvider } from "../storage/CacheProvider";
import { AudioAnalysisProvider } from "./AudioAnalysisProvider";
import { AudioAnalyzer } from "./AudioAnalyzer";
import { _createMockEnrichedTracks } from "./EnrichedTrack.test-data";

const trackDetails = _createMockEnrichedTracks()[0].details;

const primaryProvider = {
  getTrackDetails: jest.fn(),
  getTrackFeatures: jest.fn(),
  getEnrichedTrack: jest.fn(),
} as jest.Mocked<AudioAnalysisProvider>;

const cacheProvider = {
  find: jest.fn(),
  store: jest.fn(),
} as jest.Mocked<CacheProvider>;

describe(AudioAnalyzer.name, () => {
  let audioAnalyzer: AudioAnalyzer;

  beforeEach(() => {
    jest.clearAllMocks();
    audioAnalyzer = new AudioAnalyzer(primaryProvider, cacheProvider);
  });

  describe(AudioAnalyzer.prototype.getTrackDetails.name, () => {
    it("returns cached track details", async () => {
      cacheProvider.find.mockResolvedValue({
        data: trackDetails,
        expirationDateUtc: "",
      });

      const result = await audioAnalyzer.getTrackDetails("abcd1234");
      expect(result).toEqual(trackDetails);

      expect(cacheProvider.find).toHaveBeenCalledWith("trackDetails_abcd1234");
      expect(primaryProvider.getTrackDetails).not.toHaveBeenCalled();
    });

    it("returns api track details when not cached", async () => {
      cacheProvider.find.mockResolvedValue(null);
      primaryProvider.getTrackDetails.mockResolvedValue(trackDetails);

      const result = await audioAnalyzer.getTrackDetails("abcd1234");
      expect(result).toEqual(trackDetails);

      expect(cacheProvider.find).toHaveBeenCalledWith("trackDetails_abcd1234");
      expect(primaryProvider.getTrackDetails).toHaveBeenCalledWith("abcd1234");
    });
    it.todo("throws an error when api track details are unavailable");
    it.todo("caches unavailable api track details to prevent spamming the api");
  });
});
