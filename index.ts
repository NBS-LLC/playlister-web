import { chunk } from "./src/array";
import {
  getPlaylistId,
  onMutation,
  updateNowPlayingWidget,
  waitForElem,
} from "./src/snp-af";
import { getAccessToken, getPlaylistItems } from "./src/spotify";

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
  const trackIds = playlistItems.map((item) => item.track.id);
  const chunkedTrackIds = chunk(trackIds, 100);

  console.log(chunkedTrackIds);
}

(async function () {
  main();
})();
