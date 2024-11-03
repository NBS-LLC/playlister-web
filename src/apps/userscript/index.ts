import { onMutation, waitForElem } from "../../lib/html";

import {
  getAccessToken,
  getCurrentlyPlayingTrack,
  getTrack,
  getTrackAudioFeatures,
} from "../../lib/spotify-api";

import {
  formatTrackDetails,
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

  const elemTracks: Element[] = [];
  setInterval(async () => {
    const elemTrack = elemTracks.shift();
    if (!elemTrack) {
      return;
    }

    const trackId = elemTrack.getAttribute("href").replace("/track/", "");
    const track = await getTrack(accessToken, trackId);
    const audioFeatures = await getTrackAudioFeatures(accessToken, trackId);

    // TODO: Use getSeveralAudioFeatures() instead of making an API call for each track.

    elemTrack.textContent = formatTrackDetails(track.name, {
      track,
      audioFeatures,
    });

    console.info(
      formatTrackDetails(`${track.name} by ${track.artists[0].name}`, {
        track,
        audioFeatures,
      }),
      {
        track,
        audioFeatures,
      },
    );
  }, 250);

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
              elemTracks.push(elemTrack);
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
