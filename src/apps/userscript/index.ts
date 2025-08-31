import { getTrackDetails, getTrackFeatures } from "../../lib/audio-analysis";
import { onMutation, waitForElem } from "../../lib/html";

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
