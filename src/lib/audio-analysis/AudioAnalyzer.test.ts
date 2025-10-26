import { CacheProvider } from "../storage/CacheProvider";
import { AudioAnalysisProvider } from "./AudioAnalysisProvider";
import { AudioAnalyzer, GetTrackDetailsError } from "./AudioAnalyzer";
import { _createMockEnrichedTracks } from "./EnrichedTrack.test-data";

const trackDetails = _createMockEnrichedTracks()[0].details;

const primaryProvider = {
  findTrackDetails: jest.fn(),
  findTrackFeatures: jest.fn(),
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
      expect(primaryProvider.findTrackDetails).not.toHaveBeenCalled();
    });

    it("returns api track details when not cached", async () => {
      cacheProvider.find.mockResolvedValue(null);
      primaryProvider.findTrackDetails.mockResolvedValue(trackDetails);

      const result = await audioAnalyzer.getTrackDetails("abcd1234");
      expect(result).toEqual(trackDetails);

      expect(cacheProvider.find).toHaveBeenCalledWith("trackDetails_abcd1234");
      expect(primaryProvider.findTrackDetails).toHaveBeenCalledWith("abcd1234");
    });

    it("throws an error when api track details are unavailable", async () => {
      cacheProvider.find.mockResolvedValue(null);
      primaryProvider.findTrackDetails.mockResolvedValue(null);

      await expect(async () => {
        await audioAnalyzer.getTrackDetails("unknown");
      }).rejects.toThrow(GetTrackDetailsError);
    });

    it.todo("caches unavailable api track details to prevent spamming the api");
  });
});
