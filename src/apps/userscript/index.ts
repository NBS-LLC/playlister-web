import { onMutation, waitForElem } from "../../lib/html";

function parseNowPlayingHref(element: Element) {
  const nowPLayingHref = element?.getAttribute("href");
  return nowPLayingHref?.split(":")[2];
}

async function main() {
  waitForElem(
    'aside[aria-label="Now playing view"] a[href*="spotify:track:"]',
  ).then((element) => {
    onMutation(element, async () => {
      const trackId = parseNowPlayingHref(element);
      console.log("now playing track id:", trackId);
    });

    const trackId = parseNowPlayingHref(element);
    console.log("now playing track id:", trackId);
  });
}

(async function () {
  await main();
})();
