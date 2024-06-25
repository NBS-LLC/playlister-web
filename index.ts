import {
  combinePlaylistItemsWithAudioFeatures,
  getPlaylistContainer,
  getPlaylistId,
  onMutation,
  updateNowPlayingWidget,
  updatePlaylistWidget,
  waitForElem,
} from "./src/snp-af";
import {
  getAccessToken,
  getPlaylistItems,
  getSeveralAudioFeatures,
} from "./src/spotify";

async function main() {
  // Now Playing Widget

  const elemNowPlayingWidget = await waitForElem(
    '[data-testid="now-playing-widget"]',
  );

  await updateNowPlayingWidget(elemNowPlayingWidget);

  onMutation(elemNowPlayingWidget, async function (_mutation) {
    await updateNowPlayingWidget(elemNowPlayingWidget);
  });

  // Playlist Widget

  const elemPlaylistWidget = await waitForElem(
    '[data-testid="playlist-tracklist"]',
  );

  const accessToken = await getAccessToken();
  const currentPlaylistId = await getPlaylistId();
  const playlistItems = await getPlaylistItems(accessToken, currentPlaylistId);
  const tracks = playlistItems.map((item) => item.track);
  const audioFeatures = await getSeveralAudioFeatures(accessToken, tracks);

  const tracksWithAudioFeatures = combinePlaylistItemsWithAudioFeatures(
    playlistItems,
    audioFeatures,
  );

  await updatePlaylistWidget(elemPlaylistWidget, tracksWithAudioFeatures);

  onMutation(
    getPlaylistContainer(elemPlaylistWidget),
    async function (_mutation) {
      await updatePlaylistWidget(elemPlaylistWidget, tracksWithAudioFeatures);
    },
  );
}

(async function () {
  main();
})();
