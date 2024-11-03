import { onMutation, waitForElem } from "../../lib/html";

import {
  getAccessToken,
  getCurrentlyPlayingTrack,
  getTrackAudioFeatures,
} from "../../lib/spotify-api";

import {
  TrackWithAudioFeatures,
  updateNowPlayingWidget,
} from "../../lib/spotify-web";

async function getCurrentlyPlayingTrackDetails(
  accessToken: string,
): Promise<TrackWithAudioFeatures> {
  const currentTrack = await getCurrentlyPlayingTrack(accessToken);
  const trackAudioFeatures = await getTrackAudioFeatures(
    accessToken,
    currentTrack.id,
  );

  return {
    track: currentTrack,
    audioFeatures: trackAudioFeatures,
  };
}

async function main() {
  const accessToken = await getAccessToken();

  // Now Playing Widget

  waitForElem('[data-testid="now-playing-widget"]').then(
    async (elemNowPlayingWidget) => {
      try {
        updateNowPlayingWidget(
          elemNowPlayingWidget,
          await getCurrentlyPlayingTrackDetails(accessToken),
        );
      } catch (error) {
        console.warn("Unable to update the now playing widget.");
        console.warn("Will try again on mutation of the widget.");
        console.warn(error);
      }

      onMutation(elemNowPlayingWidget, async function (_mutation) {
        updateNowPlayingWidget(
          elemNowPlayingWidget,
          await getCurrentlyPlayingTrackDetails(accessToken),
        );
      });
    },
  );

  // Any Track List
  // TODO: [data-testid="track-list"] [data-testid="tracklist-row"] a[href*="/track"]

  onMutation(
    document.body,
    async (mutation) => {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          const elemRows = node.querySelectorAll(
            '[data-testid="tracklist-row"]',
          );
          for (const elemRow of elemRows) {
            const elemTrack = elemRow.querySelector('a[href*="/track"]');
            if (elemTrack.getAttribute("playlister:visited") === null) {
              elemTrack.textContent = "visited - " + elemTrack.textContent;
              console.log(elemTrack.textContent, elemTrack);
            }

            elemTrack.setAttribute("playlister:visited", "true");
          }
        }
      }
    },
    { childList: true, subtree: true },
  );
}

(async function () {
  await main();
})();
