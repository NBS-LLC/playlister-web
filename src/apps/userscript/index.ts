import { onMutation, waitForElem } from "../../lib/html";

import {
  getAccessToken,
  getCurrentlyPlayingTrack,
  getSeveralAudioFeatures,
  getSeveralTracks,
  getTrackAudioFeatures,
} from "../../lib/spotify-api";

import {
  formatTrackDetails,
  getTrackIdsFromTrackElements,
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
    const severalTracks = await getSeveralTracks(accessToken, trackIds);
    const severalAudioFeatures = await getSeveralAudioFeatures(
      accessToken,
      severalTracks,
    );

    const enhancedTracks = severalTracks.map((track) => {
      const audioFeatures = severalAudioFeatures.find(
        (item) => item.id === track.id,
      );

      if (!audioFeatures) {
        console.warn(
          `Could not find matching audio features for: ${track.name}.`,
          track,
        );
      }

      return { track, audioFeatures } as TrackWithAudioFeatures;
    });

    enhancedTracks.forEach((enhancedTrack) => {
      const elemTrack = elemTracksToProcess.find((item) => {
        const trackId = item.getAttribute("href").replace("/track/", "");
        return trackId === enhancedTrack.track.id;
      });

      if (!elemTrack) {
        console.warn(
          `Could not find matching track element for: ${enhancedTrack.track.name}`,
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
