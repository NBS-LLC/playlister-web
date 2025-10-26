import { CacheProvider } from "../storage/CacheProvider";
import { AudioAnalysisProvider } from "./AudioAnalysisProvider";
import { EnrichedTrack } from "./EnrichedTrack";
import { TrackDetails } from "./TrackDetails";
import { TrackFeatures } from "./TrackFeatures";

export class GetTrackDetailsError extends Error {}
export class GetTrackFeaturesError extends Error {}

export class AudioAnalyzer {
  constructor(
    private readonly primaryProvider: AudioAnalysisProvider,
    private readonly cacheProvider: CacheProvider,
  ) {}

  async getTrackDetails(id: string): Promise<TrackDetails> {
    const cacheKey = `trackDetails_${id}`;
    const cacheItem = await this.cacheProvider.find<TrackDetails>(cacheKey);

    let result: TrackDetails | null;
    let fromCache = false;

    if (cacheItem) {
      result = cacheItem.data;
      fromCache = true;
    } else {
      result = await this.primaryProvider.findTrackDetails(id);
      await this.cacheProvider.store(cacheKey, result);
    }

    if (!result) {
      const cachedMsg = fromCache ? " (cached)" : "";
      throw new GetTrackDetailsError(
        `Unable to get track details for: ${id}${cachedMsg}.`,
      );
    }

    return result;
  }

  async getTrackFeatures(id: string): Promise<TrackFeatures> {
    const cacheKey = `trackFeatures_${id}`;
    const cacheItem = await this.cacheProvider.find<TrackFeatures>(cacheKey);

    let result: TrackFeatures | null;
    let fromCache = false;

    if (cacheItem) {
      result = cacheItem.data;
      fromCache = true;
    } else {
      result = await this.primaryProvider.findTrackFeatures(id);
      await this.cacheProvider.store(cacheKey, result);
    }

    if (!result) {
      const cachedMsg = fromCache ? " (cached)" : "";
      throw new GetTrackFeaturesError(
        `Unable to get track features for: ${id}${cachedMsg}.`,
      );
    }

    return result;
  }

  getEnrichedTrack(_id: string): Promise<EnrichedTrack> {
    throw new Error("not implemented");
  }
}
