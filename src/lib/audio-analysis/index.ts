import { TrackDetails } from "./track-details";
import { TrackFeatures } from "./track-features";

export class GetTrackDetailsError extends Error {}
export class GetTrackFeaturesError extends Error {}

export class AudioAnalysis {
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

  private async fetchMultipleTrackDetails(
    ids: string[],
  ): Promise<TrackDetails[]> {
    const baseUrl = "https://api.reccobeats.com/v1/track";
    const params = new URLSearchParams({ ids: ids.join(",") });
    const url = `${baseUrl}?${params.toString()}`;
    const response = await this.httpClient(url);

    if (!response.ok) {
      console.error(response);
      throw new Error(
        "An error occurred trying to fetch multiple track details.",
      );
    }

    return (await response.json()).content as TrackDetails[];
  }

  private async fetchMultipleTrackFeatures(
    ids: string[],
  ): Promise<TrackFeatures[]> {
    const baseUrl = "https://api.reccobeats.com/v1/audio-features";
    const params = new URLSearchParams({ ids: ids.join(",") });
    const url = `${baseUrl}?${params.toString()}`;
    const response = await this.httpClient(url);

    if (!response.ok) {
      console.error(response);
      throw new Error(
        "An error occurred trying to fetch multiple track features.",
      );
    }

    return (await response.json()).content as TrackFeatures[];
  }
}
