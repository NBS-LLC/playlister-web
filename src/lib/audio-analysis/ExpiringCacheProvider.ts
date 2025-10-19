import { AsyncObjectStorage } from "../storage/AsyncObjectStorage";
import {
  AudioAnalysisUnknown,
  GetTrackDetailsError,
  GetTrackFeaturesError,
} from "./AudioAnalysisProvider";
import {
  CacheExpiredError,
  CacheItem,
  CacheProvider,
  NotCachedError,
} from "./CacheProvider";
import { TrackDetails } from "./TrackDetails";
import { TrackFeatures } from "./TrackFeatures";

const SHORT_EXPIRATION_MS = 1 * 24 * 60 * 60 * 1000;
const LONG_EXPIRATION_MS = 90 * 24 * 60 * 60 * 1000;

export class ExpiringCacheProvider implements CacheProvider {
  constructor(private readonly storage: AsyncObjectStorage) {}

  async prune(): Promise<void> {
    const keys = await this.storage.keys();

    for (const key of keys) {
      try {
        const item: CacheItem | null = await this.storage.getItem(key);
        if (item && item.expirationDateUtc) {
          if (new Date() >= new Date(item.expirationDateUtc)) {
            await this.storage.removeItem(key);
          }
        }
      } catch {
        // Ignore malformed items
      }
    }
  }

  async getTrackDetails(id: string) {
    const result: CacheItem | null = await this.storage.getItem(
      this.getTrackDetailsKey(id),
    );

    if (!result) {
      throw new NotCachedError(`Track: ${id}, details not cached.`);
    }

    if (new Date() >= new Date(result.expirationDateUtc)) {
      this.storage.removeItem(this.getTrackDetailsKey(id));
      throw new CacheExpiredError(`Track: ${id}, has expired cache data.`);
    }

    if (result.status == "AUDIO_ANALYSIS_UNKNOWN") {
      throw new GetTrackDetailsError(
        `Track: ${id}, is cached but details are unknown.`,
      );
    }

    return result.data as TrackDetails;
  }

  async storeTrackDetails(
    id: string,
    details: TrackDetails | AudioAnalysisUnknown,
  ): Promise<void> {
    let cacheItem: CacheItem;

    if (details != "AUDIO_ANALYSIS_UNKNOWN") {
      cacheItem = this.createCacheItemForKnownTrackDetails(details);
    } else {
      cacheItem = this.createCacheItemForUnknownAnalysis();
    }

    await this.storage.setItem(this.getTrackDetailsKey(id), cacheItem);
  }

  async getTrackFeatures(id: string): Promise<TrackFeatures> {
    const key = this.getTrackFeaturesKey(id);
    const result: CacheItem | null = await this.storage.getItem(key);

    if (!result) {
      throw new NotCachedError(`Track: ${id}, features not cached.`);
    }

    if (new Date() >= new Date(result.expirationDateUtc)) {
      this.storage.removeItem(key);
      throw new CacheExpiredError(`Track: ${id}, has expired cache data.`);
    }

    if (result.status == "AUDIO_ANALYSIS_UNKNOWN") {
      throw new GetTrackFeaturesError(
        `Track: ${id}, is cached but features are unknown.`,
      );
    }

    return result.data as TrackFeatures;
  }

  async storeTrackFeatures(
    id: string,
    features: TrackFeatures | AudioAnalysisUnknown,
  ): Promise<void> {
    let cacheItem: CacheItem;

    if (features != "AUDIO_ANALYSIS_UNKNOWN") {
      cacheItem = this.createCacheItemForKnownTrackFeatures(features);
    } else {
      cacheItem = this.createCacheItemForUnknownAnalysis();
    }

    await this.storage.setItem(this.getTrackFeaturesKey(id), cacheItem);
  }

  private createCacheItemForKnownTrackDetails(data: TrackDetails): CacheItem {
    return {
      status: "AUDIO_ANALYSIS_KNOWN",
      data,
      expirationDateUtc: this.getExpirationDateUtc(LONG_EXPIRATION_MS),
    };
  }

  private createCacheItemForUnknownAnalysis(): CacheItem {
    return {
      status: "AUDIO_ANALYSIS_UNKNOWN",
      data: null,
      expirationDateUtc: this.getExpirationDateUtc(SHORT_EXPIRATION_MS),
    };
  }

  private createCacheItemForKnownTrackFeatures(data: TrackFeatures): CacheItem {
    return {
      status: "AUDIO_ANALYSIS_KNOWN",
      data,
      expirationDateUtc: this.getExpirationDateUtc(LONG_EXPIRATION_MS),
    };
  }

  private getExpirationDateUtc(offsetInMs: number): string {
    return new Date(Date.now() + offsetInMs).toISOString();
  }

  private getTrackDetailsKey(id: string) {
    return `trackDetails_${id}`;
  }

  private getTrackFeaturesKey(id: string) {
    return `trackFeatures_${id}`;
  }
}
