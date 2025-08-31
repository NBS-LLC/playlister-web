class GetTrackDetailsError extends Error {}
class GetTrackFeaturesError extends Error {}

export interface TrackDetails {
  id: string;
  trackTitle: string;
  artists: Artist[];
  durationMs: number;
  isrc: string;
  ean: string;
  upc: string;
  href: string;
  availableCountries?: string;
  popularity: number;
}

export interface TrackFeatures {
  id: string;
  href: string;
  acousticness: number;
  danceability: number;
  energy: number;
  instrumentalness: number;
  key: number;
  liveness: number;
  loudness: number;
  mode: number;
  speechiness: number;
  tempo: number;
  valence: number;
}

interface Artist {
  id: string;
  name: string;
  href: string;
}

export async function getTrackDetails(id: string): Promise<TrackDetails> {
  const trackDetails = (await fetchMultipleTrackDetails([id]))[0];

  if (!trackDetails) {
    throw new GetTrackDetailsError(`Unable to get track details for: ${id}.`);
  }

  return trackDetails;
}

export async function getTrackFeatures(id: string): Promise<TrackFeatures> {
  const trackDetails = (await fetchMultipleTrackFeatures([id]))[0];

  if (!trackDetails) {
    throw new GetTrackFeaturesError(`Unable to get track features for: ${id}.`);
  }

  return trackDetails;
}

async function fetchMultipleTrackDetails(
  ids: string[],
): Promise<TrackDetails[]> {
  const baseUrl = "https://api.reccobeats.com/v1/track";
  const params = new URLSearchParams({ ids: ids.join(",") });
  const url = `${baseUrl}?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error(response);
    throw new Error(
      "An error occurred trying to fetch multiple track details.",
    );
  }

  return (await response.json()).content as TrackDetails[];
}

async function fetchMultipleTrackFeatures(
  ids: string[],
): Promise<TrackFeatures[]> {
  const baseUrl = "https://api.reccobeats.com/v1/audio-features";
  const params = new URLSearchParams({ ids: ids.join(",") });
  const url = `${baseUrl}?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error(response);
    throw new Error(
      "An error occurred trying to fetch multiple track features.",
    );
  }

  return (await response.json()).content as TrackFeatures[];
}
