import { LibError } from "../error";
import { AudioAnalysisProvider } from "./AudioAnalysisProvider";
import { TrackDetails } from "./TrackDetails";
import { TrackFeatures } from "./TrackFeatures";

export class FetchMultipleTrackDetailsError extends LibError {}
export class FetchMultipleTrackFeaturesError extends LibError {}

export class ReccoBeatsAnalyzer implements AudioAnalysisProvider {
  private readonly baseUrl = "https://api.reccobeats.com/v1";

  constructor(
    readonly httpClient: (
      input: RequestInfo,
      init?: RequestInit,
    ) => Promise<Response>,
  ) {}

  async findTrackDetails(id: string): Promise<TrackDetails | null> {
    return (await this.fetchMultipleTrackDetails([id]))[0] || null;
  }

  async findTrackFeatures(id: string): Promise<TrackFeatures | null> {
    return (await this.fetchMultipleTrackFeatures([id]))[0] || null;
  }

  private async fetchMultipleTrackDetails(
    ids: string[],
  ): Promise<TrackDetails[]> {
    const params = new URLSearchParams({ ids: ids.join(",") });
    const url = `${this.baseUrl}/track?${params.toString()}`;
    const response = await this.httpClient(url);

    if (!response.ok) {
      throw new FetchMultipleTrackDetailsError(
        "An error occurred trying to fetch multiple track details.",
        { cause: response },
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
      throw new FetchMultipleTrackFeaturesError(
        "An error occurred trying to fetch multiple track features.",
        { cause: response },
      );
    }

    return (await response.json()).content as TrackFeatures[];
  }
}
