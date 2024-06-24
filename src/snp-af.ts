import {
  getAccessToken,
  getCurrentTrack,
  getTrackAudioFeatures,
} from "./spotify";

export function waitForElem(selector: string): Promise<Element> {
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

export function onMutation(
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

export async function updateNowPlayingWidget(elemNowPlayingWidget: Element) {
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

type TrackAudioFeatures = {
  name: string;
  tempo: number;
};

async function _updatePlaylistWidget(
  elemPlaylistWidget: Element,
  playlistAudioFeatures: Map<string, TrackAudioFeatures>,
) {
  const elemsTracks = elemPlaylistWidget.querySelectorAll(
    'a[data-testid="internal-track-link"]',
  );

  elemsTracks.forEach((elem) => {
    const trackId = elem.getAttribute("href").replace("/track/", "");

    if (playlistAudioFeatures.has(trackId)) {
      const audioFeatures = playlistAudioFeatures.get(trackId);
      elem.textContent = audioFeatures.name + " (" + audioFeatures.tempo + ")";
    }
  });
}

function _getPlaylistContainer(elemPlaylistWidget: Element) {
  return elemPlaylistWidget.querySelector(
    '[role="presentation"]:nth-child(2) > [role="presentation"]:nth-child(2)',
  );
}

export async function getPlaylistId() {
  const elemPlaylistPage = await waitForElem('[data-testid="playlist-page"]');
  return elemPlaylistPage
    .getAttribute("data-test-uri")
    .replace("spotify:playlist:", "");
}

async function _main() {
  // Now Playing Widget

  const elemNowPlayingWidget = await waitForElem(
    '[data-testid="now-playing-widget"]',
  );

  await updateNowPlayingWidget(elemNowPlayingWidget);

  onMutation(elemNowPlayingWidget, async function (_mutation) {
    await updateNowPlayingWidget(elemNowPlayingWidget);
  });

  // Playlist Widget

  /*
  const elemPlaylistWidget = await waitForElem(
    '[data-testid="playlist-tracklist"]',
  );

  const accessToken = await getAccessToken();
  const playlistItems = await getPlaylistItems(
    accessToken,
    await getPlaylistId(),
  );

  // TODO: Use https://developer.spotify.com/documentation/web-api/reference/get-several-audio-features

  const playlistAudioFeatures = new Map<string, TrackAudioFeatures>();
  for (const item of playlistItems) {
    playlistAudioFeatures.set(item.track.id, {
      name: item.track.name,
      ...(await getTrackAudioFeatures(accessToken, item.track.id)),
    });
  }

  await updatePlaylistWidget(elemPlaylistWidget, playlistAudioFeatures);

  onMutation(
    getPlaylistContainer(elemPlaylistWidget),
    async function (_mutation) {
      await updatePlaylistWidget(elemPlaylistWidget, playlistAudioFeatures);
    },
  );
  */
}
