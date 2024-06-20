// ==UserScript==
// @name         Spotify Now Playing Audio Features
// @namespace    https://github.com/NBS-LLC/playlister-web
// @version      2024-06-19
// @description  Displays audio features for the "Now Playing" Spotify track
// @author       Nick Derevjanik
// @match        https://open.spotify.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=spotify.com
// @run-at       document_end
// @grant        none
// ==/UserScript==

function waitForElem(selector: string): Promise<Element> {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((_mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

type MutationHandler = { (mutation: MutationRecord): Promise<void> };

function onMutation(
  targetElement: Element,
  callback: MutationHandler,
  config = {
    childList: true,
    attributes: true,
    characterData: true,
  },
) {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      callback(mutation);
    }
  });
  observer.observe(targetElement, config);
  return observer;
}

/**
 * Assumes the user is logged into Spotify (uses auth from cookies).
 */
async function getAccessToken() {
  const tokenResponse = await fetch(
    "https://open.spotify.com/get_access_token?reason=transport&productType=web_player",
  );

  return (await tokenResponse.json()).accessToken as string;
}

async function getCurrentTrack(accessToken: string) {
  const currentTrackResponse = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    { headers: { Authorization: "Bearer " + accessToken } },
  );

  return await currentTrackResponse.json();
}

async function getTrackAudioFeatures(accessToken: string, trackId: string) {
  const trackAudioFeaturesResponse = await fetch(
    "https://api.spotify.com/v1/audio-features/" + trackId,
    { headers: { Authorization: "Bearer " + accessToken } },
  );

  return await trackAudioFeaturesResponse.json();
}

async function updateNowPlayingWidget(elemNowPlayingWidget: Element) {
  const accessToken = await getAccessToken();
  const currentTrack = await getCurrentTrack(accessToken);
  const trackAudioFeatures = await getTrackAudioFeatures(
    accessToken,
    currentTrack.item.id,
  );

  console.log(
    currentTrack.item.name +
      " by " +
      currentTrack.item.artists[0].name +
      ": " +
      trackAudioFeatures.tempo,
  );

  const elemCurrentTrackName = elemNowPlayingWidget.querySelector(
    'a[data-testid="context-item-link"]',
  );

  elemCurrentTrackName.textContent =
    currentTrack.item.name + " (" + trackAudioFeatures.tempo + ")";
}

async function updatePlaylistWidget(elemPlaylistWidget: Element) {
  const elemsTracks = elemPlaylistWidget.querySelectorAll(
    'a[data-testid="internal-track-link"]',
  );

  elemsTracks.forEach((elem) => {
    const trackId = elem.getAttribute("href").replace("/track/", "");
    console.log(elem.textContent + ": " + trackId);
  });
}

function _getPlaylistContainer(elemPlaylistWidget: Element) {
  return elemPlaylistWidget.querySelector(
    '[role="presentation"]:nth-child(2) > [role="presentation"]:nth-child(2)',
  );
}

async function fetchNextPage(url: string, requestInit: RequestInit) {
  const response = await fetch(url, requestInit);
  const data = await response.json();
  return { currentPageData: data.items, nextPageUrl: data.next };
}

async function fetchAllData(baseUrl, requestInit: RequestInit, allData = []) {
  let nextPageUrl = baseUrl;
  while (nextPageUrl) {
    const { currentPageData, nextPageUrl: newNextPageUrl } =
      await fetchNextPage(nextPageUrl, requestInit);
    allData = allData.concat(currentPageData);
    nextPageUrl = newNextPageUrl;
  }
  return allData;
}

async function getPlaylistItems(accessToken: string, playlistId: string) {
  return await fetchAllData(
    "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks",
    { headers: { Authorization: "Bearer " + accessToken } },
  );
}

async function getPlaylistId() {
  const elemPlaylistPage = await waitForElem('[data-testid="playlist-page"]');
  return elemPlaylistPage
    .getAttribute("data-test-uri")
    .replace("spotify:playlist:", "");
}

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

  /**
   * TODO:
   * 1) Get the current playlist, [data-testid="playlist-page"].getAttribute('data-test-uri')
   * 2) Store audio features in hashmap based on track id
   * 3) Supply hashmap to update function
   * 4) Update track name by looking up audio features using href's track id
   */

  const accessToken = await getAccessToken();
  const playlistItems = await getPlaylistItems(
    accessToken,
    await getPlaylistId(),
  );

  console.log(playlistItems);

  await updatePlaylistWidget(elemPlaylistWidget);

  // onMutation(
  //   getPlaylistContainer(elemPlaylistWidget),
  //   async function (_mutation) {
  //     await updatePlaylistWidget(elemPlaylistWidget);
  //   },
  // );
}

(async function () {
  await main();
})();
