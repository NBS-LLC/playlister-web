import { CacheProvider } from "../storage/CacheProvider";
import { AudioAnalysisProvider } from "./AudioAnalysisProvider";
import { EnrichedTrack } from "./EnrichedTrack";
import { TrackDetails } from "./TrackDetails";
import { TrackFeatures } from "./TrackFeatures";

export class AudioAnalyzer implements AudioAnalysisProvider {
  constructor(
    private readonly primaryProvider: AudioAnalysisProvider,
    private readonly cacheProvider: CacheProvider,
  ) {}

  async getTrackDetails(id: string): Promise<TrackDetails> {
    const cacheItem = await this.cacheProvider.find(`trackDetails_${id}`);

    if (cacheItem) {
      return cacheItem.data as TrackDetails;
    }

    return await this.primaryProvider.getTrackDetails(id);
  }

  getTrackFeatures(id: string): Promise<TrackFeatures> {
    return this.primaryProvider.getTrackFeatures(id);
  }

  getEnrichedTrack(id: string): Promise<EnrichedTrack> {
    return this.primaryProvider.getEnrichedTrack(id);
  }
}
