import { onMutation, waitForElem } from "./src/html";

import {
  getAccessToken,
  getCurrentlyPlayingTrack,
  getPlaylistItems,
  getSeveralAudioFeatures,
  getTrackAudioFeatures,
} from "./src/spotify-api";

import {
  combinePlaylistItemsWithAudioFeatures,
  getPlaylistContainer,
  getPlaylistId,
  TrackWithAudioFeatures,
  updateNowPlayingWidget,
  updatePlaylistWidget,
} from "./src/spotify-web";

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

  const elemNowPlayingWidget = await waitForElem(
    '[data-testid="now-playing-widget"]',
  );

  updateNowPlayingWidget(
    elemNowPlayingWidget,
    await getCurrentlyPlayingTrackDetails(accessToken),
  );

  onMutation(elemNowPlayingWidget, async function (_mutation) {
    updateNowPlayingWidget(
      elemNowPlayingWidget,
      await getCurrentlyPlayingTrackDetails(accessToken),
    );
  });

  // Playlist Widget

  const elemPlaylistWidget = await waitForElem(
    '[data-testid="playlist-tracklist"]',
  );

  const currentPlaylistId = await getPlaylistId();
  const playlistItems = await getPlaylistItems(accessToken, currentPlaylistId);
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
}

(async function () {
  main();
})();
