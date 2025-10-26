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
    const cacheItem = await this.cacheProvider.find(`trackDetails_${id}`);

    if (cacheItem) {
      return cacheItem.data as TrackDetails;
    }

    const result = await this.primaryProvider.findTrackDetails(id);

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
