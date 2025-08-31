import { onMutation, waitForElem } from "../../lib/html";

interface Artist {
  id: string;
  name: string;
  href: string;
}

interface Track {
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

async function findMultipleTrackDetails(ids: string[]): Promise<Track[]> {
  const baseUrl = "https://api.reccobeats.com/v1/track";
  const params = new URLSearchParams({ ids: ids.join(",") });
  const url = `${baseUrl}?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.log(response);
    throw new Error("An error occurred trying to retrieve tracks.");
  }

  return (await response.json()).content as Track[];
}

class GetTrackDetailsError extends Error {}

async function getTrackDetails(id: string): Promise<Track> {
  const trackDetails = (await findMultipleTrackDetails([id]))[0];

  if (!trackDetails) {
    throw new GetTrackDetailsError(`Unable to get track details for: ${id}.`);
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
