import { onMutation, waitForElem } from "../../lib/html";

import {
  getAccessToken,
  getCurrentlyPlayingTrack,
  getPlaylistItems,
  getSeveralAudioFeatures,
  getTrackAudioFeatures,
} from "../../lib/spotify-api";

import {
  combinePlaylistItemsWithAudioFeatures,
  getPlaylistContainer,
  getPlaylistId,
  TrackWithAudioFeatures,
  updateNowPlayingWidget,
  updatePlaylistWidget,
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

  // Playlist Widget

  waitForElem('[data-testid="playlist-tracklist"]').then(
    async (elemPlaylistWidget) => {
      const currentPlaylistId = await getPlaylistId();
      const playlistItems = await getPlaylistItems(
        accessToken,
        currentPlaylistId,
      );
      const tracks = playlistItems.map((item) => item.track);
      const audioFeatures = await getSeveralAudioFeatures(accessToken, tracks);

      const tracksWithAudioFeatures = combinePlaylistItemsWithAudioFeatures(
        playlistItems,
        audioFeatures,
      );

      updatePlaylistWidget(elemPlaylistWidget, tracksWithAudioFeatures);

      onMutation(
        getPlaylistContainer(elemPlaylistWidget),
        async function (_mutation) {
          updatePlaylistWidget(elemPlaylistWidget, tracksWithAudioFeatures);
        },
      );
    },
  );

  console.log("Reach the end of main!");
}

(async function () {
  await main();
  console.log("Reach the end of the userscript!");
})();
