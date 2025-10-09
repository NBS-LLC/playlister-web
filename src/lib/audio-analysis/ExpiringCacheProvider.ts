import { AudioAnalysisUnknown } from "./AudioAnalysisProvider";
import { CacheProvider } from "./CacheProvider";
import { TrackDetails } from "./TrackDetails";
import { TrackFeatures } from "./TrackFeatures";

const _SHORT_EXPIRATION_MS = 1 * 24 * 60 * 60 * 1000;
const _LONG_EXPIRATION_MS = 90 * 24 * 60 * 60 * 1000;

export class ExpiringCacheProvider implements CacheProvider {
  constructor(private readonly storage: Storage) {}

  prune(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async hasTrackDetails(id: string) {
    return Boolean(this.storage.getItem(`trackDetails_${id}`));
  }

  getTrackDetails(_id: string): Promise<TrackDetails> {
    throw new Error("Method not implemented.");
  }

  setTrackDetails(
    _id: string,
    _details: TrackDetails | AudioAnalysisUnknown,
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }

  hasTrackFeatures(_id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  getTrackFeatures(_id: string): Promise<TrackFeatures> {
    throw new Error("Method not implemented.");
  }

  setTrackFeatures(
    _id: string,
    _features: TrackFeatures | AudioAnalysisUnknown,
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
