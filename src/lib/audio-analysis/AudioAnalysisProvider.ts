import { EnrichedTrack } from "./EnrichedTrack";
import { TrackDetails } from "./TrackDetails";
import { TrackFeatures } from "./TrackFeatures";

export class GetTrackDetailsError extends Error {}
export class GetTrackFeaturesError extends Error {}

export interface AudioAnalysisProvider {
  getTrackDetails(id: string): Promise<TrackDetails>;
  getTrackFeatures(id: string): Promise<TrackFeatures>;
  getEnrichedTrack(id: string): Promise<EnrichedTrack>;
}

export type AudioAnalysisKnown = "AUDIO_ANALYSIS_KNOWN";
export type AudioAnalysisUnknown = "AUDIO_ANALYSIS_UNKNOWN";
