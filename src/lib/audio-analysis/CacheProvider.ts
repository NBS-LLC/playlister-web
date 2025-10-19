import {
  AudioAnalysisKnown,
  AudioAnalysisUnknown,
} from "./AudioAnalysisProvider";
import { TrackDetails } from "./TrackDetails";
import { TrackFeatures } from "./TrackFeatures";

export type CacheItem =
  | {
      status: AudioAnalysisKnown;
      data: TrackDetails | TrackFeatures;
      expirationDateUtc: string;
    }
  | {
      status: AudioAnalysisUnknown;
      data: null;
      expirationDateUtc: string;
    };

export class NotCachedError extends Error {}
export class CacheExpiredError extends Error {}

export interface CacheProvider {
  getTrackDetails(id: string): Promise<TrackDetails>;
  storeTrackDetails(
    id: string,
    details: TrackDetails | AudioAnalysisUnknown,
  ): Promise<void>;

  getTrackFeatures(id: string): Promise<TrackFeatures>;
  storeTrackFeatures(
    id: string,
    features: TrackFeatures | AudioAnalysisUnknown,
  ): Promise<void>;
}
