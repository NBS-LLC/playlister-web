import { AsyncObjectStorage } from "../storage/AsyncObjectStorage";
import {
  AudioAnalysisUnknown,
  GetTrackDetailsError,
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

  prune(): Promise<void> {
    throw new Error("Method not implemented.");
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
      cacheItem = this.createCacheItemForUnknownTrackDetails();
    }

    await this.storage.setItem(this.getTrackDetailsKey(id), cacheItem);
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

  private createCacheItemForKnownTrackDetails(
    details: TrackDetails,
  ): CacheItem {
    return {
      status: "AUDIO_ANALYSIS_KNOWN",
      data: details,
      expirationDateUtc: this.getExpirationDateUtc(LONG_EXPIRATION_MS),
    };
  }

  private createCacheItemForUnknownTrackDetails(): CacheItem {
    return {
      status: "AUDIO_ANALYSIS_UNKNOWN",
      data: null,
      expirationDateUtc: this.getExpirationDateUtc(SHORT_EXPIRATION_MS),
    };
  }

  private getExpirationDateUtc(offsetInMs: number): string {
    return new Date(Date.now() + offsetInMs).toISOString();
  }

  private getTrackDetailsKey(id: string) {
    return `trackDetails_${id}`;
  }
}
