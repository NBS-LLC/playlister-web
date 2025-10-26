import { CacheProvider } from "../storage/CacheProvider";
import { AudioAnalysisProvider } from "./AudioAnalysisProvider";
import { EnrichedTrack } from "./EnrichedTrack";
import { TrackDetails } from "./TrackDetails";
import { TrackFeatures } from "./TrackFeatures";

export class GetTrackDetailsError extends Error {}

export class AudioAnalyzer {
  constructor(
    private readonly primaryProvider: AudioAnalysisProvider,
    private readonly cacheProvider: CacheProvider,
  ) {}

  async getTrackDetails(id: string): Promise<TrackDetails> {
    const cacheKey = `trackDetails_${id}`;
    const cacheItem = await this.cacheProvider.find(cacheKey);

    if (cacheItem) {
      if (!cacheItem.data) {
        throw new GetTrackDetailsError(
          `Unable to get track details for: ${id} (cached).`,
        );
      }
      return cacheItem.data as TrackDetails;
    }

    const result = await this.primaryProvider.findTrackDetails(id);
    await this.cacheProvider.store(cacheKey, result);

    if (!result) {
      throw new GetTrackDetailsError(`Unable to get track details for: ${id}.`);
    }

    return result;
  }

  getTrackFeatures(_id: string): Promise<TrackFeatures> {
    throw new Error("not implemented");
  }

  getEnrichedTrack(_id: string): Promise<EnrichedTrack> {
    throw new Error("not implemented");
  }
}
