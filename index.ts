import {
  getAccessToken,
  getPlaylistId,
  getPlaylistItems,
  onMutation,
  updateNowPlayingWidget,
  waitForElem,
} from "./src/snp-af";

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
  console.log(playlistItems);
}

(async function () {
  main();
})();
