import {
  combinePlaylistItemsWithAudioFeatures,
  getPlaylistId,
  onMutation,
  updateNowPlayingWidget,
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

  const accessToken = await getAccessToken();
  const currentPlaylistId = await getPlaylistId();
  const playlistItems = await getPlaylistItems(accessToken, currentPlaylistId);
  const tracks = playlistItems.map((item) => item.track);
  const audioFeatures = await getSeveralAudioFeatures(accessToken, tracks);

  /**
   * TODO:
   * 1. √ Get all track ids
   * 2. √ Split track ids into groups of 100
   * 3. √ Get several audio features by groups of 100
   * 4. √ Concat all audio features into a single array
   * 5. √ Combine tracks with audio features (id, name, tempo)
   * 6. Update the playlist widget
   */

  const tracksWithAudioFeatures = combinePlaylistItemsWithAudioFeatures(
    playlistItems,
    audioFeatures,
  );

  console.log(tracksWithAudioFeatures);
}

(async function () {
  main();
})();
