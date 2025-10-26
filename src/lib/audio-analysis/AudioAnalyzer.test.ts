import { CacheProvider } from "../storage/CacheProvider";
import { AudioAnalysisProvider } from "./AudioAnalysisProvider";
import {
  AudioAnalyzer,
  GetEnrichedTrackError,
  GetTrackDetailsError,
  GetTrackFeaturesError,
} from "./AudioAnalyzer";
import { EnrichedTrack } from "./EnrichedTrack";
import { _createMockEnrichedTracks } from "./EnrichedTrack.test-data";

const trackDetails = _createMockEnrichedTracks()[0].details;
const trackFeatures = _createMockEnrichedTracks()[0].features;

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

    it("caches api track details", async () => {
      cacheProvider.find.mockResolvedValue(null);
      primaryProvider.findTrackDetails.mockResolvedValue(trackDetails);

      const result = await audioAnalyzer.getTrackDetails("abcd1234");
      expect(result).toEqual(trackDetails);

      expect(cacheProvider.store).toHaveBeenCalledWith(
        "trackDetails_abcd1234",
        trackDetails,
      );
    });

    it("throws when api track details are unavailable", async () => {
      cacheProvider.find.mockResolvedValue(null);
      primaryProvider.findTrackDetails.mockResolvedValue(null);

      await expect(async () => {
        await audioAnalyzer.getTrackDetails("unknown");
      }).rejects.toThrow(GetTrackDetailsError);

      expect(cacheProvider.find).toHaveBeenCalledWith("trackDetails_unknown");
      expect(primaryProvider.findTrackDetails).toHaveBeenCalledWith("unknown");
    });

    it("caches unavailable api track details", async () => {
      cacheProvider.find.mockResolvedValue(null);
      primaryProvider.findTrackDetails.mockResolvedValue(null);

      await expect(async () => {
        await audioAnalyzer.getTrackDetails("unknown");
      }).rejects.toThrow(GetTrackDetailsError);

      expect(cacheProvider.store).toHaveBeenCalledWith(
        "trackDetails_unknown",
        null,
      );
    });

    it("throws when details are cached as unavailable", async () => {
      cacheProvider.find.mockResolvedValue({
        data: null,
        expirationDateUtc: "",
      });

      await expect(async () => {
        await audioAnalyzer.getTrackDetails("unknown");
      }).rejects.toThrow(GetTrackDetailsError);

      expect(cacheProvider.find).toHaveBeenCalledWith("trackDetails_unknown");
      expect(primaryProvider.findTrackDetails).not.toHaveBeenCalled();
    });
  });

  describe(AudioAnalyzer.prototype.getTrackFeatures.name, () => {
    it("returns cached track features", async () => {
      cacheProvider.find.mockResolvedValue({
        data: trackFeatures,
        expirationDateUtc: "",
      });

      const result = await audioAnalyzer.getTrackFeatures("abcd1234");
      expect(result).toEqual(trackFeatures);

      expect(cacheProvider.find).toHaveBeenCalledWith("trackFeatures_abcd1234");
      expect(primaryProvider.findTrackFeatures).not.toHaveBeenCalled();
    });

    it("returns api track features when not cached", async () => {
      cacheProvider.find.mockResolvedValue(null);
      primaryProvider.findTrackFeatures.mockResolvedValue(trackFeatures);

      const result = await audioAnalyzer.getTrackFeatures("abcd1234");
      expect(result).toEqual(trackFeatures);

      expect(cacheProvider.find).toHaveBeenCalledWith("trackFeatures_abcd1234");
      expect(primaryProvider.findTrackFeatures).toHaveBeenCalledWith(
        "abcd1234",
      );
    });

    it("caches api track features", async () => {
      cacheProvider.find.mockResolvedValue(null);
      primaryProvider.findTrackFeatures.mockResolvedValue(trackFeatures);

      const result = await audioAnalyzer.getTrackFeatures("abcd1234");
      expect(result).toEqual(trackFeatures);

      expect(cacheProvider.store).toHaveBeenCalledWith(
        "trackFeatures_abcd1234",
        trackFeatures,
      );
    });

    it("throws when api track features are unavailable", async () => {
      cacheProvider.find.mockResolvedValue(null);
      primaryProvider.findTrackFeatures.mockResolvedValue(null);

      await expect(async () => {
        await audioAnalyzer.getTrackFeatures("unknown");
      }).rejects.toThrow(GetTrackFeaturesError);

      expect(cacheProvider.find).toHaveBeenCalledWith("trackFeatures_unknown");
      expect(primaryProvider.findTrackFeatures).toHaveBeenCalledWith("unknown");
    });

    it("caches unavailable api track features", async () => {
      cacheProvider.find.mockResolvedValue(null);
      primaryProvider.findTrackFeatures.mockResolvedValue(null);

      await expect(async () => {
        await audioAnalyzer.getTrackFeatures("unknown");
      }).rejects.toThrow(GetTrackFeaturesError);

      expect(cacheProvider.store).toHaveBeenCalledWith(
        "trackFeatures_unknown",
        null,
      );
    });

    it("throws when features are cached as unavailable", async () => {
      cacheProvider.find.mockResolvedValue({
        data: null,
        expirationDateUtc: "",
      });

      await expect(async () => {
        await audioAnalyzer.getTrackFeatures("unknown");
      }).rejects.toThrow(GetTrackFeaturesError);

      expect(cacheProvider.find).toHaveBeenCalledWith("trackFeatures_unknown");
      expect(primaryProvider.findTrackFeatures).not.toHaveBeenCalled();
    });
  });

  describe(AudioAnalyzer.prototype.getEnrichedTrack.name, () => {
    it("returns an enriched track", async () => {
      jest
        .spyOn(audioAnalyzer, "getTrackDetails")
        .mockResolvedValue(trackDetails);
      jest
        .spyOn(audioAnalyzer, "getTrackFeatures")
        .mockResolvedValue(trackFeatures);

      const result = await audioAnalyzer.getEnrichedTrack("abcd1234");

      expect(result).toBeInstanceOf(EnrichedTrack);
      expect(result.id).toEqual("abcd1234");
      expect(result.details).toEqual(trackDetails);
      expect(result.features).toEqual(trackFeatures);
    });

    it("throws when track details are unavailable", async () => {
      jest
        .spyOn(audioAnalyzer, "getTrackDetails")
        .mockRejectedValue(new GetTrackDetailsError());
      jest
        .spyOn(audioAnalyzer, "getTrackFeatures")
        .mockResolvedValue(trackFeatures);

      await expect(async () => {
        await audioAnalyzer.getEnrichedTrack("unknown");
      }).rejects.toThrow(GetEnrichedTrackError);
    });

    it("throws when track features are unavailable", async () => {
      jest
        .spyOn(audioAnalyzer, "getTrackDetails")
        .mockResolvedValue(trackDetails);
      jest
        .spyOn(audioAnalyzer, "getTrackFeatures")
        .mockRejectedValue(new GetTrackFeaturesError());

      await expect(async () => {
        await audioAnalyzer.getEnrichedTrack("unknown");
      }).rejects.toThrow(GetEnrichedTrackError);
    });
  });
});
