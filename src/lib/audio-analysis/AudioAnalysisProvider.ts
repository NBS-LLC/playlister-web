import { TrackDetails } from "./TrackDetails";
import { TrackFeatures } from "./TrackFeatures";

export interface AudioAnalysisProvider {
  findTrackDetails(id: string): Promise<TrackDetails | null>;
  findTrackFeatures(id: string): Promise<TrackFeatures | null>;
}
