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

export interface CacheProvider {
  hasTrackDetails(id: string): Promise<boolean>;
  getTrackDetails(id: string): Promise<TrackDetails>;
  setTrackDetails(
    id: string,
    details: TrackDetails | AudioAnalysisUnknown,
  ): Promise<void>;

  hasTrackFeatures(id: string): Promise<boolean>;
  getTrackFeatures(id: string): Promise<TrackFeatures>;
  setTrackFeatures(
    id: string,
    features: TrackFeatures | AudioAnalysisUnknown,
  ): Promise<void>;
}
