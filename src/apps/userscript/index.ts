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

async function getTracks(ids: string[]): Promise<Track[]> {
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

function parseNowPlayingHref(element: Element) {
  const nowPLayingHref = element?.getAttribute("href");
  return nowPLayingHref?.split(":")[2];
}

async function main() {
  waitForElem(
    'aside[aria-label="Now playing view"] a[href*="spotify:track:"]',
  ).then(async (element) => {
    onMutation(element, async () => {
      const trackId = parseNowPlayingHref(element);
      if (trackId) {
        console.log("now playing track:", await getTracks([trackId]));
      }
    });

    const trackId = parseNowPlayingHref(element);
    if (trackId) {
      console.log("now playing track:", await getTracks([trackId]));
    }
  });
}

(async function () {
  await main();
})();
