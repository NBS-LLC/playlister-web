import { AudioAnalysisProvider } from "./AudioAnalysisProvider";
import { CacheProvider } from "./CacheProvider";
import { EnrichedTrack } from "./EnrichedTrack";
import { TrackDetails } from "./TrackDetails";
import { TrackFeatures } from "./TrackFeatures";

export class AudioAnalyzer implements AudioAnalysisProvider {
  constructor(
    private readonly primaryProvider: AudioAnalysisProvider,
    private readonly cacheProvider?: CacheProvider,
  ) {}

  getTrackDetails(id: string): Promise<TrackDetails> {
    return this.primaryProvider.getTrackDetails(id);
  }

  getTrackFeatures(id: string): Promise<TrackFeatures> {
    return this.primaryProvider.getTrackFeatures(id);
  }

  getEnrichedTrack(id: string): Promise<EnrichedTrack> {
    return this.primaryProvider.getEnrichedTrack(id);
  }
}
