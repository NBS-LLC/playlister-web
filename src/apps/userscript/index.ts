import { onMutation, waitForElem } from "../../lib/html";

interface Artist {
  id: string;
  name: string;
  href: string;
}

interface TrackDetails {
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

interface TrackFeatures {
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

class GetTrackDetailsError extends Error {}

async function getTrackDetails(id: string): Promise<TrackDetails> {
  const trackDetails = (await fetchMultipleTrackDetails([id]))[0];

  if (!trackDetails) {
    throw new GetTrackDetailsError(`Unable to get track details for: ${id}.`);
  }

  return trackDetails;
}

class GetTrackFeaturesError extends Error {}

async function getTrackFeatures(id: string): Promise<TrackFeatures> {
  const trackDetails = (await fetchMultipleTrackFeatures([id]))[0];

  if (!trackDetails) {
    throw new GetTrackFeaturesError(`Unable to get track features for: ${id}.`);
  }

  return trackDetails;
}

class ParseTrackIdError extends Error {}

function parseNowPlayingHref(element: Element) {
  const nowPLayingHref = element.getAttribute("href") || "";
  const url = new URLSearchParams(nowPLayingHref);
  const uri = url.get("uri");

  const type = uri?.split(":")[1];
  const id = uri?.split(":")[2];

  if (type !== "track" || !id) {
    throw new ParseTrackIdError(`Unable to parse track id from: ${element}.`);
  }

  return id;
}

async function logNowPlayingTrack(element: Element) {
  const trackId = parseNowPlayingHref(element);
  console.log("now playing track:", trackId);
  console.log(await getTrackDetails(trackId));
  console.log(await getTrackFeatures(trackId));
}

async function main() {
  waitForElem(
    'aside[aria-label="Now playing view"] a[href*="spotify:track:"]',
  ).then(async (element) => {
    onMutation(element, async () => {
      await logNowPlayingTrack(element);
    });

    await logNowPlayingTrack(element);
  });
}

(async function () {
  await main();
})();
