import { onMutation, waitForElem } from "../../lib/html";

import {
  getAccessToken,
  getCurrentlyPlayingTrack,
  getSeveralTracksWithAudioFeatures,
  getTrackAudioFeatures,
  TrackWithAudioFeatures,
} from "../../lib/spotify-api";

import {
  findTrackElementByTrackId,
  formatTrackDetails,
  getTrackIdsFromTrackElements,
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

  let elemTracks: Element[] = [];
  setInterval(async () => {
    if (elemTracks.length == 0) {
      return;
    }

    const maxTracks = 10;
    const elemTracksToProcess = elemTracks.slice(0, maxTracks);
    const elemTracksRemaining = elemTracks.slice(maxTracks);
    elemTracks = elemTracksRemaining; // Will be processed by the next interval to prevent 429 (Too Many Requests).

    const trackIds = getTrackIdsFromTrackElements(elemTracksToProcess);
    const enhancedTracks = await getSeveralTracksWithAudioFeatures(
      accessToken,
      trackIds,
    );

    enhancedTracks.forEach((enhancedTrack) => {
      const elemTrack = findTrackElementByTrackId(
        elemTracksToProcess,
        enhancedTrack.track.id,
      );

      if (!elemTrack) {
        console.warn(
          `Could not find matching track element for: ${enhancedTrack.track.name}.`,
          enhancedTrack,
        );
        return;
      }

      elemTrack.textContent = formatTrackDetails(
        enhancedTrack.track.name,
        enhancedTrack,
      );

      console.info(
        formatTrackDetails(
          `${enhancedTrack.track.name} by ${enhancedTrack.track.artists[0].name}`,
          enhancedTrack,
        ),
        enhancedTrack,
      );
    });
  }, 250); // Intentionally delay track processing to prevent 429 (Too Many Requests).

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
            if (!elemTrack) {
              console.warn("The row did not contain a track element.", elemRow);
              continue;
            }

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
