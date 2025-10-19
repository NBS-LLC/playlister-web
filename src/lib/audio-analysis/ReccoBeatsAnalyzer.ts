import { namespace } from "../log";
import {
  AudioAnalysisProvider,
  GetTrackDetailsError,
  GetTrackFeaturesError,
} from "./AudioAnalysisProvider";
import { EnrichedTrack } from "./EnrichedTrack";
import { TrackDetails } from "./TrackDetails";
import { TrackFeatures } from "./TrackFeatures";

export class ReccoBeatsAnalyzer implements AudioAnalysisProvider {
  private readonly baseUrl = "https://api.reccobeats.com/v1";

  constructor(
    readonly httpClient: (
      input: RequestInfo,
      init?: RequestInit,
    ) => Promise<Response>,
  ) {}

  async getTrackDetails(id: string): Promise<TrackDetails> {
    const trackDetails = (await this.fetchMultipleTrackDetails([id]))[0];

    if (!trackDetails) {
      throw new GetTrackDetailsError(`Unable to get track details for: ${id}.`);
    }

    return trackDetails;
  }

  async getTrackFeatures(id: string): Promise<TrackFeatures> {
    const trackDetails = (await this.fetchMultipleTrackFeatures([id]))[0];

    if (!trackDetails) {
      throw new GetTrackFeaturesError(
        `Unable to get track features for: ${id}.`,
      );
    }

    return trackDetails;
  }

  async getEnrichedTrack(id: string): Promise<EnrichedTrack> {
    const details = await this.getTrackDetails(id);
    const features = await this.getTrackFeatures(id);
    return new EnrichedTrack(id, details, features);
  }

  private async fetchMultipleTrackDetails(
    ids: string[],
  ): Promise<TrackDetails[]> {
    const params = new URLSearchParams({ ids: ids.join(",") });
    const url = `${this.baseUrl}/track?${params.toString()}`;
    const response = await this.httpClient(url);

    if (!response.ok) {
      console.error(namespace, response);
      throw new Error(
        "An error occurred trying to fetch multiple track details.",
      );
    }

    return (await response.json()).content as TrackDetails[];
  }

  private async fetchMultipleTrackFeatures(
    ids: string[],
  ): Promise<TrackFeatures[]> {
    const params = new URLSearchParams({ ids: ids.join(",") });
    const url = `${this.baseUrl}/audio-features?${params.toString()}`;
    const response = await this.httpClient(url);

    if (!response.ok) {
      console.error(namespace, response);
      throw new Error(
        "An error occurred trying to fetch multiple track features.",
      );
    }

    return (await response.json()).content as TrackFeatures[];
  }
}
