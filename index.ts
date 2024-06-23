// ==UserScript==
// @name         Playlister
// @namespace    https://github.com/NBS-LLC/playlister-web
// @version      2024-06-19
// @description  Displays audio features for the "Now Playing" Spotify track
// @author       Nick Derevjanik
// @match        https://open.spotify.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=spotify.com
// @run-at       document_end
// @grant        none
// ==/UserScript==

import { onMutation, updateNowPlayingWidget, waitForElem } from "./src/snp-af";

async function main() {
  // Now Playing Widget

  const elemNowPlayingWidget = await waitForElem(
    '[data-testid="now-playing-widget"]',
  );

  await updateNowPlayingWidget(elemNowPlayingWidget);

  onMutation(elemNowPlayingWidget, async function (_mutation) {
    await updateNowPlayingWidget(elemNowPlayingWidget);
  });
}

(async function () {
  main();
})();
