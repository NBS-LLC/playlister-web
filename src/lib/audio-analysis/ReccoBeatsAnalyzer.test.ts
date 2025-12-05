import { config } from "../config";
import { _createMockEnrichedTracks } from "./EnrichedTrack.test-data";
import {
  FetchMultipleTrackDetailsError,
  FetchMultipleTrackFeaturesError,
  ReccoBeatsAnalyzer,
} from "./ReccoBeatsAnalyzer";

type MockHttpClient = (
  input: RequestInfo,
  init?: RequestInit,
) => Promise<Response>;

function createMockHttpErrorResponse(
  status: number,
  statusText: string,
): Response {
  return {
    ok: false,
    status,
    statusText,
    json: jest.fn().mockResolvedValue({}),
  } as unknown as Response;
}

describe(ReccoBeatsAnalyzer.name, () => {
  beforeEach(() => {
    config.appId = "test-app";
    config.appName = "TestApp";
  });

  describe(ReccoBeatsAnalyzer.prototype.findTrackDetails.name, () => {
    it("returns the details of a known track", async () => {
      const mockEnrichedTrack = _createMockEnrichedTracks()[0];
      const mockId = mockEnrichedTrack.id;
      const mockDetails = mockEnrichedTrack.details;

      const mockHttpClient: MockHttpClient = jest
        .fn()
        .mockResolvedValue(Response.json({ content: [mockDetails] }));

      const audioAnalysis = new ReccoBeatsAnalyzer(mockHttpClient);
      const trackDetails = await audioAnalysis.findTrackDetails(mockId);

      expect(mockHttpClient).toHaveBeenCalledTimes(1);
      expect(mockHttpClient).toHaveBeenCalledWith(
        `https://api.reccobeats.com/v1/track?ids=${mockId}`,
      );
      expect(trackDetails).toEqual(mockDetails);
    });

    it("returns null when the track is not found", async () => {
      const mockHttpClient: MockHttpClient = jest
        .fn()
        .mockResolvedValue(Response.json({ content: [] }));

      const audioAnalysis = new ReccoBeatsAnalyzer(mockHttpClient);
      const result = await audioAnalysis.findTrackDetails("abcd1234");
      expect(result).toBeNull();
    });

    it("throws when a server error is encountered", async () => {
      const mockHttpClient: MockHttpClient = jest
        .fn()
        .mockResolvedValue(createMockHttpErrorResponse(500, "Server Error"));

      const audioAnalysis = new ReccoBeatsAnalyzer(mockHttpClient);
      await expect(async () => {
        await audioAnalysis.findTrackDetails("abcd1234");
      }).rejects.toThrow(FetchMultipleTrackDetailsError);
    });
  });

  describe(ReccoBeatsAnalyzer.prototype.findTrackFeatures.name, () => {
    it("returns the features of a known track", async () => {
      const mockEnrichedTrack = _createMockEnrichedTracks()[0];
      const mockId = mockEnrichedTrack.id;
      const mockFeatures = mockEnrichedTrack.features;

      const mockHttpClient: MockHttpClient = jest
        .fn()
        .mockResolvedValue(Response.json({ content: [mockFeatures] }));

      const audioAnalysis = new ReccoBeatsAnalyzer(mockHttpClient);
      const trackFeatures = await audioAnalysis.findTrackFeatures(mockId);

      expect(mockHttpClient).toHaveBeenCalledTimes(1);
      expect(mockHttpClient).toHaveBeenCalledWith(
        `https://api.reccobeats.com/v1/audio-features?ids=${mockId}`,
      );
      expect(trackFeatures).toEqual(mockFeatures);
    });

    it("returns null when the track is not found", async () => {
      const mockHttpClient: MockHttpClient = jest
        .fn()
        .mockResolvedValue(Response.json({ content: [] }));

      const audioAnalysis = new ReccoBeatsAnalyzer(mockHttpClient);
      const result = await audioAnalysis.findTrackFeatures("abcd1234");
      expect(result).toBeNull();
    });

    it("throws when a server error is encountered", async () => {
      const mockHttpClient: MockHttpClient = jest
        .fn()
        .mockResolvedValue(createMockHttpErrorResponse(500, "Server Error"));

      const audioAnalysis = new ReccoBeatsAnalyzer(mockHttpClient);
      await expect(async () => {
        await audioAnalysis.findTrackFeatures("abcd1234");
      }).rejects.toThrow(FetchMultipleTrackFeaturesError);
    });
  });
});
