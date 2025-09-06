import { EnrichedTrack } from "./EnrichedTrack";
import { TrackDetails } from "./TrackDetails";
import { TrackFeatures } from "./TrackFeatures";

export interface AudioAnalysisProvider {
  getTrackDetails(id: string): Promise<TrackDetails>;
  getTrackFeatures(id: string): Promise<TrackFeatures>;
  getEnrichedTrack(id: string): Promise<EnrichedTrack>;
}
